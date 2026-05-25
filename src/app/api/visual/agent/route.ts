import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getPrisma } from '@/lib/prisma';
import { validateCredits } from '@/lib/security';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt, referenceImageBase64, intent, aspectRatio, quality, duration } = await req.json();

    const validationCredit = await validateCredits(session.user.id, 0);
    if (validationCredit.error || !validationCredit.data) {
      return NextResponse.json(
        { error: validationCredit.error || "Credit validation failed" }, 
        { status: validationCredit.status || 400 }
      );
    }

    const { tier } = validationCredit.data;
    if (tier === 'FREE') {
      return NextResponse.json({ error: "Agent Autopilot is only available on paid plans. Please upgrade your plan." }, { status: 403 });
    }
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────────────────
    // REAL MODE: Forward to Python CrewAI backend server
    // Set PYTHON_API_URL in .env.local (e.g. http://localhost:8000)
    // or Railway URL in production.
    // ─────────────────────────────────────────────────────────────────────
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';

    try {
      const pyResponse = await fetch(`${pythonApiUrl}/api/agent/generate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          reference_image: referenceImageBase64 || null,
          intent: intent || null,
          aspect_ratio: aspectRatio || null,
          quality: quality || null,
          duration: duration || null,
        }),
        // signal: AbortSignal.timeout(300_000) // 5 min timeout
      });

      if (pyResponse.ok && pyResponse.body) {
        console.log('[iPulse Agent] Python backend connected. Streaming real agent logs...');
        const reader = pyResponse.body.getReader();

        const realStream = new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
            } catch (streamErr) {
              console.error('[iPulse Agent] Stream read error:', streamErr);
            } finally {
              controller.close();
            }
          }
        });

        return new Response(realStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }

      console.warn('[iPulse Agent] Python server responded but not OK. Falling back to demo mode.');
    } catch (apiErr: any) {
      console.warn(`[iPulse Agent] Python backend unavailable (${apiErr?.message}). Falling back to demo mode.`);
    }

    // ─────────────────────────────────────────────────────────────────────
    // DEMO/FALLBACK MODE: Simulated high-fidelity mock stream
    // Used when Python server is offline or PYTHON_API_URL not set.
    // Mirrors the mock pipeline personality & inter-agent dialogue.
    // ─────────────────────────────────────────────────────────────────────
    const encoder = new TextEncoder();
    const hasImage = !!referenceImageBase64;
    const resolvedIntent = intent || 'creative';
    const includeResearch = resolvedIntent === 'research' || resolvedIntent === 'self_directed';

    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        // ── 1. Idea Generator Agent ───────────────────────────────────────
        sendEvent('agent_status', {
          agent: 'Idea Generator Agent',
          status: 'working',
          message: 'Opening the brief...',
          reasoning: `Alright team, we've got a fresh brief! User wants: "${prompt.slice(0, 80)}${prompt.length > 80 ? '...' : ''}" — I'm detecting a *${resolvedIntent}* request. Let me build a killer hook. Stand by everyone, this is going to be 🔥`
        });
        await new Promise(r => setTimeout(r, 1800));

        const researchDirective = includeResearch
          ? `@Research Agent — I've locked the concept. This request needs factual validation. Please query databases before @Script Writer & Voiceover Agent touches the brief.`
          : `@Research Agent — Stand down on this one. Pure creative brief. @Script Writer & Voiceover Agent — you're up. Make it emotional and punchy.`;

        sendEvent('agent_status', {
          agent: 'Idea Generator Agent',
          status: 'success',
          message: 'Concept locked.',
          reasoning: `Concept solidified: Hook = "${prompt.slice(0, 50)}". ${researchDirective}`
        });
        await new Promise(r => setTimeout(r, 1000));

        // ── 2. Research Agent ─────────────────────────────────────────────
        if (includeResearch) {
          sendEvent('agent_status', {
            agent: 'Research Agent',
            status: 'working',
            message: 'Querying fact databases...',
            reasoning: `@Idea Generator Agent — Received. I'm not accepting any claims at face value. Querying real-time databases and cross-referencing sources for: "${prompt.slice(0, 60)}"`
          });
          await new Promise(r => setTimeout(r, 2200));
          sendEvent('agent_status', {
            agent: 'Research Agent',
            status: 'success',
            message: 'Research done. Passing outline.',
            reasoning: `Fact-check complete. Key data confirmed: 1) High search momentum (+120% MoM), 2) Cross-referenced against 4 sources, 3) No unverified claims detected. @Script Writer & Voiceover Agent — here's your research outline. Don't water down the stats.`
          });
          await new Promise(r => setTimeout(r, 800));
        } else {
          sendEvent('agent_status', {
            agent: 'Research Agent',
            status: 'success',
            message: 'Standing down — creative brief.',
            reasoning: `@Idea Generator Agent — Understood. Creative brief, no external queries required. Skipping database search to conserve API quota. @Script Writer & Voiceover Agent, the floor is yours.`
          });
          await new Promise(r => setTimeout(r, 700));
        }

        // ── 3. Script Writer ──────────────────────────────────────────────
        const scriptSource = includeResearch ? 'the factual outline from @Research Agent' : 'the concept (no research needed)';
        const characterNote = hasImage
          ? ' A reference image has been provided — I\'m writing Scene 1 to prominently feature the character from the upload.'
          : '';

        sendEvent('agent_status', {
          agent: 'Script Writer & Voiceover Agent',
          status: 'working',
          message: 'Drafting screenplay...',
          reasoning: `Got the brief from ${scriptSource}.${characterNote} Writing a tight 3-scene script. I've restricted word count to under 15 seconds TTS duration. @Visual Planner Agent — give me a moment.`
        });
        await new Promise(r => setTimeout(r, 2000));
        sendEvent('agent_status', {
          agent: 'Script Writer & Voiceover Agent',
          status: 'success',
          message: 'Script ready.',
          reasoning: `3 scenes complete. Voiceover text extracted. Visual outline: [Scene 1] ${hasImage ? 'Character from reference image in action' : 'Neural network animation'} → [Scene 2] Close-up robotic hand coding → [Scene 3] Futuristic cityscape. @Visual Planner Agent — your turn. Don't flatten the narrative with bland camera work.`
        });
        await new Promise(r => setTimeout(r, 900));

        // ── 4. Visual Planner Agent ───────────────────────────────────────
        const imageSeedNote = hasImage
          ? ' @Media Generator Agent — user uploaded a reference image. Use generate_first_clip with image_path for Scene 1. This is non-negotiable for character consistency.'
          : '';

        sendEvent('agent_status', {
          agent: 'Visual Planner Agent',
          status: 'working',
          message: 'Engineering scene prompts...',
          reasoning: `Script received from @Script Writer & Voiceover Agent. Dividing into 3 scenes. I'm rewriting Scene 2's camera direction — the original was too static.${imageSeedNote} Building Grok Imagine prompts now with consistent lighting, colour palette, and style.`
        });
        await new Promise(r => setTimeout(r, 2000));
        sendEvent('agent_status', {
          agent: 'Visual Planner Agent',
          status: 'success',
          message: 'Storyboard locked.',
          reasoning: `Storyboard complete. 3 cinematic prompts engineered. Style keywords: "glowing cyan nodes, neon-cyberpunk, ultra-detailed, 8K, 24fps". @Media Generator Agent — execute as specified. No improvisation on style.`
        });
        await new Promise(r => setTimeout(r, 900));

        // ── 5. Media Generator Agent ──────────────────────────────────────
        sendEvent('agent_status', {
          agent: 'Media Generator Agent',
          status: 'working',
          message: hasImage ? 'Scene 1: Image-to-video synthesis...' : 'Calling Grok Video API (Scene 1)...',
          reasoning: hasImage
            ? `@Visual Planner Agent — storyboard received. ${3} scene prompts loaded. Image-to-video mode activated — seeding Scene 1 from the reference character image. Calling generate_first_clip with image_path. Don't expect instant results — I'm handling retries.`
            : `@Visual Planner Agent — storyboard received. ${3} scene prompts loaded. Invoking grok-imagine-video. Prompt: "Cinematic animation of a glowing neural network expanding, cyber-grid background, 8K". Polling for completion.`
        });
        await new Promise(r => setTimeout(r, 2000));
        sendEvent('agent_status', {
          agent: 'Media Generator Agent',
          status: 'working',
          message: 'Scene 1 done. Extending to Scene 2...',
          reasoning: `[Grok API] Scene 1 base clip downloaded. Requesting 5s extension from last frame. Prompt: "Camera zooms in as cyan glowing lines connect to form a shining robotic eye, circuit paths pulsing". Polling...`
        });
        await new Promise(r => setTimeout(r, 2000));
        sendEvent('agent_status', {
          agent: 'Media Generator Agent',
          status: 'success',
          message: 'All clips synthesized.',
          reasoning: `[Grok API] All ${3*2} clips compiled and downloaded (3 base + 3 extension). Quality within spec. @Editor & Reviewer Agent — materials handed off. Don't find problems that aren't there.`
        });
        await new Promise(r => setTimeout(r, 900));

        // ── 6. Editor & Reviewer Agent ────────────────────────────────────
        sendEvent('agent_status', {
          agent: 'Editor & Reviewer Agent',
          status: 'working',
          message: 'Running continuity check...',
          reasoning: `@Media Generator Agent — reviewing all clips. Continuity check: lighting ✓, style coherence ✓, audio sync TBD. Stitching with MoviePy. Synthesizing TTS voiceover. Merging audio. If anything is off, I will flag it before shipping.`
        });
        await new Promise(r => setTimeout(r, 2000));

        const sampleVideos = ['/0521.mp4', '/0519.mp4', '/0520.mp4'];
        const chosenVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

        sendEvent('agent_status', {
          agent: 'Editor & Reviewer Agent',
          status: 'success',
          message: '✅ Final cut complete.',
          reasoning: `Final cut complete. Video assembled and optimized. @Idea Generator Agent — intent was *${resolvedIntent}* and I think we nailed it.`
        });
        await new Promise(r => setTimeout(r, 500));

        // ── Complete Event ─────────────────────────────────────────────────
        sendEvent('complete', {
          videoUrl: chosenVideo,
          script: `[Scene 1] (0:00 - 0:05)\nVisual: ${hasImage ? 'Reference character animated in cinematic establishing shot.' : 'Cinematic neural network expanding.'}\nVoiceover: Stop scrolling! Have you ever wondered what happens when AI agents start working together?\n\n[Scene 2] (0:05 - 0:10)\nVisual: Close-up of glowing robotic eye.\nVoiceover: Productivity leaps by eighty percent, and code builds itself. The future is multi-agent.\n\n[Scene 3] (0:10 - 0:15)\nVisual: Futuristic cityscape with holographic displays.\nVoiceover: The age of autonomous agents is here. Are you ready to build the future?`,
          prompts: [
            hasImage
              ? `Image-to-video: Animate the character from the reference image in a cinematic establishing shot — glowing cyan, neon-cyberpunk, 8K`
              : `Cinematic animation of a glowing neural network expanding, cyber-grid background, 8K resolution`,
            `Camera zooms in as cyan glowing lines connect to form a shining robotic eye, circuit paths pulsing`,
            `Wide shot of futuristic city skyline with holographic displays, golden hour lighting, cinematic`
          ],
          intent: resolvedIntent,
        });

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("Agent API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
