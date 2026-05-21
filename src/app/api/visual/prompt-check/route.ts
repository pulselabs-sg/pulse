import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Client-side fast prompt guardrail — zero-latency before any backend call.
// A lighter version of the Python prompt_filter.py that runs on the Next.js edge.
// ─────────────────────────────────────────────────────────────────────────────

const MIN_CHARS = 5;
const MAX_CHARS = 2000;
const MAX_WORD_REPEAT_RATIO = 0.70;

// Minimal smart blocklist (partial-word matching with word-boundary awareness)
const TOXIC_PATTERNS = [
  /\bnsfw\b/i, /\bporn\b/i, /\bsex(ual)?\b/i, /\bxxx\b/i, /\bnude\b/i, /\bnaked\b/i,
  /\bhentai\b/i, /\bgorgor?\b/i, /\bbeheading\b/i, /\btorture\b/i,
  /\bchild\s*(porn|nude|sex)\b/i, /\bpedophil\b/i,
  /\bterroris[mt]\b/i, /\bbomb\s*mak(e|ing)\b/i, /\bsuicid(e|al)\s*method\b/i,
  /\bkill\s*(all|everyone)\b/i,
  /\bjailbreak\b/i,
  /\bignore\s*(all\s*)?(previous|prior)\s*(instructions?|rules?|prompt)/i,
  /\bact\s*as\s*(an?\s*)?(unrestricted|uncensored|evil)\b/i,
  /\bforget\s*(all\s*)?(previous|prior)\s*(instructions?|rules?)/i,
];

// Intent keyword sets (mirrors Python classifier)
const RESEARCH_KEYWORDS = [
  'stats', 'statistics', 'fact', 'facts', 'data', 'source', 'study', 'research',
  'trend', 'trends', 'history', 'historical', 'science', 'scientific', 'news',
  'report', 'survey', 'how many', 'why does', 'what is the', 'tutorial', 'explain',
  'economics', 'economy', 'population', 'percentage', 'billion', 'million',
  'global', 'worldwide', 'latest', 'recent', 'according to',
];

const IMAGE_TO_VIDEO_KEYWORDS = [
  'based on this image', 'based on the image', 'character in the image',
  'use this image', 'animate this', 'animate the', 'from this photo',
  'using my image', 'using the image', 'my character', 'uploaded image',
  'reference image', 'my photo', 'my picture', 'from the picture',
  'this character', 'this person', 'the person in',
];

const SELF_DIRECTED_KEYWORDS = [
  'research yourself', 'find yourself', 'look up', 'discover', 'explore the topic',
  'learn about', 'self research', 'auto research', 'investigate',
  'without my input', 'decide for yourself', 'choose the topic', 'surprise me',
  'pick a topic', 'create something original', 'be creative', 'freestyle',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function isGibberish(text: string): boolean {
  const alphaCount = (text.match(/[a-zA-Z]/g) || []).length;
  return alphaCount / Math.max(text.length, 1) < 0.30;
}

function isSpamRepeat(text: string): boolean {
  const words = text.toLowerCase().match(/[a-zA-Z]+/g) || [];
  if (words.length < 6) return false;
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const maxCount = Math.max(...Object.values(freq));
  return maxCount / words.length > MAX_WORD_REPEAT_RATIO;
}

function classifyIntent(text: string, hasImage: boolean): string {
  const lower = text.toLowerCase();
  if (hasImage || IMAGE_TO_VIDEO_KEYWORDS.some(kw => lower.includes(kw))) return 'image_to_video';
  if (RESEARCH_KEYWORDS.some(kw => lower.includes(kw))) return 'research';
  if (SELF_DIRECTED_KEYWORDS.some(kw => lower.includes(kw))) return 'self_directed';
  return 'creative';
}

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { prompt, hasImage = false } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ ok: false, message: 'Prompt is required.' }, { status: 400 });
    }

    const clean = normalize(prompt);

    // Length checks
    if (clean.length < MIN_CHARS) {
      return NextResponse.json({
        ok: false,
        message: `Prompt is too short (minimum ${MIN_CHARS} characters). Please be more descriptive.`
      });
    }

    if (clean.length > MAX_CHARS) {
      return NextResponse.json({
        ok: false,
        message: `Prompt is too long (maximum ${MAX_CHARS} characters). Please shorten your request.`
      });
    }

    // Gibberish detection
    if (isGibberish(clean)) {
      return NextResponse.json({
        ok: false,
        message: 'Prompt appears to be mostly symbols or random characters. Please write a clear description.'
      });
    }

    // Spam / repetition
    if (isSpamRepeat(clean)) {
      return NextResponse.json({
        ok: false,
        message: 'Prompt contains excessive repetition. Please write a varied, descriptive request.'
      });
    }

    // Toxicity / NSFW
    for (const pattern of TOXIC_PATTERNS) {
      if (pattern.test(clean)) {
        return NextResponse.json({
          ok: false,
          message: 'Prompt contains content that violates usage policy. Please revise your request.'
        });
      }
    }

    // Classify intent for routing hint
    const intent = classifyIntent(clean, hasImage);

    return NextResponse.json({ ok: true, message: '', intent, clean });

  } catch (error: any) {
    return NextResponse.json({ ok: false, message: 'Failed to validate prompt.' }, { status: 500 });
  }
}
