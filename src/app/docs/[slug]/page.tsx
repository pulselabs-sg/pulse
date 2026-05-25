'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ShieldCheck, FileText, Zap, Mic, AudioLines,
  Sparkles, Terminal, Wand2, Image as ImageIcon, Video,
  HelpCircle, Clock, PlayCircle, Layers, CheckCircle2,
  AlertTriangle, ArrowRight, BookOpen, Bot, Users, Cpu,
  FileJson, X, ChevronDown, ChevronUp, Globe, Server, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLANS } from '@/lib/dashboard-constants';

export default function DocsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const validSlugs = ['introduce', 'agent', 'image', 'video', 'flow', 'audio', 'pricing', 'tutorials', 'faqs', 'terms', 'api'];
  if (!slug || !validSlugs.includes(slug)) {
    notFound();
  }

  // Collapsible pricing details state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    image: false,
    video: false,
    agent: false,
    audio: false,
    support: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-16 text-zinc-300"
    >
      {children}
    </motion.div>
  );

  switch (slug) {
    case 'introduce':
      return (
        <PageTransition>
          {/* Header */}
          <div className="border-b border-white/5 pb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-400/20 rounded-md text-[9px] font-mono uppercase tracking-widest backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse rounded-full"></span>
              <span className="text-cyan-400">NEURAL ENGINE PLATFORM ONLINE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter text-white uppercase mb-6 leading-tight">
              Platform Overview
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              Welcome to the official developer and creator documentation for iPulse AI. We engineer professional-grade, low-latency neural generation pipelines optimized for advanced visual and auditory synthesis. With native support for state-of-the-art video diffusion models, image inpainting modules, and high-fidelity speaker cloning infrastructure, iPulse represents a unified dashboard for modern developers, video creators, and AI artists.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/docs/agent" className="px-5 py-2.5 bg-white text-black text-[10px] font-mono uppercase tracking-widest font-bold rounded-md hover:bg-zinc-200 transition-colors shadow-lg">
                Multi-Agent System
              </Link>
              <Link href="/docs/image" className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest font-bold rounded-md hover:bg-white/10 transition-colors">
                Image Synthesis
              </Link>
              <Link href="/docs/video" className="px-5 py-2.5 bg-white/5 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono uppercase tracking-widest font-bold rounded-md hover:bg-cyan-500/5 transition-colors">
                Video Production
              </Link>
            </div>
          </div>

          {/* Interactive Pipeline Architecture Diagram */}
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Activity className="w-5 h-5 text-cyan-400" /> Pipeline Architecture
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Our neural processing pipeline coordinates specialized AI sub-engines via a high-performance orchestration layer. Here is how your requests travel through iPulse:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-lg flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-3">01. Request Layer</div>
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">Ingress API</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                  WebSocket or REST requests ingest prompts, aspect ratios, and character reference images into the queue.
                </p>
              </div>

              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-lg flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
                <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider mb-3">02. Logic Layer</div>
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">Agent Orchestration</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                  CrewAI multi-agents expand briefs, fact-check research, write scripts, and plan visual cues.
                </p>
              </div>

              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-lg flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-3">03. Model Layer</div>
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">Neural Generation</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                  xAI diffusion and Fish Speech synthesis run on dedicated H100 clusters to output high-fidelity assets.
                </p>
              </div>

              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-lg flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
                <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-3">04. Delivery Layer</div>
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">R2 Compilation</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                  Assets are compiled, merged with audio, and uploaded to Cloudflare R2 for low-latency global CDN delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Core Architectures */}
          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400" /> Core Engine Architectures
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-3xl">
              iPulse integrates three fundamental neural pipelines into a single interface. Each system represents the bleeding edge of physical and auditory simulation:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-950/30 border border-white/5 p-6 rounded-md hover:border-white/10 transition-colors">
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-3 flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" /> Video Diffusion (xAI)
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Utilizes temporal diffusion models that generate physically consistent motion, cinematic depth of field, real-time light reflections, and camera transitions. Capable of producing both short-form loops and extended action sequences with state continuity.
                </p>
              </div>
              <div className="bg-zinc-950/30 border border-white/5 p-6 rounded-md hover:border-white/10 transition-colors">
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" /> Imagine Diffusion
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Generates crisp, high-resolution imagery across custom aspect ratios. Supports advanced base64 image conditioning, dynamic style transfer, and precise area inpainting. Optimizes text alignment for complex multi-subject descriptions.
                </p>
              </div>
              <div className="bg-zinc-950/30 border border-white/5 p-6 rounded-md hover:border-white/10 transition-colors">
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-3 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-400" /> Neural Audio (Fish Speech)
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Powered by multi-speaker autoregressive speech transformers. Offers sub-second speaker diarization, voice conversion that retains pitch/inflection, voice cloning from short audio recordings, and neural noise reduction.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Matrix */}
          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Workspace Features Matrix
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/docs/agent" className="bg-zinc-950/20 border border-white/5 hover:border-white/20 transition-all rounded-md p-6 group block">
                <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Multi-Agent Orchestrator</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Let six specialized AI agents outline, research, write, storyboard, render, and edit your videos automatically from a simple brief.
                </p>
              </Link>
              <Link href="/docs/image" className="bg-zinc-950/20 border border-white/5 hover:border-white/20 transition-all rounded-md p-6 group block">
                <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Image Synthesis & Inpainting</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Generate images with dynamic aspect ratios and quality configurations. Modify specific areas using reference images and text instructions.
                </p>
              </Link>
              <Link href="/docs/video" className="bg-zinc-950/20 border border-white/5 hover:border-white/20 transition-all rounded-md p-6 group block">
                <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Video className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Cinematic Video Production</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Synthesize high-fidelity video clips from text prompts or transform static image assets into dynamic scenes with custom camera motion controls.
                </p>
              </Link>
              <Link href="/docs/flow" className="bg-zinc-950/20 border border-white/5 hover:border-white/20 transition-all rounded-md p-6 group block">
                <div className="w-10 h-10 bg-white/5 rounded-md flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Wand2 className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Flow Video Extension</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Extend existing video files continuously. The model analyzes optical flows and structures from final frames to extend actions seamlessly.
                </p>
              </Link>
            </div>
          </div>
        </PageTransition>
      );

    case 'agent':
      return (
        <PageTransition>
          {/* Header */}
          <div className="border-b border-white/5 pb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-400/20 rounded-md text-[9px] font-mono uppercase tracking-widest backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-400">CREWAI ORCHESTRATION LAYER</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6 leading-tight">
              Multi-Agent Orchestrator
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              The iPulse Multi-Agent Video Pipeline represents a shift from static generative models to an active, collaborative intelligence ecosystem. Instead of writing prompts manually, fact-checking details, and stitching clips, a dynamic team of six AI agents collaborates via structured tasks to build complete, cinematic video productions from simple descriptions.
            </p>
          </div>

          {/* The Six Agents */}
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Users className="w-5 h-5 text-cyan-400" /> Meet The Creative Crew
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Each agent has an opinionated backstory, distinct goal, and specific toolsets. They interact using @-mentions to collaborate through the workflow chain:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-lg relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> Idea Generator (@Bully)
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Acts as the creative director. Brainstorms scroll-stopping hooks, format parameters, emotional tone, and hooks. Directs the workflow and determines whether historical research or statistics are required to back up the visual direction.
                </p>
              </div>

              <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-lg relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" /> Research Analyst (@Raffa)
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  The skeptical thinker. Fact-checks user claims, queries real-time databases, and builds factual outlines. If the brief is purely creative, it steps aside to conserve API quota and signals the screenwriter to start immediately.
                </p>
              </div>

              <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-lg relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" /> Copywriter & Screenwriter (@Monker)
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Perfectionist screenwriter. Translates the outline or concept into structured screenplays with distinct scene cues and voiceover lines. Constrains word counts precisely to fit the generated video durations.
                </p>
              </div>

              <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-lg relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pink-400" /> Art Director (@Intruder)
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Visual stylist. Breaks the script into 5-10 second chunks, details camera panning directives, lighting configurations, color palettes, and writes cinematic prompts optimized for Grok Imagine Video. Ensures character seeds match if a reference image is present.
                </p>
              </div>

              <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-lg relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Media Director (@Tupac)
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Pragmatic engineer. Executes the video generation API calls. Seeds Scene 1 from the reference image, sequentially runs the Flow extension to append further scenes, logs rendering times, and resolves failures automatically.
                </p>
              </div>

              <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-lg relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300">
                <h3 className="text-xs font-mono font-bold text-white uppercase mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Editor & QA Specialist (@Sam)
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Strict post-production compiler. Audits rendering outputs for continuity errors. Stitches clip sequences using MoviePy, overlays the neural TTS audio file, merges audio/video elements, and exports the final MP4.
                </p>
              </div>
            </div>
          </div>

          {/* Collaborative Intent Modes */}
          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Cpu className="w-5 h-5 text-cyan-400" /> Orchestration Workflows
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-3xl">
              The agent crew automatically shifts roles depending on the user's intent:
            </p>
            <div className="space-y-4">
              <div className="border-l-2 border-cyan-400 pl-4 py-1.5">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Creative Mode</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  Optimized for cinematic stories and artistic briefs. @Bully outlines a fiction style, @Raffa skips fact-checking, and @Monker focuses on sensory narrative arcs and punchy visual details.
                </p>
              </div>
              <div className="border-l-2 border-cyan-400 pl-4 py-1.5">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Research-backed Mode</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  Triggered for educational content, product statistics, or historical recaps. @Raffa runs web searches to lock down verified numbers and trending details, structuring a rigid outline before @Monker begins writing.
                </p>
              </div>
              <div className="border-l-2 border-cyan-400 pl-4 py-1.5">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Image-to-Video Mode</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  Locks character and scene consistency using a reference image. @Intruder targets Scene 1 specifically to match the style/actor details, and instructs @Tupac to use `generate_first_clip(image_path)` to seed the temporal animation.
                </p>
              </div>
              <div className="border-l-2 border-cyan-400 pl-4 py-1.5">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Verbatim Mode</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  Used when the user provides an exact audio file or script text. @Monker is banned from altering the voiceover words, enforcing 100% adherence to input strings while directing only the visual styling.
                </p>
              </div>
            </div>
          </div>
        </PageTransition>
      );

    case 'image':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-400/20 rounded-md text-[9px] font-mono uppercase tracking-widest backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">DIFFUSION MODULES</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Image Synthesis
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              Configure composition layouts, aspect ratios, image editing modes, and formatting standards supported by the iPulse Imagine image synthesis modules.
            </p>
          </div>

          {/* Aspect Ratios details */}
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Layers className="w-5 h-5 text-cyan-400" /> Grid & Aspect Ratios
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Different aspect ratios adjust the crop grid and initial resolution weights under the hood to output balanced layouts. Choosing the correct layout ensures that subjects remain centered without stretching:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-md">
                <div className="w-8 h-8 border border-white/30 rounded-sm bg-white/5 mb-3 flex items-center justify-center font-mono text-[10px] text-white">1:1</div>
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2">1:1 Square</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                  Perfect for avatars, icons, profile portraits, and square catalog mockups. Highly balanced composition weights.
                </p>
              </div>
              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-md">
                <div className="w-12 h-6 border border-white/30 rounded-sm bg-white/5 mb-3 flex items-center justify-center font-mono text-[10px] text-white">16:9</div>
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2">16:9 Cinematic</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                  Ideal for website banners, YouTube thumbnails, cinematic backdrop plates, and widescreen presentations.
                </p>
              </div>
              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-md">
                <div className="w-6 h-12 border border-white/30 rounded-sm bg-white/5 mb-3 flex items-center justify-center font-mono text-[10px] text-white">9:16</div>
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2">9:16 Portrait</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                  Optimized for mobile-first environments, TikTok creative campaigns, Instagram Stories, and vertical social marketing.
                </p>
              </div>
              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-md">
                <div className="w-10 h-8 border border-white/30 rounded-sm bg-white/5 mb-3 flex items-center justify-center font-mono text-[10px] text-white">4:3</div>
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2">4:3 Classical</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed">
                  Traditional web layout. Highly compatible with legacy UI components and standard document print dimensions.
                </p>
              </div>
            </div>
          </div>

          {/* Quality and Editing Features */}
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Editing Modes & Presets
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-3xl">
              iPulse supports multiple processing pathways to control, edit, or modify pixels:
            </p>
            <div className="space-y-4">
              <div className="border-l-2 border-cyan-400 pl-4 py-1">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Image Generation Mode</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  Synthesize new images from pure text prompts. Our system uses advanced diffusion solvers to generate fine details, realistic skin textures, metallic reflections, and volumetric light scattering. Include descriptors like "soft overhead studio light" or "50mm lens" for customized photography controls.
                </p>
              </div>
              <div className="border-l-2 border-cyan-400 pl-4 py-1">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Image Editing & Inpainting</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  By uploading a reference image and selecting the image-editing mode, the workspace passes a base64 image data-URI alongside your text instructions. The model overlays the new styles, replaces backgrounds, or modifies items while maintaining structural alignment.
                </p>
              </div>
              <div className="border-l-2 border-cyan-400 pl-4 py-1">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Failure Safeguards & R2 Uploads</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  Generating or editing an image costs a flat rate of <strong className="text-white">1,500 pulses</strong> per transaction. If a request is rejected by the model API or the permanent R2 storage upload fails, consumed pulses are instantly refunded.
                </p>
              </div>
            </div>
          </div>
        </PageTransition>
      );

    case 'video':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-400/20 rounded-md text-[9px] font-mono uppercase tracking-widest backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">TEMPORAL DIFFUSION</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Video Production
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              Configure resolution qualities, temporal durations, camera motions, and understand credit rates for video generations.
            </p>
          </div>

          {/* Temporal parameters */}
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Clock className="w-5 h-5 text-cyan-400" /> Durations & Dynamic Motion
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Standard clips can be generated in increments of <strong className="text-white">5 seconds, 10 seconds, or 15 seconds</strong> at a target frame rate of <strong className="text-white">24 FPS</strong>. Motion scale parameters can be adjusted from `0.5` (subtle panning/breathing) to `1.8` (extreme dynamic actions/rotations). Longer clips require more computing time but maintain temporal consistency throughout the playback.
            </p>
          </div>

          {/* Quality & Pricing details */}
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-400" /> Quality & Credit Matrix
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Credit pricing is computed dynamically per second, based on the selected resolution quality:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-md">
                <div className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 text-white font-mono text-[9px] uppercase tracking-widest mb-4">SD Quality (480p)</div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">1,200 Pulses / Second</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed space-y-1">
                  • <strong>5 Seconds</strong>: 6,000 Pulses<br />
                  • <strong>10 Seconds</strong>: 12,000 Pulses<br />
                  • <strong>15 Seconds</strong>: 18,000 Pulses<br />
                  • Best for social draft animations, rapid scene testing, and layout mockups.
                </p>
              </div>
              <div className="bg-zinc-950/40 border border-cyan-400/20 p-6 rounded-md shadow-[0_0_20px_rgba(6,182,212,0.03)]">
                <div className="inline-block px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 font-mono text-[9px] uppercase tracking-widest mb-4">HD Quality & above (720p+)</div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">1,500 Pulses / Second</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed space-y-1">
                  • <strong>5 Seconds</strong>: 7,500 Pulses<br />
                  • <strong>10 Seconds</strong>: 15,000 Pulses<br />
                  • <strong>15 Seconds</strong>: 22,500 Pulses<br />
                  • High-definition textures, crisp boundaries, realistic lighting, optimal for production rendering.
                </p>
              </div>
            </div>
          </div>

          {/* Polling description */}
          <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-md">
            <h3 className="text-xs font-mono font-bold uppercase text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Automatic Fail Refund Policy
            </h3>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Video synthesis is processed asynchronously. The backend deducts pulses when the generation starts. We poll status updates using the `video-status` API. If status checks show <code className="text-rose-400">failed</code> or <code className="text-rose-400">expired</code>, the system automatically runs a credit transaction refunding all deducted pulses.
            </p>
          </div>
        </PageTransition>
      );

    case 'flow':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-400/20 rounded-md text-[9px] font-mono uppercase tracking-widest backdrop-blur-sm mb-6 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">FLOW EXTENSION MECHANICS</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Flow Video Extension
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              Master the mechanics behind our Flow system to sequentially extend, stitch, and animate existing video assets.
            </p>
          </div>

          {/* How Flow works */}
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Layers className="w-5 h-5 text-cyan-400" /> How Flow Works
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Traditional text-to-video generators generate animations from scratch, often leading to visual inconsistencies. The <strong className="text-white">Flow</strong> system behaves differently:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-md">
                <span className="text-cyan-400 font-mono text-xs font-bold">01 / Frame Parsing</span>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed mt-2">
                  The model extracts visual grids, layouts, and optical flow directions from the final frames of your uploaded source video.
                </p>
              </div>
              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-md">
                <span className="text-cyan-400 font-mono text-xs font-bold">02 / Prompt Transition</span>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed mt-2">
                  The continuation prompt instructs the diffusion engine on how objects should move, zoom, or transition next.
                </p>
              </div>
              <div className="bg-zinc-950/40 border border-white/5 p-5 rounded-md">
                <span className="text-cyan-400 font-mono text-xs font-bold">03 / Fluid Synthesis</span>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed mt-2">
                  The model appends new frames seamlessly, preserving color tones, brightness, and character layout.
                </p>
              </div>
            </div>
          </div>

          {/* Timeline and UI walkthrough */}
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <PlayCircle className="w-5 h-5 text-cyan-400" /> Flow Workspace Walkthrough
            </h2>
            <ol className="list-decimal list-inside space-y-4 text-xs font-mono text-zinc-400 leading-relaxed marker:text-cyan-400 marker:font-bold">
              <li>Open your project and change the main generation mode to <strong className="text-white">Flow</strong>.</li>
              <li>Upload a starting video (MP4) in the asset tray (thumbnail preview will show up).</li>
              <li>Type your transition instructions in the prompt box (e.g. <code className="text-zinc-300">"the camera rotates 180 degrees to reveal a green meadow"</code>).</li>
              <li>Configure settings (duration, quality). Click <strong className="text-white">Generate</strong>.</li>
              <li>The timeline editor registers the progression: <strong className="text-cyan-400">Original Video &rarr; Gen 1 &rarr; Gen 2</strong>. Click cards on the sequence sidebar to preview individual clips.</li>
            </ol>
          </div>
        </PageTransition>
      );

    case 'audio':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-400/20 rounded-md text-[9px] font-mono uppercase tracking-widest backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">NEURAL VOICES</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Audio Synthesis & Cloning
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              Overview of Text-to-Speech (TTS), Voice Changer, Noise Reduction cleaner, and Custom Voice Cloning settings.
            </p>
          </div>

          <div className="space-y-8">
            {/* TTS details */}
            <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-md">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">Text-to-Speech (TTS)</h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-4">
                Enter your text and synthesis variables (Stability and Similarity controls). The model outputs highly realistic voice streams.
              </p>
              <ul className="list-disc list-inside space-y-2 text-[10px] font-mono text-zinc-500">
                <li><strong>Stability</strong> (0.0 - 1.0): Adjusts prosody variation. Lower values make vocal delivery more dynamic and emotional, but can sometimes introduce instability.</li>
                <li><strong>Similarity Boost</strong> (0.0 - 1.0): Determines how closely the clone parameters adhere to the original training asset. Higher values lock down the accent but can sound mechanical.</li>
              </ul>
            </div>

            {/* Custom Voice Cloning details */}
            <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-md">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">Custom Voice Cloning</h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-4">
                Clone specific vocal profiles by uploading 1-2 minutes of clean audio datasets. Ensure minimal background echoes, music, or overlaps.
              </p>
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-sm mb-4">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Language Restrictions
                </span>
                <p className="text-[10px] font-mono text-amber-500/80 leading-relaxed mt-1">
                  Custom voices are optimized for exactly 13 languages (EN, ZH, JA, DE, FR, ES, KO, AR, RU, NL, IT, PL, PT). Attempting to use cloned voices on unsupported languages may result in degradation or gibberish.
                </p>
              </div>
            </div>

            {/* Voice Changer & Cleaner */}
            <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-md">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">Changer & Cleaner Tools</h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                Transform source audio tracks into target voices while preserving pitch and timing, or eliminate ambient sound artifacts using neural cleaning algorithms.
              </p>
            </div>
          </div>
        </PageTransition>
      );

    case 'pricing':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-10 text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-white uppercase mb-6">
              Pricing Plans
            </h1>
            <p className="text-sm md:text-base font-sans text-zinc-400 leading-relaxed max-w-3xl mx-auto">
              Select the creative tier that matches your production scale. Transparent volume credits with automatic failure safety refunds. Secure merchant processing powered by Polar.sh.
            </p>
          </div>

          {/* Pricing Grid - Large Card Formats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "border p-8 md:p-10 flex flex-col relative rounded-2xl transition-all duration-300 hover:-translate-y-1.5",
                  plan.popular
                    ? "border-zinc-300 shadow-[0_0_50px_rgba(255,255,255,0.03)]"
                    : "border-white/5 hover:border-white/15 hover:shadow-[0_0_45px_rgba(255,255,255,0.015)]"
                )}
              >
                {plan.popular && (
                  <div className="text-[10px] font-sans uppercase tracking-wider text-white bg-zinc-800 border border-white/10 font-bold inline-block px-3 py-1 mb-4 self-start absolute top-0 -translate-y-1/2 left-8 rounded-full">
                    Recommended
                  </div>
                )}

                <div className="text-lg font-sans font-bold text-zinc-200 mb-2">{plan.name}</div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-sans font-bold text-white">${plan.priceMonthly}</span>
                  <span className="text-sm text-zinc-500 font-sans">/mo</span>
                </div>

                <p className="text-sm text-zinc-400 mb-8 h-12 leading-relaxed font-sans">{plan.desc}</p>

                <div className="space-y-8 mb-10 flex-1 text-left">
                  {/* General section */}
                  <div>
                    <div className="text-[10px] font-sans uppercase tracking-widest text-zinc-500 mb-3 font-bold border-b border-white/5 pb-1.5">General Credits</div>
                    <div className="flex items-start gap-3 text-sm text-white font-sans">
                      <Check className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                      <span className="font-medium">{plan.id === 'FREE' ? '40,000' : plan.id === 'BASIC' ? '120,000' : plan.id === 'PREMIUM' ? '300,000' : '1,500,000'} Pulses/mo</span>
                    </div>
                  </div>

                  {/* Audio section */}
                  <div>
                    <div className="text-[10px] font-sans uppercase tracking-widest text-zinc-500 mb-3 font-bold border-b border-white/5 pb-1.5">Voice & Audio</div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-zinc-300 font-sans">
                        <Check className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                        <span>{plan.id === 'FREE' || plan.id === 'BASIC' ? '5,000' : plan.id === 'PREMIUM' ? '10,000' : '15,000'} Char TTS</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-zinc-300 font-sans">
                        <Check className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                        <span>{plan.id === 'FREE' || plan.id === 'BASIC' ? '5 min' : plan.id === 'PREMIUM' ? '10 min' : '15 min'} STT Limit</span>
                      </li>
                    </ul>
                  </div>

                  {/* Visual section */}
                  <div>
                    <div className="text-[10px] font-sans uppercase tracking-widest text-zinc-500 mb-3 font-bold border-b border-white/5 pb-1.5">Visual Production</div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-zinc-300 font-sans">
                        <Check className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                        <span>{plan.id === 'FREE' ? 'Image Gen & Edit (Standard)' : 'Image Gen & Edit (2K Quality)'}</span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-zinc-300 font-sans">
                        <Check className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                        <span>{plan.id === 'FREE' ? 'Video Gen & Edit (480p)' : 'Video/Flow/Agent (720p HD)'}</span>
                      </li>
                      {plan.id !== 'FREE' ? (
                        <>
                          <li className="flex items-start gap-3 text-sm text-zinc-300 font-sans">
                            <Check className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                            <span>Flow Video Extension</span>
                          </li>
                          <li className="flex items-start gap-3 text-sm text-zinc-300 font-sans">
                            <Check className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                            <span>Multi-Agent Autopilot</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start gap-3 text-sm text-zinc-500 font-sans line-through">
                            <span className="w-5 h-5 flex items-center justify-center font-bold text-zinc-600 shrink-0 text-xs">—</span>
                            <span>No Flow Video Extension</span>
                          </li>
                          <li className="flex items-start gap-3 text-sm text-zinc-500 font-sans line-through">
                            <span className="w-5 h-5 flex items-center justify-center font-bold text-zinc-600 shrink-0 text-xs">—</span>
                            <span>No Multi-Agent Autopilot</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                <Link href="/dashboard" className={cn(
                  "w-full py-4 text-center text-sm font-sans font-bold transition-all rounded-xl flex items-center justify-center gap-2 mt-auto",
                  plan.popular
                    ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    : "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 hover:border-white/20"
                )}>
                  Access Dashboard
                </Link>
              </div>
            ))}
          </div>

          {/* Full Comparison Section - Expanded & Clean Matrix */}
          <div className="mt-24 border border-white/5 bg-zinc-900/10 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="p-8 border-b border-white/5 bg-white/[0.01]">
              <h2 className="text-2xl font-sans font-bold text-white tracking-tight">
                Compare features across plans
              </h2>
              <p className="text-sm font-sans text-zinc-500 mt-1">
                A granular, side-by-side technical breakdown of quotas, support SLAs, and neural capabilities.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-400 text-sm font-sans font-semibold tracking-wider bg-white/[0.01]">
                    <th className="p-5 text-left w-[28%] font-bold text-zinc-300">Feature</th>
                    <th className="p-5 font-bold">Free</th>
                    <th className="p-5 font-bold">Basic</th>
                    <th className="p-5 font-bold">Premium</th>
                    <th className="p-5 font-bold text-white">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-zinc-300 font-sans">
                  {/* Category: Platform Limits */}
                  <tr className="bg-white/[0.01]">
                    <td colSpan={5} className="p-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5">
                      Platform & General Limits
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Monthly Pulses</td>
                    <td className="p-5">40,000</td>
                    <td className="p-5">120,000</td>
                    <td className="p-5">300,000</td>
                    <td className="p-5 text-white font-bold">1,500,000</td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Refund safety logs</td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">API Ingress Key</td>
                    <td className="p-5 text-zinc-600">—</td>
                    <td className="p-5">Standard</td>
                    <td className="p-5">High throughput</td>
                    <td className="p-5 font-bold text-white">Dedicated</td>
                  </tr>

                  {/* Category: Multi-Agent */}
                  <tr className="bg-white/[0.01]">
                    <td colSpan={5} className="p-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5">
                      Multi-Agent Orchestration
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">6-Agent Autopilot</td>
                    <td className="p-5 text-zinc-600">—</td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Fact check search engine</td>
                    <td className="p-5 text-zinc-600">—</td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  </tr>

                  {/* Category: Image Synthesis */}
                  <tr className="bg-white/[0.01]">
                    <td colSpan={5} className="p-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5">
                      Image Synthesis
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Max Image Quality</td>
                    <td className="p-5 text-zinc-500">Standard (1.5k)</td>
                    <td className="p-5">2K Quality</td>
                    <td className="p-5">2K Quality</td>
                    <td className="p-5 font-bold text-white">2K Quality</td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Standard Imagine</td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Custom Aspect Ratios</td>
                    <td className="p-5 text-zinc-500">1:1 Only</td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Inpainting / BG overrides</td>
                    <td className="p-5 text-zinc-600">—</td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  </tr>

                  {/* Category: Video Production */}
                  <tr className="bg-white/[0.01]">
                    <td colSpan={5} className="p-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5">
                      Video Production
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Standard Rendering (480p)</td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">HD Quality (720p - Video/Flow/Agent)</td>
                    <td className="p-5 text-zinc-600">—</td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Max Clip Duration</td>
                    <td className="p-5">5s</td>
                    <td className="p-5">10s</td>
                    <td className="p-5">15s</td>
                    <td className="p-5 font-bold text-white">45s</td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Flow Extension</td>
                    <td className="p-5 text-zinc-600">—</td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                    <td className="p-5"><Check className="w-5 h-5 text-zinc-300 mx-auto" /></td>
                  </tr>

                  {/* Category: Neural Audio */}
                  <tr className="bg-white/[0.01]">
                    <td colSpan={5} className="p-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5">
                      Neural Audio
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">TTS limit / request</td>
                    <td className="p-5">5,000 char</td>
                    <td className="p-5">5,000 char</td>
                    <td className="p-5">10,000 char</td>
                    <td className="p-5 text-white font-bold">15,000 char</td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">STT limit / file</td>
                    <td className="p-5">5 mins</td>
                    <td className="p-5">5 mins</td>
                    <td className="p-5">10 mins</td>
                    <td className="p-5 text-white font-bold">15 mins</td>
                  </tr>

                  {/* Category: SLAs */}
                  <tr className="bg-white/[0.01]">
                    <td colSpan={5} className="p-4 text-left text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5">
                      Infrastructure & Support SLAs
                    </td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Support SLA</td>
                    <td className="p-5">Community</td>
                    <td className="p-5">Email (24h)</td>
                    <td className="p-5">Priority (12h)</td>
                    <td className="p-5 font-bold text-white">Slack & Email (1h)</td>
                  </tr>
                  <tr className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-5 text-left font-semibold text-white">Hardware nodes</td>
                    <td className="p-5">Shared Queue</td>
                    <td className="p-5">Shared Queue</td>
                    <td className="p-5">Priority Queue</td>
                    <td className="p-5 font-bold text-white">Dedicated GPU Allocation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Secure merchant processing footer */}
          <div className="pt-6 border-t border-white/5 flex items-center gap-3 text-xs font-mono text-zinc-500 uppercase tracking-widest mt-12 justify-center">
            <ShieldCheck className="w-5 h-5 text-zinc-400 animate-pulse" />
            <span>Secure merchant processing backed by <span className="text-white font-sans font-bold">Polar.sh</span></span>
          </div>
        </PageTransition>
      );

    case 'tutorials':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-400/20 rounded-md text-[9px] font-mono uppercase tracking-widest backdrop-blur-sm mb-6 shadow-[0_0_15px_rgba(6,182,212,0.05)]">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">CREATIVE WORKFLOWS</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Platform Tutorials
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              Step-by-step developer and creator tutorials showcasing the integration of visual and audio features.
            </p>
          </div>

          <div className="space-y-12">
            {/* Tutorial A */}
            <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-md hover:border-cyan-400/20 transition-all">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
                <span>Tutorial A</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">Cinematic Video Sequences with Flow</span>
              </div>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-6">
                Learn how to generate a starting keyframe image, animate it, and extend the cinematic flow into a continuous 15-second tracking sequence:
              </p>
              <div className="space-y-4 text-xs font-mono text-zinc-400 pl-4 border-l border-white/10">
                <p>
                  <strong className="text-white">Step 1: Synthesis of starting frame:</strong><br />
                  Navigate to the Imagine workspace, select Aspect Ratio <code className="text-white">16:9</code>, set mode to <code className="text-white">Image</code>, and input: <code className="text-zinc-300">"wide-angle shot of a glowing cyberpunk space station docking hub, high detail"</code>. Click generate (deducts 1,500 pulses).
                </p>
                <p>
                  <strong className="text-white">Step 2: Initialize Animation:</strong><br />
                  Save the generated image. Switch the workspace mode to <code className="text-white">Video</code>, select the output image as the Reference Image upload, set duration to <code className="text-white">5 seconds</code>, set resolution to <code className="text-white">720p</code>, and prompt: <code className="text-zinc-300">"a futuristic ship enters the docking hub"</code> (deducts 7,500 pulses).
                </p>
                <p>
                  <strong className="text-white">Step 3: Extend with Flow:</strong><br />
                  Once the video is generated, switch workspace mode to <code className="text-white">Flow</code>. Upload the 5-second video clip into the Sequence timeline, select <code className="text-white">5 seconds</code> duration, and input: <code className="text-zinc-300">"the ship lands and passengers step out onto the docking platform"</code>. Click generate to extend the video timeline to 10 seconds.
                </p>
              </div>
            </div>

            {/* Tutorial B */}
            <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-md hover:border-cyan-400/20 transition-all">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
                <span>Tutorial B</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">E-Commerce Product Background Overrides</span>
              </div>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-6">
                Understand how to clean and overlay styles on an e-commerce product asset using Image-Editing:
              </p>
              <div className="space-y-4 text-xs font-mono text-zinc-400 pl-4 border-l border-white/10">
                <p>
                  <strong className="text-white">Step 1: Upload Product Asset:</strong><br />
                  Drag and drop your raw product mockup image (e.g. a perfume bottle) into the image input drop-zone.
                </p>
                <p>
                  <strong className="text-white">Step 2: Trigger Edit:</strong><br />
                  Switch the mode parameter to <code className="text-white">Image</code>, and write details on the target background styling: <code className="text-zinc-300">"perfume bottle sitting on a wet marble stone plate surrounded by tropical palm leaves, soft lighting"</code>. Click generate (deducts 1,500 pulses).
                </p>
                <p>
                  <strong className="text-white">Step 3: Export:</strong><br />
                  The system will output a high-end overlay with matching lighting vectors and reflections matching your marble context.
                </p>
              </div>
            </div>

            {/* Tutorial C */}
            <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-md hover:border-cyan-400/20 transition-all">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
                <span>Tutorial C</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">Voice Cloning and TTS Overdubbing</span>
              </div>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-6">
                Synthesize custom spoken audio voiceovers for video campaigns using saving identities:
              </p>
              <div className="space-y-4 text-xs font-mono text-zinc-400 pl-4 border-l border-white/10">
                <p>
                  <strong className="text-white">Step 1: Record reference dataset:</strong><br />
                  Record 1-2 minutes of voice reading a script. Eliminate echo or background whispers. Save as a WAV file.
                </p>
                <p>
                  <strong className="text-white">Step 2: Generate Clone:</strong><br />
                  Navigate to Voice Cloning, upload the WAV file, and click Clone. Save the generated profile under a nickname (e.g., "Narrator A") (deducts 5,000 pulses).
                </p>
                <p>
                  <strong className="text-white">Step 3: Synthesis:</strong><br />
                  Navigate to the Audio tab. Select "Narrator A" as the active voice. Enter your script in English or Spanish, set Stability to <code className="text-white">0.65</code> for expressive inflections, and click generate (deducts 1 pulse per character).
                </p>
              </div>
            </div>

            {/* Tutorial D: API multi-agent */}
            <div className="bg-zinc-950/40 border border-white/5 p-6 rounded-md hover:border-cyan-400/20 transition-all">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
                <span>Tutorial D</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">Automated Multi-Agent Video Pipeline via API</span>
              </div>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-6">
                Initiate the fully automated CrewAI production pipeline programmatically using REST endpoints:
              </p>
              <div className="space-y-4 text-xs font-mono text-zinc-400 pl-4 border-l border-white/10">
                <p>
                  <strong className="text-white">Step 1: Set payload parameters:</strong><br />
                  Select orchestration mode (<code className="text-white">"research"</code>, <code className="text-white">"creative"</code>), duration settings (<code className="text-white">30</code>), and character visual reference inputs.
                </p>
                <p>
                  <strong className="text-white">Step 2: Post endpoint trigger:</strong><br />
                  Invoke <code className="text-white">POST /v1/agent/orchestrate</code>. The background crew kicks off sequentially: outlining, searching, scripting, storyboard generation, clip rendering, and MoviePy audio/video assembly.
                </p>
                <p>
                  <strong className="text-white">Step 3: Fetch video:</strong><br />
                  Listen to webhook callback alerts or poll status. Download the final compiled video files directly from R2 storage buckets.
                </p>
              </div>
            </div>
          </div>
        </PageTransition>
      );

    case 'faqs':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Common inquiries regarding visual generation tools, failed video refunds, and billing details.
            </p>
          </div>
          <div className="space-y-6">
            <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-lg hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> What happens if my video generation times out or fails?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Video synthesis takes some processing time because the server polls xAI APIs asynchronously. If a video fails, is rejected, or expires, the backend automatically refunds all consumed pulses to your balance. Your session is updated automatically.
              </p>
            </div>
            <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-lg hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> Can I extend video outputs continuously using Flow?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Yes! Flow lets you upload an initial generated video and append new movements sequentially. The system feeds the tail end frames of the previous clip back as optical priors, ensuring continuity.
              </p>
            </div>
            <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-lg hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> Do I own copyrights for generated visual assets?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Yes. For all commercial memberships (Basic, Premium, Pro), full copyrights are granted to you. You can monetize, share, and utilize generated files in any commercial, broadcast, or streaming project.
              </p>
            </div>
            <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-lg hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> What is the language limitation for cloned voices?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Cloned voice identities are restricted to 13 fully validated languages (EN, ZH, JA, DE, FR, ES, KO, AR, RU, NL, IT, PL, PT) under our Fish Speech cloning subsystem. Default system voices do not share this limitation.
              </p>
            </div>
            <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-lg hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> How are agentic video flows priced compared to manual edits?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Agentic workflows leverage multiple tool calls. Running the Multi-Agent Crew costs a flat coordination rate of <strong className="text-white">5,000 pulses</strong> per run, plus the standard seconds rate for each generated video clip (e.g. 1,500 pulses/sec for HD) and 1 pulse/char for TTS. If a clip generation fails during agent loops, it is automatically retried and not billed.
              </p>
            </div>
          </div>
        </PageTransition>
      );

    case 'terms':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Terms & Policy
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Please review our operational guidelines and policies to ensure compliant use of our visual and voice systems.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link href="/terms-of-use" target="_blank" className="bg-zinc-950/40 hover:bg-white/[0.02] border border-white/5 hover:border-white/20 p-8 rounded-lg flex flex-col items-start gap-6 transition-all group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all">
                <FileText className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-2">Terms of Use</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-6">Review standard usage policies, user licensing, and billing structures.</p>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest group-hover:underline">Read full document →</span>
              </div>
            </Link>

            <Link href="/privacy-policy" target="_blank" className="bg-zinc-950/40 hover:bg-white/[0.02] border border-white/5 hover:border-white/20 p-8 rounded-lg flex flex-col items-start gap-6 transition-all group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all">
                <ShieldCheck className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-2">Privacy Policy</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-6">Understand data protection metrics, storage structures, and R2 encryption standards.</p>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest group-hover:underline">Read full policy →</span>
              </div>
            </Link>
          </div>
        </PageTransition>
      );

    case 'api':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              API Reference
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-3xl mb-6">
              Integrate the iPulse AI neural rendering engines directly into your applications. Our REST API handles authentication via Bearer tokens, accepts JSON request payloads, and delivers secure storage URLs for generated assets.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-950/60 border border-white/10 rounded-md text-[10px] font-mono uppercase tracking-widest text-white">
              Base URL: <span className="text-cyan-400">https://api.ipulselabs.net/v1</span>
            </div>
          </div>

          <div className="space-y-16 mt-8">
            {/* Auth section */}
            <div className="space-y-4">
              <h2 className="text-xl font-mono text-white tracking-widest uppercase">
                Authentication
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-2xl">
                All requests to the iPulse API must include an authorization header with your secret API key. Never expose your API keys in client-side code or public repositories.
              </p>
              <div className="bg-zinc-950/60 border border-white/5 rounded-md p-4 overflow-x-auto">
                <pre className="text-[11px] font-mono text-zinc-300">
                  <span className="text-emerald-400">Authorization:</span> Bearer <span className="text-amber-400">sk_live_ipulse_72x9d8...</span>
                </pre>
              </div>
            </div>

            {/* API Endpoint: TTS */}
            <div className="space-y-6">
              <h2 className="text-lg font-mono text-white tracking-widest uppercase flex items-center gap-3">
                <div className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-sm font-bold">POST</div> Text to Speech
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">/v1/audio/speech</code>
                <br /><br />
                Converts text inputs to lifelike speech streams. Returns the audio stream directly or delivers an R2 CDN URL.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-zinc-950/40 border border-white/5 rounded-md overflow-hidden text-[10px] font-mono">
                  <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.01] text-zinc-500 uppercase tracking-widest font-bold">
                    Request Parameters
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">input</span>
                        <span className="text-rose-400">required</span>
                        <span className="text-zinc-500">string</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">The text content to convert to voice. Max characters: 15,000.</p>
                    </div>
                    <div className="border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">voice_id</span>
                        <span className="text-rose-400">required</span>
                        <span className="text-zinc-500">string</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">ID of system voice (e.g. "eve") or a custom cloned voice.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">stability</span>
                        <span className="text-zinc-500">float</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">Stability coefficient from 0.0 to 1.0. Default is 0.70.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-black border border-white/10 rounded-md overflow-hidden shadow-2xl">
                    <div className="px-4 py-2 border-b border-white/10 bg-[#111] flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="p-4 overflow-x-auto text-[10px] font-mono leading-relaxed text-zinc-300">
                      <pre>
                        {`curl https://api.ipulselabs.net/v1/audio/speech \\
  -H "Authorization: Bearer $IPULSE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "Neural voice synthesis active.",
    "voice_id": "eve",
    "stability": 0.75
  }' --output speech.mp3`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Endpoint: Direct Video Gen */}
            <div className="space-y-6">
              <h2 className="text-lg font-mono text-white tracking-widest uppercase flex items-center gap-3">
                <div className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-sm font-bold">POST</div> Video Synthesis
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">/v1/video/generate</code>
                <br /><br />
                Synthesizes a new video clip from prompt variables. Runs asynchronously.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-zinc-950/40 border border-white/5 rounded-md overflow-hidden text-[10px] font-mono">
                  <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.01] text-zinc-500 uppercase tracking-widest font-bold">
                    Request Parameters
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">prompt</span>
                        <span className="text-rose-400">required</span>
                        <span className="text-zinc-500">string</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">Text description of the action. Max length: 1,000 characters.</p>
                    </div>
                    <div className="border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">aspect_ratio</span>
                        <span className="text-zinc-500">string</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">Target grid format (1:1, 16:9, 9:16). Default is 16:9.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">duration</span>
                        <span className="text-zinc-500">integer</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">Length in seconds (5, 10, or 15). Default is 5.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-black border border-white/10 rounded-md overflow-hidden shadow-2xl">
                    <div className="px-4 py-2 border-b border-white/10 bg-[#111] flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="p-4 overflow-x-auto text-[10px] font-mono leading-relaxed text-zinc-300">
                      <pre>
                        {`curl https://api.ipulselabs.net/v1/video/generate \\
  -H "Authorization: Bearer $IPULSE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "futuristic car racing in neon cyber city, panning shot",
    "aspect_ratio": "16:9",
    "duration": 5
  }'`}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-zinc-950/40 border border-white/5 rounded-md p-4 text-[10px] font-mono text-zinc-500 leading-normal">
                    <div className="text-white font-bold mb-1">Response Sample (202 Accepted)</div>
                    <pre className="text-cyan-400">{`{
  "job_id": "vid_job_72x881a2d",
  "status": "queued",
  "est_rendering_time_seconds": 15
}`}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* API Endpoint: Flow Extension */}
            <div className="space-y-6">
              <h2 className="text-lg font-mono text-white tracking-widest uppercase flex items-center gap-3">
                <div className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-sm font-bold">POST</div> Video Flow Extension
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">/v1/video/flow</code>
                <br /><br />
                Appends consecutive action scenes to an existing video source.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-zinc-950/40 border border-white/5 rounded-md overflow-hidden text-[10px] font-mono">
                  <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.01] text-zinc-500 uppercase tracking-widest font-bold">
                    Request Parameters
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">video_url</span>
                        <span className="text-rose-400">required</span>
                        <span className="text-zinc-500">string</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">URL of source video to extend. Must resolve to an MP4 asset.</p>
                    </div>
                    <div className="border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">prompt</span>
                        <span className="text-rose-400">required</span>
                        <span className="text-zinc-500">string</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">Description of the next chronological action.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-black border border-white/10 rounded-md overflow-hidden shadow-2xl">
                    <div className="px-4 py-2 border-b border-white/10 bg-[#111] flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="p-4 overflow-x-auto text-[10px] font-mono leading-relaxed text-zinc-300">
                      <pre>
                        {`curl https://api.ipulselabs.net/v1/video/flow \\
  -H "Authorization: Bearer $IPULSE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "video_url": "https://storage.ipulselabs.net/u1/source.mp4",
    "prompt": "the camera zooms in on the drivers eyes"
  }'`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* API Endpoint: Multi-Agent */}
            <div className="space-y-6">
              <h2 className="text-lg font-mono text-white tracking-widest uppercase flex items-center gap-3">
                <div className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-sm font-bold">POST</div> Multi-Agent Orchestration
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">/v1/agent/orchestrate</code>
                <br /><br />
                Triggers the complete collaborative agent pipeline to compile a final video.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-zinc-950/40 border border-white/5 rounded-md overflow-hidden text-[10px] font-mono">
                  <div className="px-4 py-2.5 border-b border-white/5 bg-white/[0.01] text-zinc-500 uppercase tracking-widest font-bold">
                    Request Parameters
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">brief</span>
                        <span className="text-rose-400">required</span>
                        <span className="text-zinc-500">string</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">High-level concept or text description to feed the Idea Generator.</p>
                    </div>
                    <div className="border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">workflow_mode</span>
                        <span className="text-zinc-500">string</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">Orchestration mode (creative, research, image_to_video, verbatim).</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">ref_image_url</span>
                        <span className="text-zinc-500">string</span>
                      </div>
                      <p className="text-zinc-400 leading-normal">Optional image link to lock character styling consistency.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-black border border-white/10 rounded-md overflow-hidden shadow-2xl">
                    <div className="px-4 py-2 border-b border-white/10 bg-[#111] flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="p-4 overflow-x-auto text-[10px] font-mono leading-relaxed text-zinc-300">
                      <pre>
                        {`curl https://api.ipulselabs.net/v1/agent/orchestrate \\
  -H "Authorization: Bearer $IPULSE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "brief": "explain how quantum computing works with retro styling",
    "workflow_mode": "research",
    "duration": 30
  }'`}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-zinc-950/40 border border-white/5 rounded-md p-4 text-[10px] font-mono text-zinc-500 leading-normal">
                    <div className="text-white font-bold mb-1">Response Sample (202 Accepted)</div>
                    <pre className="text-cyan-400">{`{
  "crew_job_id": "crew_job_81x992",
  "status": "orchestrating",
  "active_agent": "Creative Video Idea Generator"
}`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageTransition>
      );

    default:
      return null;
  }
}
