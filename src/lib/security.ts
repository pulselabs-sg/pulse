// src/lib/security.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPrisma } from './prisma';

// ==========================================
// 0. Security & Credit Constants
// ==========================================

export const CREDIT_COSTS = {
  CLONE_VOICE: 5000,
  TTS_PER_CHAR: 1,
  VOICE_CHANGER_PER_MIN: 1000,
} as const;

export const TIER_LIMITS = {
  FREE: { pulse: 20000, maxTTSChars: 5000, maxAudioMins: 5 },
  BASIC: { pulse: 60000, maxTTSChars: 5000, maxAudioMins: 5 },
  PREMIUM: { pulse: 150000, maxTTSChars: 10000, maxAudioMins: 10 },
  PRO: { pulse: 800000, maxTTSChars: 15000, maxAudioMins: 15 },
} as const;

// ==========================================
// 1. Zod Schemas
// ==========================================

const safeUrlSchema = z.string()
  .url("Invalid URL format")
  .refine((url) => url.startsWith('https://'), {
    message: "Only HTTPS URLs are allowed for security reasons.",
  })
  .refine((url) => {
    const allowedDomains = ['.vercel-storage.com', '.amazonaws.com', '.storage.googleapis.com'];
    try {
      const { hostname } = new URL(url);
      return allowedDomains.some(domain => hostname.endsWith(domain));
    } catch {
      return false;
    }
  }, {
    message: "URL domain is not whitelisted.",
  });

const safeFileNameSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9\s._-]+$/, "File name contains invalid characters.");

// Text to Speech
export const textToSpeechSchema = z.object({
  text: z.string().min(1).max(5000, "Text exceeds maximum allowed length of 5000 characters."),
  voiceId: z.string().optional().default('eve'),
  format: z.enum(['mp3', 'wav', 'ogg', 'pcm', 'ulaw']).optional().default('mp3'),
});

// Voice Changer
export const voiceChangerSchema = z.object({
  fileUrl: safeUrlSchema,
  fileName: safeFileNameSchema.optional().default('Uploaded Audio'),
  targetVoice: z.string().min(1).max(100).optional().default('eve'),
  format: z.enum(['mp3', 'wav', 'ogg']).optional().default('mp3'),
});

// Speech to Text
export const speechToTextSchema = z.object({
  fileUrl: safeUrlSchema,
  fileName: safeFileNameSchema.optional().default('Uploaded Audio'),
});

export const cleanAudioSchema = z.object({
  fileUrl: z.string().url("Invalid file URL").refine(
    (url) => url.startsWith('https://'),
    { message: "Only HTTPS URLs are allowed." }
  ),
  fileName: z.string().min(1).max(200).optional().default('audio.wav'),
});

// Clone Voice
export const cloneVoiceSchema = z.object({
  fileUrl: safeUrlSchema,
  fileName: safeFileNameSchema.optional().default('Uploaded Audio'),
});

// ==========================================
// 2. API Responses & Request Validation
// ==========================================

export function apiResponse(
  message: string | object,
  status: number = 200,
  headers: Record<string, string> = {}
) {
  const isObject = typeof message === 'object';
  const body = isObject ? message : { message };

  if (status >= 500 && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status, headers }
    );
  }

  return NextResponse.json(body, { status, headers });
}

export async function validateRequest<T>(
  req: Request,
  schema: z.Schema<T>
): Promise<{ data?: T; error?: NextResponse }> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        error: NextResponse.json(
          { error: 'Invalid request data', details: result.error.format() },
          { status: 400 }
        )
      };
    }

    return { data: result.data };
  } catch (err) {
    return {
      error: NextResponse.json(
        { error: 'Failed to parse request body' },
        { status: 400 }
      )
    };
  }
}
export async function validateCredits(userId: string, cost: number) {
  const prisma = getPrisma();
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, tier: true, usageCount: true }
  });

  if (!user) return { error: "User not found", status: 404 };

  const tier = (user.tier || 'FREE') as keyof typeof TIER_LIMITS;
  const limit = TIER_LIMITS[tier].pulse;

  if (user.usageCount + cost > limit) {
    return { error: "Pulse quota exceeded. Please upgrade your plan.", status: 429 };
  }

  return { data: { user, limit, tier } };
}

export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.lemonsqueezy.com https://app.lemonsqueezy.com https://www.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.lemonsqueezy.com; " +
    "img-src 'self' blob: data: https://*.vercel-storage.com https://lh3.googleusercontent.com https://www.gravatar.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://*.lemonsqueezy.com; " +
    "connect-src 'self' https://*.vercel-storage.com https://api.x.ai https://*.lemonsqueezy.com https://vercel.com https://*.modal.run; " +
    "media-src 'self' blob: https://*.vercel-storage.com;",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Permitted-Cross-Domain-Policies': 'none',
};