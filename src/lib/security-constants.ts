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
} as const;

export const TIER_LIMITS = {
  FREE: { pulse: 20000, maxTTSChars: 5000, maxAudioMins: 5 },
  BASIC: { pulse: 60000, maxTTSChars: 5000, maxAudioMins: 5 },
  PREMIUM: { pulse: 150000, maxTTSChars: 10000, maxAudioMins: 10 },
  PRO: { pulse: 800000, maxTTSChars: 15000, maxAudioMins: 15 },
} as const;
