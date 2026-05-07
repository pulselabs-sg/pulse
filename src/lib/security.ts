// src/lib/security.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

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

// Text to Speech
export const textToSpeechSchema = z.object({
  text: z.string().min(1).max(5000, "Text exceeds maximum allowed length of 5000 characters."),
  voiceId: z.string().optional().default('eve'),
  format: z.enum(['mp3', 'wav', 'ogg', 'pcm', 'ulaw']).optional().default('mp3'),
});

// Voice Changer
export const voiceChangerSchema = z.object({
  fileUrl: safeUrlSchema,
  fileName: z.string().min(1).max(255).optional().default('Uploaded Audio'),
  targetVoice: z.string().optional().default('eve'),
  format: z.enum(['mp3', 'wav', 'ogg']).optional().default('mp3'),
});

// Speech to Text
export const speechToTextSchema = z.object({
  fileUrl: safeUrlSchema,
  fileName: z.string().min(1).max(255).optional().default('Uploaded Audio'),
});

export const cleanAudioSchema = z.object({});

// Clone Voice
export const cloneVoiceSchema = z.object({
  fileUrl: safeUrlSchema,
  fileName: z.string().min(1).max(255).optional().default('Uploaded Audio'),
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
export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paddle.com https://checkout.paddle.com https://www.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.paddle.com; " +
    "img-src 'self' blob: data: https://*.vercel-storage.com https://lh3.googleusercontent.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://sandbox-checkout.paddle.com https://checkout.paddle.com; " +
    "connect-src 'self' https://*.vercel-storage.com https://api.x.ai https://*.paddle.com https://vercel.com; " +
    "media-src 'self' blob: https://*.vercel-storage.com;",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};