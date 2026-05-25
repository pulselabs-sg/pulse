export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Vercel function timeout cap (seconds)

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { apiResponse, validateRequest, cleanAudioSchema, validateCredits, TIER_LIMITS } from '@/lib/security';
import { parseBuffer } from 'music-metadata';
import { del } from '@vercel/blob';
import { ratelimit } from '@/lib/ratelimit';

// Pulse cost: 1,000 pulse per minute of audio processed.
const PULSE_COST_PER_MIN = 1000;

// ---------------------------------------------------------------------------
// Modal endpoint helpers
// ---------------------------------------------------------------------------

function getModalHeaders(): Record<string, string> {
  const tokenId = process.env.MODAL_TOKEN_ID;
  const tokenSecret = process.env.MODAL_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error("Modal credentials not configured (MODAL_TOKEN_ID / MODAL_TOKEN_SECRET).");
  }
  return {
    'Modal-Key': tokenId,
    'Modal-Secret': tokenSecret,
  };
}

async function callDeepFilter(
  audioBuffer: ArrayBuffer,
  filename: string,
  signal: AbortSignal,
): Promise<ArrayBuffer> {
  const modalUrl = process.env.MODAL_CLEAN_AUDIO_URL;
  if (!modalUrl) {
    throw new Error("MODAL_CLEAN_AUDIO_URL is not set. Deploy modal_server/deepfilter.py and add the URL to .env.");
  }

  const form = new FormData();
  form.append('file', new Blob([audioBuffer]), filename);

  const res = await fetch(modalUrl, {
    method: 'POST',
    headers: getModalHeaders(),
    body: form,
    signal, // propagate timeout signal to the upstream fetch
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`DeepFilterNet service returned ${res.status}: ${detail.slice(0, 300)}`);
  }

  return res.arrayBuffer();
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const prisma = getPrisma();
  let pulseCost = 0;
  let session: any;
  let uploadedFileUrl = ''; // track for Blob cleanup in finally

  try {
    // ------------------------------------------------------------------
    // 1. Authentication
    // ------------------------------------------------------------------
    session = await getServerSession(authOptions);
    if (!session?.user?.id) return apiResponse("Unauthorized", 401);

    // ------------------------------------------------------------------
    // 2. Per-user rate limiting (consistent with TTS / Voice Changer)
    // ------------------------------------------------------------------
    if (ratelimit) {
      const { success } = await ratelimit.limit(`ratelimit_clean_${session.user.id}`);
      if (!success) return apiResponse("Too many clean-audio requests. Please slow down.", 429);
    }

    const validationCredit = await validateCredits(session.user.id, 0);
    if (validationCredit.error || !validationCredit.data) {
      return apiResponse(validationCredit.error || "Credit validation failed", validationCredit.status || 400);
    }

    const { user, tier } = validationCredit.data;
    const limits = TIER_LIMITS[tier];

    // ------------------------------------------------------------------
    // 3. Validate request body { fileUrl, fileName }
    // ------------------------------------------------------------------
    const { data: body, error: validationError } = await validateRequest(req, cleanAudioSchema);
    if (validationError) return validationError;

    const { fileUrl, fileName = 'audio.wav' } = body as { fileUrl: string; fileName?: string };
    if (!fileUrl) return apiResponse("No fileUrl provided.", 400);
    uploadedFileUrl = fileUrl;

    // ------------------------------------------------------------------
    // 4. Download the audio from Vercel Blob storage
    // ------------------------------------------------------------------
    const blobRes = await fetch(fileUrl);
    if (!blobRes.ok) return apiResponse("Failed to fetch audio file.", 400);

    const contentType = blobRes.headers.get('content-type') || 'audio/wav';
    const audioBuffer = await blobRes.arrayBuffer();

    // ------------------------------------------------------------------
    // 5. File size gate
    // ------------------------------------------------------------------
    const maxBytes = limits.maxFileMB * 1024 * 1024;
    if (audioBuffer.byteLength > maxBytes) {
      return apiResponse(`File too large. Maximum ${limits.maxFileMB} MB allowed for your plan.`, 413);
    }

    // ------------------------------------------------------------------
    // 6. Duration gate
    // ------------------------------------------------------------------
    let durationSeconds = 0;
    try {
      const metadata = await parseBuffer(new Uint8Array(audioBuffer), { mimeType: contentType });
      durationSeconds = metadata.format.duration ?? 0;
    } catch {
      console.warn('[clean-audio] Could not parse audio duration; skipping duration gate.');
    }

    if (durationSeconds > 0 && durationSeconds > limits.maxAudioMins * 60) {
      return apiResponse(
        `Audio too long. Maximum ${limits.maxAudioMins} minutes allowed for your plan.`,
        413,
      );
    }

    // ------------------------------------------------------------------
    // 7. Pulse quota — deduct optimistically (roll back on error)
    // ------------------------------------------------------------------
    pulseCost = durationSeconds > 0
      ? Math.ceil((durationSeconds / 60) * PULSE_COST_PER_MIN)
      : PULSE_COST_PER_MIN;

    const checkCredit = await validateCredits(session.user.id, pulseCost);
    if (checkCredit.error || !checkCredit.data) {
      return apiResponse(checkCredit.error || "Pulse quota exceeded. Please upgrade your plan.", checkCredit.status || 429);
    }
    const limit = checkCredit.data.limit;

    const updated = await prisma.user.updateMany({
      where: {
        id: user.id,
        usageCount: { lte: limit - pulseCost },
      },
      data: { usageCount: { increment: pulseCost } },
    });

    if (updated.count === 0) {
      return apiResponse("Pulse quota exceeded. Please upgrade your plan.", 429);
    }

    // ------------------------------------------------------------------
    // 8. Call DeepFilterNet v3 on Modal (with 90s abort timeout)
    // ------------------------------------------------------------------
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);

    let enhancedBuffer: ArrayBuffer;
    try {
      enhancedBuffer = await callDeepFilter(audioBuffer, fileName, controller.signal);
    } catch (fetchError: any) {
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    // ------------------------------------------------------------------
    // 9. Return enhanced WAV to the client
    // ------------------------------------------------------------------
    return new NextResponse(enhancedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `attachment; filename="cleaned_${fileName.replace(/\.[^.]+$/, '')}.wav"`,
        'X-User-Usage': (user.usageCount + pulseCost).toString(),
      },
    });

  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    console.error('[clean-audio] Error:', error);

    // Roll back Pulse deduction on unexpected failure
    if (session?.user?.id && pulseCost > 0) {
      await prisma.user.updateMany({
        where: { id: session.user.id, usageCount: { gte: pulseCost } },
        data: { usageCount: { decrement: pulseCost } },
      }).catch((e) => console.error('[clean-audio] Rollback failed:', e));
    }

    const clientMessage = isTimeout
      ? "Audio processing is taking too long. Please try a shorter file."
      : error.message || "Error processing audio.";

    return apiResponse(clientMessage, isTimeout ? 504 : 500);

  } finally {
    // Always delete the Blob file after processing (success or failure)
    // to avoid accumulating orphaned files in Vercel Blob storage.
    if (uploadedFileUrl) {
      await del(uploadedFileUrl).catch((e) =>
        console.error('[clean-audio] Blob cleanup failed:', e)
      );
    }
  }
}