export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { textToSpeechSchema, apiResponse } from '@/lib/security';

const TIER_LIMITS = {
  FREE: { generations: 5, maxChars: 5000 },
  BASIC: { generations: 20, maxChars: 10000 },
  PREMIUM: { generations: 100, maxChars: 15000 },
  PRO: { generations: 300, maxChars: 15000 },
} as const;

export async function POST(req: Request) {
  const prisma = getPrisma();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      select: { id: true, tier: true, usageCount: true } 
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const body = await req.json().catch(() => ({}));
    const validation = textToSpeechSchema.safeParse(body);
    
    if (!validation.success) {
      return apiResponse({ error: 'Invalid request data', details: validation.error.format() }, 400);
    }

    const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
    const { text, voiceId, format } = validation.data;
    const limit = TIER_LIMITS[tier].generations;
    const maxChars = TIER_LIMITS[tier].maxChars;

    if (text.length > maxChars) {
      return apiResponse(`Text too long. Maximum ${maxChars} characters allowed.`, 413);
    }

    if (limit !== Infinity) {
      const updatedUser = await prisma.user.updateMany({
        where: { 
          id: user.id,
          usageCount: { lt: limit }
        },
        data: { usageCount: { increment: 1 } },
      });

      if (updatedUser.count === 0) {
        return new NextResponse("Quota exceeded. Please upgrade your plan.", { status: 429 });
      }
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('https://api.x.ai/v1/tts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text, 
          voice_id: voiceId, 
          language: 'auto',
          response_format: format 
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[X.AI TTS ERROR] Status: ${response.status}`, errorText);
        throw new Error("External API processing failed");
      }

      const audioBuffer = await response.arrayBuffer();
      
      const blob = await put(`tts/${user.id}/${Date.now()}.${format}`, audioBuffer, {
        access: 'public',
        contentType: format === 'wav' ? 'audio/wav' : 'audio/mpeg',
      });

      // --- TTS ---
      await prisma.history.create({
        data: {
          userId: user.id,
          type: 'tts',
          input: text.length > 80 ? text.substring(0, 80) + '...' : text,
          output: blob.url
        }
      });

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': format === 'wav' ? 'audio/wav' : 'audio/mpeg',
        'Content-Disposition': `attachment; filename="voice.${format}"`,
        'X-User-Usage': (user.usageCount + 1).toString(),
      },
    });

  } catch (fetchError: any) {
    throw fetchError;
  } finally {
    clearTimeout(timeoutId); 
  }

} catch (error: any) {
  const isTimeout = error.name === 'AbortError';
  console.error("[TTS_CRITICAL_ERROR]", error);

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
     await prisma.user.updateMany({
       where: { id: session.user.id, usageCount: { gt: 0 } },
       data: { usageCount: { decrement: 1 } }
     });
  }

  const clientMessage = isTimeout 
    ? "AI Engine is taking too long to respond. Please try again." 
    : "An internal error occurred during processing.";

  return apiResponse(clientMessage, isTimeout ? 504 : 500);
}
}