// src/lib/security-constants.ts

export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.polar.sh https://polar.sh https://www.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.polar.sh; " +
    "img-src 'self' blob: data: https://*.vercel-storage.com https://lh3.googleusercontent.com https://www.gravatar.com https://*.polar.sh; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "frame-src 'self' https://*.polar.sh; " +
    "connect-src 'self' https://*.vercel-storage.com https://api.x.ai https://*.polar.sh https://polar.sh https://vercel.com https://*.modal.run; " +
    "media-src 'self' blob: https://*.vercel-storage.com;",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-Permitted-Cross-Domain-Policies': 'none',
};

export const CREDIT_COSTS = {
  CLONE_VOICE: 5000,
  TTS_PER_CHAR: 1,
  VOICE_CHANGER_PER_MIN: 1000,
  IMAGE_GENERATION: 1500,
  VIDEO_480P_PER_SEC: 1200,
  VIDEO_720P_PER_SEC: 1500,
} as const;

export const TIER_LIMITS = {
  FREE: { pulse: 40000, maxTTSChars: 5000, maxAudioMins: 5, maxFileMB: 50 },
  BASIC: { pulse: 120000, maxTTSChars: 5000, maxAudioMins: 5, maxFileMB: 300 },
  PREMIUM: { pulse: 300000, maxTTSChars: 10000, maxAudioMins: 10, maxFileMB: 500 },
  PRO: { pulse: 1500000, maxTTSChars: 15000, maxAudioMins: 15, maxFileMB: 500 },
} as const;