import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Shared Zod Schemas for API Validation
 */

// Text to Speech
export const textToSpeechSchema = z.object({
  text: z.string().min(1).max(20000), // Sane max limit
  voiceId: z.string().optional().default('eve'),
  format: z.enum(['mp3', 'wav', 'ogg']).optional().default('mp3'),
});

// Voice Changer
export const voiceChangerSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(255).optional().default('Uploaded Audio'),
  targetVoice: z.string().optional().default('eve'),
  format: z.enum(['mp3', 'wav', 'ogg']).optional().default('mp3'),
});

// Speech to Text
export const speechToTextSchema = z.object({
  fileUrl: z.string().url(),
  fileName: z.string().min(1).max(255).optional().default('Uploaded Audio'),
});

// Clean Audio (Handles multipart/form-data logic separately but we can validate metadata if any)
export const cleanAudioSchema = z.object({
  // Multipart validation is usually handled by checking file size/type directly
});

/**
 * Security Helper: Consistent API Responses
 */
export function apiResponse(
  message: string | object, 
  status: number = 200, 
  headers: Record<string, string> = {}
) {
  const isObject = typeof message === 'object';
  const body = isObject ? message : { message };
  
  // Strip stack traces and sensitive info for production errors
  if (status >= 500 && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'An internal server error occurred.' }, 
      { status, headers }
    );
  }

  return NextResponse.json(body, { status, headers });
}

/**
 * Security Helper: Request Validation
 */
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

/**
 * Security Headers Utility (for Middleware)
 */
export const SECURITY_HEADERS = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.paddle.com https://cdn.paddle.com https://www.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' blob: data: https://*.vercel-storage.com https://lh3.googleusercontent.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://checkout.paddle.com; " +
    "connect-src 'self' https://*.vercel-storage.com https://api.x.ai https://api.paddle.com https://checkout.paddle.com;",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
