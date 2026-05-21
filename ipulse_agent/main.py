import os
import sys
import json
import time
from gtts import gTTS
import config
from typing import Optional

# Add the current directory to path
sys.path.append(config.BASE_DIR)

from crew import create_video_crew
from agent_dialogue import (
    idea_kickoff, research_challenge, script_argue,
    visual_planner_review, media_generator_start,
    editor_final_review, pipeline_complete, pipeline_error
)


def assemble_video_with_audio(clips: list, voiceovers: list, output_filename: str) -> str:
    """
    Stitches multiple MP4 clips together and overlays a TTS generated audio track.
    Uses MoviePy to perform the operations.
    """
    try:
        from moviepy.editor import VideoFileClip, concatenate_videoclips, AudioFileClip
    except ImportError:
        print("[Editor & Reviewer Agent] MoviePy is not installed. Falling back to first clip only.")
        if clips:
            return clips[0]
        return ""

    print(f"[Editor & Reviewer Agent] Starting video assembly for {len(clips)} clips...")

    valid_clips = [c for c in clips if os.path.exists(c)]
    if not valid_clips:
        raise ValueError("[Editor & Reviewer Agent] No valid video clips found for assembly.")

    # 1. Compile voiceover to MP3 via gTTS
    full_voiceover_text = " ".join(voiceovers)
    if not full_voiceover_text:
        full_voiceover_text = "This is a video created automatically using iPulse Agent, Gemini, and Grok."

    tts_audio_path = os.path.join(config.FINAL_DIR, "voiceover_tts.mp3")
    print(f"[Editor & Reviewer Agent] Generating voiceover audio. Text preview: '{full_voiceover_text[:60]}...'")

    tts = gTTS(text=full_voiceover_text, lang='en')
    tts.save(tts_audio_path)

    # 2. Stitch video clips
    loaded_clips = []
    for path in valid_clips:
        try:
            loaded_clips.append(VideoFileClip(path))
        except Exception as clip_err:
            print(f"[Editor & Reviewer Agent] Error loading clip {path}: {clip_err}")

    if not loaded_clips:
        raise ValueError("[Editor & Reviewer Agent] Could not load any video clips in MoviePy.")

    print("[Editor & Reviewer Agent] Concatenating video segments...")
    final_video = concatenate_videoclips(loaded_clips, method="compose")

    # 3. Overlay audio
    if os.path.exists(tts_audio_path):
        try:
            audio_clip = AudioFileClip(tts_audio_path)
            if audio_clip.duration > final_video.duration:
                audio_clip = audio_clip.subclip(0, final_video.duration)
            final_video = final_video.set_audio(audio_clip)
            print("[Editor & Reviewer Agent] Audio track attached successfully.")
        except Exception as audio_err:
            print(f"[Editor & Reviewer Agent] Failed to attach audio: {audio_err}")

    # 4. Export final video
    output_path = os.path.join(config.FINAL_DIR, output_filename)
    print(f"[Editor & Reviewer Agent] Writing final video to: {output_path}")

    final_video.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        temp_audiofile="temp-audio.m4a",
        remove_temp=True
    )

    for clip in loaded_clips:
        clip.close()
    final_video.close()

    try:
        if os.path.exists(tts_audio_path):
            os.remove(tts_audio_path)
    except Exception as cleanup_err:
        print(f"[Editor & Reviewer Agent] Cleanup error: {cleanup_err}")

    print(f"[Editor & Reviewer Agent] Assembly completed. Final file: {output_path}")
    return output_path


def run_mock_pipeline(
    user_input: str,
    reason: str = "API keys not configured",
    intent: str = "creative",
    reference_image_path: Optional[str] = None,
) -> str:
    """
    High-fidelity simulated pipeline for when real APIs are unavailable.
    Produces personality-driven inter-agent dialogue for the live frontend terminal.
    """
    print(f"[iPulse Agent] WARNING: Running DEMO pipeline. Reason: {reason}")
    print("[iPulse Agent] DEMO_MODE: true")

    has_image = bool(reference_image_path)
    include_research = intent in ("research", "self_directed")

    # ── Step 1: Idea Generator ─────────────────────────────────────────────
    time.sleep(0.5)
    idea_kickoff(user_input, intent)
    time.sleep(0.8)

    if include_research:
        print(f"[Idea Generator Agent] @Research Agent — I've locked in the concept. "
              f"This request needs factual validation. Please query your databases and "
              f"cross-reference any stats before @Script Writer & Voiceover Agent touches the brief.")
    else:
        print(f"[Idea Generator Agent] @Research Agent — Stand down on this one. "
              f"Pure creative brief, no factual claims to verify. "
              f"@Script Writer & Voiceover Agent — you're up. Make it emotional and punchy.")
    time.sleep(0.7)

    # ── Step 2 (conditional): Research Agent ──────────────────────────────
    research_challenge(concept=user_input[:60], skip=not include_research)
    time.sleep(0.6)

    if include_research:
        if intent == "self_directed":
            print(f"[Research Agent] Autonomous research mode activated. Scanning trending topics "
                  f"related to: '{user_input[:60]}'. Found 3 high-momentum angles.")
        else:
            print(f"[Research Agent] Fact-check complete. Key data points confirmed: "
                  f"1) High search momentum (+120% MoM), "
                  f"2) Cross-referenced against 4 sources, "
                  f"3) No unverified claims detected in the brief. "
                  f"@Script Writer & Voiceover Agent — here's your research outline. "
                  f"Don't water down the stats in the voiceover.")
        time.sleep(1.0)

    # ── Step 3: Script Writer ──────────────────────────────────────────────
    script_argue(has_research=include_research)
    time.sleep(1.0)

    script_data = {
        "scenes": [
            {
                "num": 1,
                "prompt": (
                    f"Cinematic establishing shot for: {user_input[:80]}. "
                    + ("Animate the character from the reference image — same face, same style. " if has_image else "")
                    + "Glowing cyan neural network expanding, dark background, 8K."
                ),
                "voiceover": f"Welcome to the future. Today we explore: {user_input[:60]}."
            },
            {
                "num": 2,
                "prompt": (
                    "Close-up of an advanced robotic hand writing code in mid-air, "
                    "neon-lit interface, cyber aesthetic, ultra-detailed."
                ),
                "voiceover": "Artificial intelligence is rewriting the rules. Multi-agent systems lead the charge."
            },
            {
                "num": 3,
                "prompt": (
                    "Wide shot of a futuristic city skyline with holographic displays, "
                    "flying vehicles, golden hour lighting, cinematic."
                ),
                "voiceover": "The age of autonomous agents is here. Are you ready to build the future?"
            }
        ]
    }

    script_path = os.path.join(config.SCRIPTS_DIR, f"script_{int(time.time())}.json")
    with open(script_path, "w") as f:
        json.dump(script_data, f, indent=4)
    time.sleep(0.8)
    print(f"[Script Writer & Voiceover Agent] Script saved: {script_path}")
    print(f"[Script Writer & Voiceover Agent] @Visual Planner Agent — 3 scenes ready. "
          f"I've pushed for strong emotional beats on each transition. "
          f"Scene 1 hook is tight. Don't let the cinematography flatten it.")

    # ── Step 4: Visual Planner ────────────────────────────────────────────
    time.sleep(0.8)
    visual_planner_review(num_scenes=len(script_data["scenes"]))
    time.sleep(0.6)

    for scene in script_data["scenes"]:
        print(f"[Visual Planner Agent] Scene {scene['num']} prompt engineered: \"{scene['prompt']}\"")
        time.sleep(0.4)

    if has_image:
        print(f"[Visual Planner Agent] @Media Generator Agent — reference image is at: "
              f"{reference_image_path or '[user upload]'}. "
              f"Use generate_first_clip with image_path for Scene 1. Non-negotiable.")
    else:
        print(f"[Visual Planner Agent] @Media Generator Agent — storyboard locked. "
              f"Execute prompts as specified. Don't improvise on the style keywords.")

    # ── Step 5: Media Generator ───────────────────────────────────────────
    time.sleep(1.0)
    media_generator_start(num_scenes=len(script_data["scenes"]), has_image=has_image)

    generated_clips = []
    voiceovers = []

    for scene in script_data["scenes"]:
        time.sleep(0.5)
        if scene["num"] == 1 and has_image:
            print(f"[Media Generator Agent] [Grok API] Scene 1 [1/2]: Image-to-video request. "
                  f"Seeding from reference image. Prompt: '{scene['prompt'][:50]}...'")
        else:
            print(f"[Media Generator Agent] [Grok API] Scene {scene['num']} [1/2]: "
                  f"Requesting 5s base video. Prompt: '{scene['prompt'][:50]}...'")
        time.sleep(0.7)
        print(f"[Media Generator Agent] [Grok API] Task queued. ID: grok_task_gen_{scene['num']}. Polling status...")
        time.sleep(0.5)
        print(f"[Media Generator Agent] [Grok API] Polling... Attempt 1: Status = pending")
        time.sleep(0.5)
        print(f"[Media Generator Agent] [Grok API] Polling... Attempt 2: Status = done")
        time.sleep(0.4)
        print(f"[Media Generator Agent] [Grok API] Success! Scene {scene['num']} base clip downloaded. "
              f"Saved to: videos/clip_start_{scene['num']}.mp4")

        time.sleep(0.5)
        print(f"[Media Generator Agent] [Grok API] Scene {scene['num']} [2/2]: "
              f"Requesting 5s extension from last frame...")
        time.sleep(0.7)
        print(f"[Media Generator Agent] [Grok API] Extension task queued. "
              f"ID: grok_task_ext_{scene['num']}. Polling status...")
        time.sleep(0.5)
        print(f"[Media Generator Agent] [Grok API] Polling... Attempt 1: Status = done")
        time.sleep(0.4)
        print(f"[Media Generator Agent] [Grok API] Success! Scene {scene['num']} extension clip downloaded. "
              f"Saved to: videos/clip_ext_{scene['num']}.mp4")

        clip_name = f"mock_clip_{scene['num']}_{int(time.time())}.mp4"
        clip_path = os.path.join(config.VIDEOS_DIR, clip_name)
        with open(clip_path, "wb") as f:
            f.write(b"\x00" * 1024)
        generated_clips.append(clip_path)
        voiceovers.append(scene["voiceover"])

    time.sleep(0.7)
    print(f"[Media Generator Agent] All {len(script_data['scenes'])*2} clips synthesized. "
          f"@Editor & Reviewer Agent — materials handed off. Quality is within spec.")

    # ── Step 6: Editor ─────────────────────────────────────────────────────
    time.sleep(1.0)
    editor_final_review()
    time.sleep(0.8)

    print("[Editor & Reviewer Agent] Clip sequence: "
          + " → ".join(f"[clip_start_{s['num']} + clip_ext_{s['num']}]" for s in script_data["scenes"]))
    time.sleep(0.8)
    print("[Editor & Reviewer Agent] Generating TTS audio track from voiceover text...")
    time.sleep(0.7)
    print("[Editor & Reviewer Agent] Overlaying narration audio, matching scene durations...")
    time.sleep(0.8)

    # Locate a real sample video from public dir for demo playback
    import shutil
    sample_video_path = None
    public_dir = os.path.abspath(os.path.join(config.BASE_DIR, "..", "public"))
    for sample in ["0521.mp4", "c_e_be_c_b_be_emp_.mp4", "0519.mp4", "0520.mp4"]:
        full_path = os.path.join(public_dir, sample)
        if os.path.exists(full_path):
            sample_video_path = full_path
            break

    final_path = os.path.join(config.FINAL_DIR, f"final_mock_video_{int(time.time())}.mp4")

    if sample_video_path:
        try:
            shutil.copy2(sample_video_path, final_path)
            print(f"[Editor & Reviewer Agent] Using sample template for demo playback: {sample_video_path}")
        except Exception as copy_err:
            print(f"[Editor & Reviewer Agent] Could not copy sample: {copy_err}. Writing placeholder.")
            with open(final_path, "wb") as f:
                f.write(b"\x00" * 2048)
    else:
        with open(final_path, "wb") as f:
            f.write(b"\x00" * 2048)

    pipeline_complete(final_path, intent=intent, demo_mode=True)
    print(f"[iPulse Agent] Pipeline completed in DEMO mode. Reason: {reason}")
    return final_path


def main(
    user_input: str,
    intent: str = "creative",
    reference_image_path: Optional[str] = None,
) -> str:
    """
    Main entry point for the video content creator agent pipeline.

    Args:
        user_input: Cleaned, validated user prompt.
        intent: Classified intent — drives conditional agent routing.
        reference_image_path: Optional path to reference image for image-to-video.

    Returns:
        Path to the final assembled video file.
    """
    print(f"--- iPulse Agent Starting Video Content Creation ---")
    print(f"User Request: {user_input}")
    print(f"Intent: {intent} | Reference Image: {'YES' if reference_image_path else 'NO'}")

    # Force mock check
    if getattr(config, "FORCE_MOCK", False):
        return run_mock_pipeline(
            user_input, reason="FORCE_MOCK is enabled in config.py",
            intent=intent, reference_image_path=reference_image_path
        )

    # API key check
    if not config.GROK_API_KEY or not config.GOOGLE_API_KEY:
        return run_mock_pipeline(
            user_input, reason="API keys not configured",
            intent=intent, reference_image_path=reference_image_path
        )

    # Grok API pre-flight check
    try:
        import requests as _req
        _test = _req.get(
            "https://api.x.ai/v1/models",
            headers={"Authorization": f"Bearer {config.GROK_API_KEY}"},
            timeout=8
        )
        if _test.status_code == 403:
            _err = _test.json().get("error", "Unknown error")
            print(f"[iPulse Agent] Grok API pre-flight failed (403): {_err}")
            return run_mock_pipeline(
                user_input, reason=f"Grok API unavailable: {_err[:120]}",
                intent=intent, reference_image_path=reference_image_path
            )
        elif _test.status_code == 429:
            print("[iPulse Agent] Grok API rate-limited (429). Falling back to demo mode.")
            return run_mock_pipeline(
                user_input, reason="Grok API rate limit exceeded",
                intent=intent, reference_image_path=reference_image_path
            )
    except Exception as preflight_err:
        print(f"[iPulse Agent] Grok pre-flight check error: {preflight_err}")
        # Continue anyway — let CrewAI try

    try:
        # Build dynamic crew based on intent
        video_crew = create_video_crew(
            user_input,
            intent=intent,
            reference_image_path=reference_image_path
        )

        print("Executing CrewAI multi-agent sequence...")
        result = video_crew.kickoff()

        print("CrewAI execution finished successfully.")
        print(f"Raw Output: {result}")

        import glob
        clips = sorted(glob.glob(os.path.join(config.VIDEOS_DIR, "clip_*.mp4")), key=os.path.getmtime)

        if not clips:
            print("[iPulse Agent] No generated clips found. Falling back to demo pipeline.")
            return run_mock_pipeline(
                user_input, reason="Media Generator produced no clip files",
                intent=intent, reference_image_path=reference_image_path
            )

        voiceovers = [
            "This is the first segment of our AI video.",
            "This is the second segment of our AI video."
        ]

        output_filename = f"final_video_{int(time.time())}.mp4"
        final_video_path = assemble_video_with_audio(clips, voiceovers, output_filename)

        # Clean up temp reference image if it was saved by the API endpoint
        if reference_image_path and os.path.exists(reference_image_path):
            try:
                os.remove(reference_image_path)
                print(f"[iPulse Agent] Cleaned up temp reference image: {reference_image_path}")
            except Exception:
                pass

        return final_video_path

    except Exception as e:
        print(f"Exception during CrewAI pipeline execution: {e}")
        pipeline_error("Main Pipeline", str(e))
        return run_mock_pipeline(
            user_input, reason=f"CrewAI error: {str(e)[:120]}",
            intent=intent, reference_image_path=reference_image_path
        )


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="iPulse Video Agent")
    parser.add_argument("prompt", nargs="?", default="TikTok video about AI agents for beginners",
                        help="The user's video prompt")
    parser.add_argument("--intent", default="creative",
                        help="Classified prompt intent (creative|research|image_to_video|self_directed)")
    parser.add_argument("--image", default=None,
                        help="Path to a reference image file for image-to-video generation")

    args = parser.parse_args()

    final_output = main(args.prompt, intent=args.intent, reference_image_path=args.image)
    print(f"FINAL VIDEO GENERATED AT: {final_output}")
