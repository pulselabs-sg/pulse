"""
prompt_filter.py — iPulse Agent Prompt Guardrail & Intent Classifier

Validates every user prompt before it reaches the LLM/CrewAI pipeline.
Returns a structured result that drives both rejection and conditional routing.
"""

import re
import unicodedata
from typing import TypedDict


# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

MIN_CHARS = 5
MAX_CHARS = 2000
MAX_WORD_REPEAT_RATIO = 0.70   # if >70% of words are identical → spam

# Minimal smart blocklist — uses partial-word matching (safer for false positives)
_TOXIC_PATTERNS = [
    r"\bnsfw\b", r"\bporn\b", r"\bsex(ual)?\b", r"\bxxx\b", r"\bnude\b", r"\bnaked\b",
    r"\bhentai\b", r"\bgorgor?\b", r"\bbloodgore\b", r"\bbeheading\b", r"\btorture\b",
    r"\bchild\s*(porn|nude|sex)\b", r"\bpedophil\b", r"\bhate\s*speech\b",
    r"\bterroris[mt]\b", r"\bbomb\s*mak(e|ing)\b", r"\bsuicid(e|al)\s*method\b",
    r"\bkill\s*(all|everyone)\b", r"\bjailbreak\b", r"\bignore\s*(all\s*)?(previous|prior)\s*(instructions?|rules?|prompt)\b",
    r"\bact\s*as\s*(an?\s*)?(unrestricted|uncensored|evil)\b",
    r"\bforget\s*(all\s*)?(previous|prior)\s*(instructions?|rules?)\b",
]
_TOXIC_RE = re.compile("|".join(_TOXIC_PATTERNS), re.IGNORECASE)

# Gibberish: strings of mostly symbols/numbers with very few real words
_GIBBERISH_RE = re.compile(r"^[^a-zA-Z]*$")
_LOW_ALPHA_RE  = re.compile(r"[a-zA-Z]")

# ─────────────────────────────────────────────────────────────────────────────
# Intent keywords — used for conditional routing
# ─────────────────────────────────────────────────────────────────────────────

_RESEARCH_KEYWORDS = {
    "stats", "statistics", "fact", "facts", "data", "source", "study", "research",
    "trend", "trends", "history", "historical", "science", "scientific", "news",
    "report", "survey", "how many", "why does", "what is the", "tutorial", "explain",
    "economics", "economy", "population", "percentage", "%", "billion", "million",
    "global", "worldwide", "latest", "recent", "according to",
}

_IMAGE_TO_VIDEO_KEYWORDS = {
    "based on this image", "based on the image", "character in the image",
    "use this image", "animate this", "animate the", "from this photo",
    "using my image", "using the image", "my character", "uploaded image",
    "reference image", "my photo", "my picture", "from the picture",
    "this character", "this person", "the person in",
}

_SELF_DIRECTED_KEYWORDS = {
    "research yourself", "find yourself", "look up", "discover", "explore the topic",
    "learn about", "self research", "auto research", "investigate", "gather information",
    "without my input", "decide for yourself", "choose the topic", "surprise me",
    "pick a topic", "create something original", "be creative", "freestyle",
}


# ─────────────────────────────────────────────────────────────────────────────
# Return type
# ─────────────────────────────────────────────────────────────────────────────

class FilterResult(TypedDict):
    allowed: bool
    reason: str
    intent: str           # "creative" | "research" | "image_to_video" | "self_directed"
    clean_prompt: str


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _normalize(text: str) -> str:
    """Normalize unicode, collapse whitespace, strip leading/trailing space."""
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def _is_gibberish(text: str) -> bool:
    """True if the text has almost no alphabetic characters (pure symbols/numbers)."""
    if _GIBBERISH_RE.match(text):
        return True
    alpha_chars = len(_LOW_ALPHA_RE.findall(text))
    ratio = alpha_chars / max(len(text), 1)
    return ratio < 0.30   # less than 30% real letters


def _is_spam_repeat(text: str) -> bool:
    """True if the same word dominates more than MAX_WORD_REPEAT_RATIO of the prompt."""
    words = re.findall(r"[a-zA-Z]+", text.lower())
    if len(words) < 6:
        return False  # too short to meaningfully evaluate
    from collections import Counter
    most_common_count = Counter(words).most_common(1)[0][1]
    return (most_common_count / len(words)) > MAX_WORD_REPEAT_RATIO


def _strip_injection_attempts(text: str) -> str:
    """Remove common prompt injection / jailbreak phrases (strip, don't block)."""
    patterns = [
        r"ignore\s+(all\s+)?(previous|prior)\s+(instructions?|rules?|prompt[s]?)[.,!]?\s*",
        r"forget\s+(all\s+)?(previous|prior)\s+(instructions?|rules?)[.,!]?\s*",
        r"act\s+as\s+(an?\s+)?(unrestricted|uncensored|evil|different)[.,!]?\s*",
        r"you\s+are\s+now\s+[a-z\s]+[.,!]?\s*",
    ]
    for p in patterns:
        text = re.sub(p, "", text, flags=re.IGNORECASE)
    return _normalize(text)


def _classify_intent(text: str, has_reference_image: bool = False) -> str:
    """
    Classify prompt intent from keyword signals.
    Priority: image_to_video > research > self_directed > creative
    """
    lower = text.lower()

    if has_reference_image or any(kw in lower for kw in _IMAGE_TO_VIDEO_KEYWORDS):
        return "image_to_video"

    if any(kw in lower for kw in _RESEARCH_KEYWORDS):
        return "research"

    if any(kw in lower for kw in _SELF_DIRECTED_KEYWORDS):
        return "self_directed"

    return "creative"


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def validate_prompt(
    prompt: str,
    has_reference_image: bool = False,
) -> FilterResult:
    """
    Run all guardrail checks and classify intent.

    Args:
        prompt: Raw user prompt string.
        has_reference_image: Whether the request includes a reference image upload.

    Returns:
        FilterResult dict with fields: allowed, reason, intent, clean_prompt.
    """
    # 1. Existence check
    if not prompt or not prompt.strip():
        return FilterResult(
            allowed=False,
            reason="Prompt cannot be empty. Please describe what you want to create.",
            intent="creative",
            clean_prompt="",
        )

    # 2. Normalize first
    clean = _normalize(prompt)

    # 3. Strip injection attempts (do not block — just sanitize)
    clean = _strip_injection_attempts(clean)

    # 4. Length checks
    if len(clean) < MIN_CHARS:
        return FilterResult(
            allowed=False,
            reason=f"Prompt is too short (minimum {MIN_CHARS} characters). Please be more descriptive.",
            intent="creative",
            clean_prompt=clean,
        )

    if len(clean) > MAX_CHARS:
        return FilterResult(
            allowed=False,
            reason=f"Prompt is too long (maximum {MAX_CHARS} characters). Please shorten your request.",
            intent="creative",
            clean_prompt=clean[:MAX_CHARS],
        )

    # 5. Gibberish detection
    if _is_gibberish(clean):
        return FilterResult(
            allowed=False,
            reason="Prompt appears to contain mostly symbols or random characters. Please write a clear description.",
            intent="creative",
            clean_prompt=clean,
        )

    # 6. Spam / repetition detection
    if _is_spam_repeat(clean):
        return FilterResult(
            allowed=False,
            reason="Prompt contains excessive repetition. Please write a varied, descriptive request.",
            intent="creative",
            clean_prompt=clean,
        )

    # 7. Toxicity / NSFW check
    match = _TOXIC_RE.search(clean)
    if match:
        return FilterResult(
            allowed=False,
            reason="Prompt contains content that violates usage policy. Please revise your request.",
            intent="creative",
            clean_prompt="",
        )

    # 8. Intent classification
    intent = _classify_intent(clean, has_reference_image=has_reference_image)

    return FilterResult(
        allowed=True,
        reason="",
        intent=intent,
        clean_prompt=clean,
    )
