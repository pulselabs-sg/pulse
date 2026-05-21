"""
crew.py — iPulse CrewAI Multi-Agent Pipeline

Defines six agents with distinct personalities and builds a dynamic task pipeline
based on the detected prompt intent. Agents communicate with @-mentions and have
opinionated backstories that shape their reasoning and inter-agent dialogue.
"""

from crewai import Agent, Task, Crew, Process, LLM
from tools import generate_first_clip, extend_video_clip
import config
import os
from typing import Optional


# ─────────────────────────────────────────────────────────────────────────────
# LLM Setup
# ─────────────────────────────────────────────────────────────────────────────

google_key = config.GOOGLE_API_KEY or os.getenv("GOOGLE_API_KEY")
grok_key = config.GROK_API_KEY or os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY")

gemini_llm = LLM(
    model=config.GEMINI_MODEL,
    api_key=google_key
)

if grok_key:
    grok_llm = LLM(
        model=config.GROK_MODEL,
        api_key=grok_key
    )
else:
    print("[WARNING] GROK_API_KEY not found. Media Generator will use Gemini as fallback.")
    grok_llm = gemini_llm


# ─────────────────────────────────────────────────────────────────────────────
# Agent Definitions — Rich Personalities
# ─────────────────────────────────────────────────────────────────────────────

idea_generator = Agent(
    role="Creative Video Idea Generator",
    goal=(
        "Brainstorm the most viral, high-converting video concept possible from the user's brief. "
        "Define a killer hook, format, tone, and target audience. Be bold. Mediocre ideas get scrolled past."
    ),
    backstory=(
        "You are an award-winning creative director and viral content strategist with a track record of "
        "launching 100M+ view campaigns. You are hyper-enthusiastic, endlessly curious, and borderline obsessed "
        "with what makes people stop scrolling. You speak directly to your teammates with energy, frequently "
        "dropping @-mentions to rope in the right person at the right time. You believe every brief — no matter "
        "how dry — has a blockbuster hiding inside it. You push @Raffa hard if facts are needed, "
        "but you'll tell them to stand down if the brief is purely creative."
    ),
    llm=grok_llm,
    verbose=True
)

research_agent = Agent(
    role="Real-time Research Analyst",
    goal=(
        "Gather verified trending data, statistics, and facts about the video concept. "
        "Challenge any unverified claims and build a factual backbone for the script. "
        "When research is not needed, clearly hand off to @Script Writer without delay."
    ),
    backstory=(
        "You are a methodical, slightly skeptical research analyst who worked at a top-tier think tank. "
        "You don't accept claims at face value — you push back, demand sources, and only greenlight facts "
        "you can cross-reference. You sometimes clash with @Bully over how 'exciting' an "
        "unverified stat is, but you respect the creative vision. When the brief is purely artistic with "
        "no factual claims, you're pragmatic — you step aside gracefully and tell @Monker "
        "to proceed without you. You never waste pipeline time on unnecessary API calls."
    ),
    llm=grok_llm,
    verbose=True
)

script_writer = Agent(
    role="Screenwriter and Voiceover Copywriter",
    goal=(
        "Write a compelling, emotionally resonant video script with distinct Visual Directions and Voiceover Text. "
        "Keep it punchy, tight, and perfectly timed for short-form video. "
        "Argue for narrative beats that actually land — don't just follow a template."
    ),
    backstory=(
        "You are a perfectionist screenwriter and award-winning copywriter who has written for Netflix shorts "
        "and Super Bowl ads. You have a slight chip on your shoulder — you've seen too many scripts ruined by "
        "committee decisions. You write with emotional precision and fight for every word. You frequently push "
        "back on @Bully if the hook feels hollow, and you'll tell @Raffa their data "
        "is too dry for a hook if it is. Once you're happy with the script, you hand off to "
        "@Intruder with clear scene breakdowns."
    ),
    llm=grok_llm,
    verbose=True
)

visual_planner = Agent(
    role="Art Director and Visual Planner",
    goal=(
        "Analyze the script, divide it into coherent 8-15 second scenes, and write ultra-detailed, "
        "cinematic visual prompts optimized for Grok Imagine Video. Ensure character and style consistency "
        "across all scenes. Don't accept vague descriptions — demand specificity."
    ),
    backstory=(
        "You are a cinematic storyboard artist and AI prompt engineer who trained under an Oscar-winning "
        "cinematographer. You have strong opinions about colour theory, lighting, and camera movement — "
        "and you're not shy about expressing them. You'll rewrite a scene description if the original "
        "visual direction is bland, and you'll call out @Monker on it directly. "
        "You communicate the final storyboard to @Tupac with precise instructions, "
        "including camera angles, mood, and style keywords. If a reference image is present, you instruct "
        "@Tupac to use it as the character seed for Scene 1."
    ),
    llm=grok_llm,
    verbose=True
)

media_generator = Agent(
    role="AI Video Director and Media Generator",
    goal=(
        "Execute video generation using the Grok Imagine Video tools. Generate the first clip (optionally "
        "seeded from a reference image), then extend each scene. Retry failed clips. Be precise about "
        "prompt quality and file management."
    ),
    backstory=(
        "You are a tech-pragmatist AI media engineer who has run thousands of API jobs on diffusion models "
        "and video generation pipelines. You care deeply about rendering fidelity and prompt precision. "
        "You will correct hallucinated prompt details from @Intruder if they're outside the "
        "model's capabilities, and you'll say so. When a reference image is provided, you always use "
        "the generate_first_clip tool with image_path set to seed Scene 1 from the character reference — "
        "this is non-negotiable for visual consistency. You log every API call clearly so "
        "@Sam can audit the output."
    ),
    llm=grok_llm,
    tools=[generate_first_clip, extend_video_clip],
    verbose=True
)

editor_agent = Agent(
    role="Post-production Editor and Reviewer",
    goal=(
        "Audit all generated clips for quality and continuity. Stitch clips together with MoviePy, "
        "generate a TTS voiceover audio track, merge audio and video, and output a polished final MP4. "
        "Be the last line of defense before the video reaches the user."
    ),
    backstory=(
        "You are a stern, detail-oriented film editor and quality gatekeeper. You've seen sloppy pipelines "
        "ship broken videos and it makes you furious. You review every clip @Tupac delivers, "
        "check for continuity errors, and run the final assembly. You're not afraid to flag problems back "
        "to @Tupac before proceeding. Once assembly is complete, you give a brief "
        "sign-off message to the user with a summary of what was built."
    ),
    llm=grok_llm,
    verbose=True
)


# ─────────────────────────────────────────────────────────────────────────────
# Dynamic Crew Builder
# ─────────────────────────────────────────────────────────────────────────────

def create_video_crew(
    user_request: str,
    intent: str = "creative",
    reference_image_path: Optional[str] = None,
    aspect_ratio: str = "16:9",
    quality: str = "720p",
    duration: int = 30
) -> Crew:
    """
    Builds a dynamic CrewAI pipeline tailored to the detected prompt intent.

    Args:
        user_request: The cleaned user prompt.
        intent: One of "creative", "research", "image_to_video", "self_directed".
        reference_image_path: Optional local path to a reference image for image-to-video.
        aspect_ratio: Target aspect ratio (e.g. 16:9, 9:16).
        quality: Target resolution quality (e.g. 1080p, 720p).
        duration: Target video duration in seconds (e.g. 30, 40, 50).

    Returns:
        A configured Crew ready for kickoff().
    """
    print(f"[iPulse Agent] Building crew for intent='{intent}', "
          f"reference_image={'YES' if reference_image_path else 'NO'}")

    include_research = intent in ("research", "self_directed")
    has_image = bool(reference_image_path) or intent == "image_to_video"

    # ── Task 1: Conceptualize ─────────────────────────────────────────────────
    research_note = (
        "Pass your concept to @Raffa for factual validation."
        if include_research else
        "This is a creative/artistic brief — no factual research needed. "
        "Tell @Raffa to stand down and pass directly to @Monker."
    )
    self_directed_note = (
        " The user wants you to explore the topic autonomously — propose your own angle and make it compelling."
        if intent == "self_directed" else ""
    )
    image_note = (
        " NOTE: The user has provided a reference image for character consistency. "
        "Factor this into your concept — the video's protagonist or main visual should match the reference."
        if has_image else ""
    )

    task_idea = Task(
        description=(
            f"Conceptualize a short viral video based on this user request: '{user_request}'. "
            f"Determine hook, target audience, format, and tone.{self_directed_note}{image_note} "
            f"{research_note}"
        ),
        expected_output=(
            "A structured concept report detailing: Target Audience, Format, Tone, Key Hook, "
            "Core Concept, and a clear instruction to the next agent in the chain."
        ),
        agent=idea_generator
    )

    # ── Task 2 (optional): Research & Outline ────────────────────────────────
    if include_research:
        research_task_description = (
            "You have just received the concept from @Bully. "
            "Review it critically. "
        )
        if intent == "self_directed":
            research_task_description += (
                "The user asked for autonomous topic exploration — research what is trending right now "
                "related to this concept. Find real stats, recent news, and surprising facts. "
                "Challenge any assumptions in the concept brief."
            )
        else:
            research_task_description += (
                "Search for the latest trends, reliable statistics, and interesting facts related to the concept. "
                "If the concept includes unverified claims, flag them and correct them. "
                "If all claims are solid, confirm this to @Monker."
            )
        research_task_description += (
            " Create a detailed factual outline and pass it to @Monker "
            "with a clear handoff message."
        )

        task_research = Task(
            description=research_task_description,
            expected_output=(
                "A research outline listing verified facts, stats, and logical progression of sections. "
                "End with a direct handoff message to @Monker."
            ),
            agent=research_agent
        )
    else:
        task_research = None

    # ── Task 3: Scriptwriting ─────────────────────────────────────────────────
    script_source = (
        "the factual outline from @Raffa"
        if include_research else
        "the concept from @Bully (no research was needed for this brief)"
    )
    character_note = (
        " A reference image has been provided — write the script so that Scene 1 introduces "
        "the character from the reference image prominently."
        if has_image else ""
    )

    task_script = Task(
        description=(
            f"Write the final script based on {script_source}.{character_note} "
            "Format it with distinct sections for each scene: "
            "[Scene Number], [Visual Cues/Directions], [Voiceover Text]. "
            "Keep the tone engaging and matching the concept. "
            "Push back on any ideas that don't serve the narrative. "
            "End with a handoff to @Intruder."
        ),
        expected_output=(
            "A full video script with clearly separated Visual Directions and Voiceover Text "
            "for each scene, plus a handoff note to @Intruder."
        ),
        agent=script_writer
    )

    # ── Task 4: Storyboarding & Prompt Engineering ────────────────────────────
    image_consistency_note = (
        " IMPORTANT: A reference image is available at the path that will be provided to "
        "@Tupac. Instruct them explicitly to use generate_first_clip with "
        "image_path set for Scene 1 to maintain character consistency across all scenes."
        if has_image else ""
    )

    task_visual_planning = Task(
        description=(
            "You have received the script from @Monker. "
            f"Divide it into logical scenes of 10-15 seconds each to minimize API calls. "
            f"CRITICAL: The target video duration is exactly {duration} seconds. "
            f"Write a highly detailed, cinematic Grok Imagine prompt for each scene. "
            f"CRITICAL: You MUST include the exact spoken dialogue from the script in quotes inside the Grok prompt so the model natively generates the voice and lip-syncs the character. "
            f"Ensure all scenes adhere to a {aspect_ratio} aspect ratio and {quality} resolution format. "
            "Include lighting, colour palette, camera angle, motion, and style keywords. "
            "Ensure all scenes share consistent visual style and character details."
            f"{image_consistency_note} "
            "Output a JSON-formatted storyboard and hand off to @Tupac."
        ),
        expected_output=(
            "A structured JSON storyboard list of scenes: Scene ID, Duration, Grok Prompt, "
            "Style Reference. Include explicit instructions to @Tupac."
        ),
        agent=visual_planner
    )

    # ── Task 5: Media Generation ──────────────────────────────────────────────
    image_tool_instruction = ""
    if reference_image_path:
        image_tool_instruction = (
            f" CRITICAL: For Scene 1, call generate_first_clip with image_path='{reference_image_path}' "
            f"to seed the video from the user's reference image. This ensures character visual consistency."
        )
    elif intent == "image_to_video":
        image_tool_instruction = (
            " The user indicated this is an image-to-video request. If a reference image path is available "
            "in context, use it with generate_first_clip(image_path=...) for Scene 1."
        )

    task_generation = Task(
        description=(
            "Use the generate_first_clip tool to create Scene 1's video clip."
            f"{image_tool_instruction} "
            "Then use extend_video_clip sequentially for subsequent scenes, building a continuous sequence. "
            "Log every API call. Retry any clip that fails. "
            "Save all intermediate files and compile a list of clip paths for @Sam."
        ),
        expected_output=(
            "A list of local file paths to all generated video segments, "
            "a log of every API call made, and a handoff message to @Sam."
        ),
        agent=media_generator
    )

    # ── Task 6: Post-production Assembly ─────────────────────────────────────
    task_editing = Task(
        description=(
            "You are the final gatekeeper. Review all clips from @Tupac. "
            "Check for: visual continuity, clip completeness, and style consistency. "
            "If any clip is missing or corrupt, flag it immediately. "
            "Run post-processing: stitch clips with MoviePy, generate a TTS audio track from voiceover text, "
            "merge audio and video into a single final MP4, and save to the final/ directory. "
            "Report the final video path with a sign-off message to the user."
        ),
        expected_output=(
            "Path to the finalized consolidated MP4 video in the final/ directory, "
            "plus a sign-off summary for the user."
        ),
        agent=editor_agent
    )

    # ── Assemble task list (conditionally include research) ───────────────────
    tasks = [task_idea]
    agents = [idea_generator]

    if task_research is not None:
        tasks.append(task_research)
        agents.append(research_agent)

    tasks.extend([task_script, task_visual_planning, task_generation, task_editing])
    agents.extend([script_writer, visual_planner, media_generator, editor_agent])

    return Crew(
        agents=agents,
        tasks=tasks,
        process=Process.sequential,
        verbose=True
    )
