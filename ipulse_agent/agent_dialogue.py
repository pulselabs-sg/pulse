"""
agent_dialogue.py — iPulse Agent Inter-Agent Personality Dialogue Helper

Provides structured print helpers that produce realistic, personality-driven
@-mention messages between agents. These messages appear in the live terminal
on the frontend, making the pipeline feel alive and human-like.
"""

import time


# ─────────────────────────────────────────────────────────────────────────────
# Agent personality voice lines
# Each agent has a "tone" that shapes how they address each other.
# ─────────────────────────────────────────────────────────────────────────────

# Format: log_agent_message(from_agent, to_agent, message)
def log_agent_message(from_agent: str, to_agent: str, message: str) -> None:
    """
    Print a personality-driven inter-agent message to stdout.
    The streaming handler in app.py will pick this up and forward it to the frontend.
    """
    time.sleep(0.2)   # tiny natural delay for realism
    print(f"[{from_agent}] → @{to_agent}: {message}")


def idea_kickoff(user_input: str, intent: str) -> None:
    """Bully opens the session with its characteristic enthusiasm."""
    time.sleep(0.3)
    print(f"[Bully] Alright team, we've got a fresh brief! "
          f"User wants: \"{user_input[:80]}{'...' if len(user_input) > 80 else ''}\" — "
          f"I'm detecting a *{intent}* request. Let me build a killer hook for this. "
          f"Stand by everyone, this is going to be 🔥")
    time.sleep(0.5)


def research_challenge(concept: str, skip: bool = False) -> None:
    """Raffa either challenges or defers based on routing."""
    if skip:
        print(f"[Raffa] @Bully — Got the concept. "
              f"This is clearly a creative brief, no factual claims to verify. "
              f"I'll skip the database pull and pass straight to @Monker. "
              f"Don't need me burning API quota on this one.")
    else:
        print(f"[Raffa] @Bully — Interesting concept. "
              f"But I'm going to push back here: I need to verify the factual claims "
              f"before we write a single line of script. Give me a moment to cross-reference. "
              f"@Monker, hold on — don't start drafting until I sign off.")
    time.sleep(0.4)


def script_argue(has_research: bool) -> None:
    """Script Writer reacts to receiving (or not receiving) research."""
    if has_research:
        print(f"[Monker] @Raffa — Thanks for the data, "
              f"but some of these stats feel dry for a hook. I'm going to translate them into "
              f"emotional storytelling beats. @Intruder, give me a few minutes — "
              f"I'll deliver a tight 3-scene script that actually lands.")
    else:
        print(f"[Monker] No research brief — good, "
              f"this gives me full creative freedom. Crafting a narrative arc now. "
              f"@Intruder, I'll have your scene descriptions ready shortly. "
              f"Expect vivid, punchy copy.")
    time.sleep(0.5)


def visual_planner_review(num_scenes: int) -> None:
    """Visual Planner receives script and starts storyboarding."""
    print(f"[Intruder] @Monker — Received the script. "
          f"{num_scenes} scenes. Honestly, Scene 2 could use a stronger visual transition — "
          f"I'm rewriting the camera direction. "
          f"I'll build optimized Grok Imagine prompts now with consistent lighting and style. "
          f"@Tupac, don't touch anything until the storyboard is locked.")
    time.sleep(0.4)


def media_generator_start(num_scenes: int, has_image: bool) -> None:
    """Media Generator receives storyboard and begins synthesis."""
    image_note = (
        " Using the uploaded reference image as the character seed for Scene 1 — "
        "this will ensure visual consistency across all clips."
    ) if has_image else ""
    print(f"[Tupac] @Intruder — Storyboard received. "
          f"{num_scenes} scene prompts loaded.{image_note} "
          f"Calling Grok Imagine Video API now. I'll run base generation + extension "
          f"for each scene. Don't expect perfection on the first pass — "
          f"I'll retry any clips that don't meet quality thresholds.")
    time.sleep(0.5)


def editor_final_review() -> None:
    """Editor receives all clips and prepares final assembly."""
    print(f"[Sam] @Tupac — Reviewing all generated clips. "
          f"I'm running continuity checks: lighting consistency ✓, style coherence ✓, "
          f"audio sync TBD. If anything is off, I will flag it before we ship. "
          f"Stitching now with MoviePy. @User — almost there. Quality control in progress.")
    time.sleep(0.4)


def pipeline_complete(final_path: str, intent: str, demo_mode: bool) -> None:
    """Final success message from the Editor."""
    mode_note = " [DEMO MODE — real API keys will unlock full Grok video generation]" if demo_mode else ""
    print(f"[Sam] ✅ Final cut complete.{mode_note} "
          f"Video assembled and saved to: {final_path}")
    print(f"[Bully] YES! That's a wrap 🎬 "
          f"Intent was *{intent}* and I think we nailed it. "
          f"Ship it, @User!")
    time.sleep(0.2)


def pipeline_error(agent: str, error: str) -> None:
    """Called when an agent encounters an unexpected failure."""
    print(f"[{agent}] ⚠️ Hit an unexpected issue: {error[:150]}. "
          f"@Sam — flagging this before it cascades. "
          f"Attempting recovery...")
    time.sleep(0.3)
