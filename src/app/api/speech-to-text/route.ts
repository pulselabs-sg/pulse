export const dynamic = 'force-dynamic';
export const maxDuration = 60;
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

const TIER_LIMITS = {
  FREE: { generations: 5, maxFileMB: 50 },
  BASIC: { generations: 20, maxFileMB: 300 },
  PREMIUM: { generations: 100, maxFileMB: 500 },
  PRO: { generations: 300, maxFileMB: 500 },
} as const;

export async function POST(req: Request) {
  const prisma = getPrisma();
  let uploadedFileUrl = '';

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, tier: true, usageCount: true }
    });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
    const limit = tier === 'PREMIUM' || tier === 'PRO' ? Infinity : TIER_LIMITS[tier].generations;
    const body = await req.json();
    const { fileUrl, fileName = 'Uploaded Audio' } = body;

    if (!fileUrl) {
      return new NextResponse("No audio file URL provided", { status: 400 });
    }
    uploadedFileUrl = fileUrl;

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

    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error("Failed to fetch file from storage");
    const fileBlob = await fileRes.blob();

    const xaiFormData = new FormData();
    xaiFormData.append('file', fileBlob, 'audio.mp3');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('https://api.x.ai/v1/stt', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.XAI_API_KEY}` },
        body: xaiFormData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[X.AI STT ERROR] Status: ${response.status}`, errorText);
        throw new Error("External API processing failed");
      }

      const data = await response.json();
      let finalText = data.text;

      try {
        const formatResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "grok-4-1-fast-reasoning",
            messages: [
              { 
                role: "system", 
                content: "You are a professional editor. Take the raw text, add punctuation, capitalize proper nouns, and create line breaks for paragraphs. THE ULTIMATE RULE: ONLY return the formatted text, DO NOT add any other words like 'Here is...', 'Understood', etc." 
              },
              { role: "user", content: finalText }
            ],
            temperature: 0.1 
          })
        });

        if (formatResponse.ok) {
          const formatData = await formatResponse.json();
          if (formatData.choices?.[0]?.message?.content) {
            finalText = formatData.choices[0].message.content.trim(); 
          }
        } else {
          const errLog = await formatResponse.text();
          console.error("[FORMAT_TEXT_ERROR] API Grok failed:", errLog);
        }
      } catch (formatErr) {
        console.error("[FORMAT_TEXT_ERROR] Exception caught:", formatErr);
      }

      await prisma.history.create({
        data: {
          userId: user.id,
          type: 'stt',
          input: fileName,
          output: finalText 
        }
      });

      return NextResponse.json({ text: finalText }, {
        headers: { 'X-User-Usage': (user.usageCount + 1).toString() },
      });

    } catch (fetchError: any) {
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    console.error("[STT_CRITICAL_ERROR]", error);

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

    return new NextResponse(clientMessage, { status: isTimeout ? 504 : 500 });
  } finally {
    if (uploadedFileUrl) {
      try {
        await del(uploadedFileUrl);
      } catch (cleanupError) {
        console.error("[BLOB_CLEANUP_ERROR]", cleanupError);
      }
    }
  }
}