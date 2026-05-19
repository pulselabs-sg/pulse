'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check, ShieldCheck, FileText, Zap, Mic, AudioLines,
  Sparkles, Terminal, Wand2, Image as ImageIcon, Video,
  HelpCircle, Clock, PlayCircle, Layers, CheckCircle2,
  AlertTriangle, ArrowRight, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLANS } from '@/lib/dashboard-constants';

export default function DocsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const validSlugs = ['introduce', 'image', 'video', 'flow', 'audio', 'pricing', 'tutorials', 'faqs', 'terms', 'api'];
  if (!slug || !validSlugs.includes(slug)) {
    notFound();
  }

  const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="space-y-12"
    >
      {children}
    </motion.div>
  );

  switch (slug) {
    case 'introduce':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm text-[9px] font-mono uppercase tracking-widest backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse rounded-full"></span>
              <span className="text-zinc-400">VISION ENGINE PLATFORM ONLINE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Platform Overview
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl mb-6">
              Welcome to the official documentation for iPulse AI. We engineer professional-grade, neural generation pipelines optimized for visual and auditory synthesis. With native support for state-of-the-art video diffusion models, image edit modules, and ultra-low latency voice cloning infrastructure, iPulse represents a unified dashboard for advanced creators.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/docs/image" className="px-5 py-2 bg-white text-black text-[10px] font-mono uppercase tracking-widest font-bold rounded-sm hover:bg-zinc-200 transition-colors">
                Image Synthesis
              </Link>
              <Link href="/docs/video" className="px-5 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest font-bold rounded-sm hover:bg-white/10 transition-colors">
                Video Production
              </Link>
              <Link href="/docs/flow" className="px-5 py-2 bg-white/5 border border-cyan-500/20 text-zync-400 text-[10px] font-mono uppercase tracking-widest font-bold rounded-sm hover:bg-cyan-500/5 transition-colors">
                Flow extension
              </Link>
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400" /> Core Architectures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#080808] border border-white/5 p-6 rounded-sm hover:border-white/10 transition-colors">
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400" /> Video Diffusion
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Leverages xAI's temporal diffusion models to simulate physical dynamics, light reflections, and camera pans with incredible photorealism.
                </p>
              </div>
              <div className="bg-[#080808] border border-white/5 p-6 rounded-sm hover:border-white/10 transition-colors">
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" /> Imagine Diffusion
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Generates crisp, multi-aspect-ratio images and carries out localized image edits using advanced base64 image conditioning.
                </p>
              </div>
              <div className="bg-[#080808] border border-white/5 p-6 rounded-sm hover:border-white/10 transition-colors">
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-400" /> Neural Audio
                </h3>
                <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                  Autoregressive transformers for text-to-speech, cloning, and vocal conversion with real-time speaker diarization and noise clean modules.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Workspace Features Matrix
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/docs/image" className="bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-sm p-6 group block">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Image Synthesis (Imagine)</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Generate images with dynamic aspect ratios and quality configurations. Modify specific areas using reference images and text instructions.
                </p>
              </Link>
              <Link href="/docs/video" className="bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-sm p-6 group block">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Video className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Video Production</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Synthesize cinematic video clips from text prompts or transform static image assets into dynamic video scenes with realistic camera operations.
                </p>
              </Link>
              <Link href="/docs/flow" className="bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-sm p-6 group block">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Wand2 className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Flow Video Extension</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Upload an existing video and extend the action. The model maintains continuity by feeding the final frames back as context.
                </p>
              </Link>
              <Link href="/docs/audio" className="bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-sm p-6 group block">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Mic className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Audio Synthesis & Cloning</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">
                  Autoregressive multi-speaker TTS, voice cloning, clean vocal processing, and voice conversion preserving original vocal styles.
                </p>
              </Link>
            </div>
          </div>
        </PageTransition>
      );

    case 'image':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm text-[9px] font-mono uppercase tracking-widest backdrop-blur-sm mb-6">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">DIFFUSION MODULES</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Image Synthesis
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              Understand the configurations, aspect ratios, editing modes, and formatting standards supported by the iPulse Imagine image synthesis modules.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Layers className="w-5 h-5 text-cyan-400" /> Aspect Ratios
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Different aspect ratios adjust the crop grid and compositions under the hood to output balanced layouts. Choose the optimal layout based on your destination canvas:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                <div className="w-8 h-8 border border-white/30 rounded-sm bg-white/5 mb-3 flex items-center justify-center font-mono text-[10px] text-white">1:1</div>
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2">1:1 Square</h3>
                <p className="text-[9px] font-mono text-zinc-500 leading-relaxed">
                  Perfect for avatars, icons, profile portraits, and square catalog mockups. Highly balanced composition weights.
                </p>
              </div>
              <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                <div className="w-12 h-6 border border-white/30 rounded-sm bg-white/5 mb-3 flex items-center justify-center font-mono text-[10px] text-white">16:9</div>
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2">16:9 Cinematic</h3>
                <p className="text-[9px] font-mono text-zinc-500 leading-relaxed">
                  Ideal for website banners, YouTube thumbnails, cinematic backdrop plates, and widescreen presentations.
                </p>
              </div>
              <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                <div className="w-6 h-12 border border-white/30 rounded-sm bg-white/5 mb-3 flex items-center justify-center font-mono text-[10px] text-white">9:16</div>
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2">9:16 Portrait</h3>
                <p className="text-[9px] font-mono text-zinc-500 leading-relaxed">
                  Optimized for mobile-first environments, TikTok creatives, Instagram Stories, and vertical social marketing banners.
                </p>
              </div>
              <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                <div className="w-10 h-8 border border-white/30 rounded-sm bg-white/5 mb-3 flex items-center justify-center font-mono text-[10px] text-white">4:3</div>
                <h3 className="text-xs font-mono font-bold uppercase text-white mb-2">4:3 Classical</h3>
                <p className="text-[9px] font-mono text-zinc-500 leading-relaxed">
                  Traditional web layout. Highly compatible with legacy UI components and standard document print dimensions.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Quality & Editing Features
            </h2>
            <div className="space-y-4">
              <div className="border-l-2 border-cyan-400 pl-4 py-1">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Image Generation Mode</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  Synthesize new images from pure text prompts. Our system uses advanced diffusion solvers to generate fine details, realistic skin textures, metallic reflections, and volumetric light scattering.
                </p>
              </div>
              <div className="border-l-2 border-cyan-400 pl-4 py-1">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Image Editing (Inpainting / Style Transfer)</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  By uploading a reference image and selecting the image-editing mode, the workspace passes a base64 image data-URI alongside your text instructions. The model overlays the new styles, replaces the background, or modifies items while maintaining structural alignment.
                </p>
              </div>
              <div className="border-l-2 border-cyan-400 pl-4 py-1">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Pricing & Failure Safeguards</h3>
                <p className="text-xs font-mono text-zinc-400 leading-relaxed mt-1">
                  Generating or editing an image costs a flat rate of <strong className="text-white">1,500 pulses</strong> per transaction. If a request is rejected by xAI or the permanent R2 storage upload fails, consumed pulses are instantly refunded.
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm text-[9px] font-mono uppercase tracking-widest backdrop-blur-sm mb-6">
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

          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Clock className="w-5 h-5 text-cyan-400" /> Temporal Durations
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Standard clips can be generated in increments of <strong className="text-white">5 seconds, 10 seconds, or 15 seconds</strong>. Longer videos require more computing time but maintain temporal consistency throughout the playback.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Zap className="w-5 h-5 text-cyan-400" /> Quality & Pricing Matrix
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Credit pricing is computed dynamically per second, based on the selected resolution quality:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#080808] border border-white/5 p-6 rounded-sm">
                <div className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 text-white font-mono text-[9px] uppercase tracking-widest mb-4">SD Quality (480p)</div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">1,200 Pulses / Second</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed space-y-1">
                  • <strong>5 Seconds</strong>: 6,000 Pulses<br />
                  • <strong>10 Seconds</strong>: 12,000 Pulses<br />
                  • <strong>15 Seconds</strong>: 18,000 Pulses<br />
                  • Best for social mockups, fast testing, and draft animations.
                </p>
              </div>
              <div className="bg-[#080808] border border-cyan-400/20 p-6 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.03)]">
                <div className="inline-block px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 font-mono text-[9px] uppercase tracking-widest mb-4">HD Quality & above (720p+)</div>
                <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2">1,500 Pulses / Second</h3>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed space-y-1">
                  • <strong>5 Seconds</strong>: 7,500 Pulses<br />
                  • <strong>10 Seconds</strong>: 15,000 Pulses<br />
                  • <strong>15 Seconds</strong>: 22,500 Pulses<br />
                  • High-definition textures, crisp boundaries, realistic volumetric light, cinematic output.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#080808] border border-white/5 p-6 rounded-sm">
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm text-[9px] font-mono uppercase tracking-widest backdrop-blur-sm mb-6">
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-zinc-400">FLOW EXTENSION MECHANICS</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Flow Video Extension
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              Master the mechanics behind our Flow system to sequentially extend and animate video assets.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Layers className="w-5 h-5 text-cyan-400" /> How Flow Works
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed">
              Traditional text-to-video generators create animations from scratch. The <strong className="text-white">Flow</strong> system behaves differently:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                <span className="text-cyan-400 font-mono text-xs font-bold">01 / Frame Parsing</span>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed mt-2">
                  The model extracts visual grids and optical flows from the final frames of your uploaded source video.
                </p>
              </div>
              <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                <span className="text-cyan-400 font-mono text-xs font-bold">02 / Prompt Transition</span>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed mt-2">
                  The continuation prompt instructs the diffusion engine on how objects should move, zoom, or transition next.
                </p>
              </div>
              <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                <span className="text-cyan-400 font-mono text-xs font-bold">03 / Fluid Synthesis</span>
                <p className="text-[10px] font-mono text-zinc-500 leading-relaxed mt-2">
                  The model appends new frames seamlessly, preserving color tones, brightness, and character layout.
                </p>
              </div>
            </div>
          </div>

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm text-[9px] font-mono uppercase tracking-widest backdrop-blur-sm mb-6">
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
            {/* TTS */}
            <div className="bg-[#080808] border border-white/5 p-6 rounded-sm">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">Text-to-Speech (TTS)</h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-4">
                Enter your text and synthesis variables (Stability and Similarity controls). The model outputs highly realistic voice streams.
              </p>
              <ul className="list-disc list-inside space-y-2 text-[10px] font-mono text-zinc-500">
                <li><strong>Stability</strong> (0.0 - 1.0): Adjusts prosody variation. Lower values make vocal delivery more dynamic.</li>
                <li><strong>Similarity Boost</strong> (0.0 - 1.0): Determines how closely the clone parameters adhere to the original training asset.</li>
              </ul>
            </div>

            {/* Custom Voice Cloning */}
            <div className="bg-[#080808] border border-white/5 p-6 rounded-sm">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider mb-3">Custom Voice Cloning</h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-4">
                Clone specific vocal profiles by uploading 1-2 minutes of clean audio datasets. Ensure minimal background echoes.
              </p>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm mb-4">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Language Restrictions
                </span>
                <p className="text-[10px] font-mono text-amber-500/80 leading-relaxed mt-1">
                  Custom voices are optimized for exactly 13 languages (EN, ZH, JA, DE, FR, ES, KO, AR, RU, NL, IT, PL, PT). Attempting to use cloned voices on unsupported languages may result in degradation or gibberish.
                </p>
              </div>
            </div>

            {/* Voice Changer & Cleaner */}
            <div className="bg-[#080808] border border-white/5 p-6 rounded-sm">
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
          <div className="border-b border-white/5 pb-8">
            <h1 className="text-3xl md:text-5xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Pricing Matrix
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-4xl">
              Review pulse cost details broken down by categories, along with membership allowances. Secure payments handled via Polar.sh.
            </p>
          </div>

          {/* Three Distinct Sections: Video, Image, Audio */}
          <div className="space-y-12">
            <div>
              <h2 className="text-base md:text-lg font-mono font-bold text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3 border-b border-white/5 pb-2">
                <span className="text-cyan-400">01 /</span> Video
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#080808] border border-cyan-400/20 p-5 rounded-sm shadow-[0_0_15px_rgba(6,182,212,0.02)]">
                  <h3 className="text-xs font-mono font-bold text-zync-400 uppercase mb-2">Quality Multiplier</h3>
                  <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                    SD (480p): <strong>1,200 pulses/sec</strong><br />
                    HD (720p+): <strong>1,500 pulses/sec</strong><br />
                    Charges calculate dynamically on target temporal length.
                  </p>
                </div>
                <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                  <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">SD Calculations (480p)</h3>
                  <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                    • 5 seconds: <strong>6,000 pulses</strong><br />
                    • 10 seconds: <strong>12,000 pulses</strong><br />
                    • 15 seconds: <strong>18,000 pulses</strong>
                  </p>
                </div>
                <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                  <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">HD Calculations (720p+)</h3>
                  <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                    • 5 seconds: <strong>7,500 pulses</strong><br />
                    • 10 seconds: <strong>15,000 pulses</strong><br />
                    • 15 seconds: <strong>22,500 pulses</strong>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-mono font-bold text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3 border-b border-white/5 pb-2">
                <span className="text-cyan-400">02 /</span> Image
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                  <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">Static Charge Rate</h3>
                  <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                    Standard generation: <strong>1,500 pulses</strong><br />
                    Image-Editing (Inpainting): <strong>1,500 pulses</strong><br />
                    Flat rates apply across all dimensions and aspect ratios.
                  </p>
                </div>
                <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                  <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">Fail-Refund Safety</h3>
                  <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                    If diffusion tasks time out or fail to upload to R2, the system automatically logs a full refund of 1,500 pulses.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-mono font-bold text-white uppercase tracking-[0.25em] mb-6 flex items-center gap-3 border-b border-white/5 pb-2">
                <span className="text-cyan-400">03 /</span> Voice
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                  <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">Text to Speech</h3>
                  <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                    Rate: <strong>1 pulse / character</strong><br />
                    Identical cached requests do not consume credits.
                  </p>
                </div>
                <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                  <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">Changer & Cleaner</h3>
                  <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                    Rate: <strong>1,000 pulses / minute</strong><br />
                    Calculated on audio timeline length.
                  </p>
                </div>
                <div className="bg-[#080808] border border-white/5 p-5 rounded-sm">
                  <h3 className="text-xs font-mono font-bold text-white uppercase mb-2">Voice Cloning</h3>
                  <p className="text-[11px] font-mono text-zinc-500 leading-relaxed">
                    Rate: <strong>5,000 pulses / clone</strong><br />
                    Applies on training data compilation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3 mb-8">
              Subscription Tiers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {PLANS.map((plan) => (
                <div key={plan.id} className={cn("bg-[#080808] border p-6 flex flex-col relative transition-all duration-300 hover:-translate-y-1", plan.popular ? "border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.1)]" : "border-white/10 hover:border-white/30")}>
                  {plan.popular && <div className="text-[9px] font-mono uppercase tracking-widest text-black bg-cyan-400 font-bold inline-block px-3 py-1 mb-4 self-start absolute top-0 -translate-y-1/2 left-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]">RECOMMENDED</div>}

                  <div className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-2">{plan.name}</div>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-mono font-bold text-white">${plan.priceMonthly}</span>
                    <span className="text-[10px] font-mono uppercase text-zinc-500">/mo</span>
                  </div>

                  <p className="text-[10px] font-mono tracking-widest text-zinc-400 mb-8 h-8 leading-relaxed">{plan.desc}</p>

                  <div className="space-y-6 mb-8 flex-1 text-left">
                    {/* General Section */}
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-2 font-bold">General</div>
                      <div className="flex items-start gap-3 text-[10px] font-mono tracking-wider text-white">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{plan.id === 'FREE' ? '40,000' : plan.id === 'BASIC' ? '120,000' : plan.id === 'PREMIUM' ? '300,000' : '1,500,000'} Pulses/mo</span>
                      </div>
                    </div>

                    {/* Audio Section */}
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-2 font-bold border-b border-white/5 pb-1">Voice & Audio</div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3 text-[10px] font-mono tracking-wider text-zinc-300">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{plan.id === 'FREE' || plan.id === 'BASIC' ? '5,000' : plan.id === 'PREMIUM' ? '10,000' : '15,000'} Char TTS Limit</span>
                        </li>
                        <li className="flex items-start gap-3 text-[10px] font-mono tracking-wider text-zinc-300">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{plan.id === 'FREE' || plan.id === 'BASIC' ? '5 min' : plan.id === 'PREMIUM' ? '10 min' : '15 min'} STT/Audio Limit</span>
                        </li>
                        <li className="flex items-start gap-3 text-[10px] font-mono tracking-wider text-zinc-300">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                          <span>
                            {plan.id === 'FREE' ? 'No Voice Cloning' : `Voice Cloning (Max ${plan.id === 'BASIC' ? '2' : plan.id === 'PREMIUM' ? '5' : '10'})`}
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Video & Image Section */}
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-2 font-bold border-b border-white/5 pb-1">Image & Video</div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-3 text-[10px] font-mono tracking-wider text-zinc-300">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                          <span>Image Gen & Edit (1.5k)</span>
                        </li>
                        <li className="flex items-start gap-3 text-[10px] font-mono tracking-wider text-zinc-300">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                          <span>Video Gen (1.2k - 1.5k/s)</span>
                        </li>
                        <li className="flex items-start gap-3 text-[10px] font-mono tracking-wider text-zinc-300">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                          <span>Flow Video Extension</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Link href="/dashboard" className={cn(
                    "w-full py-3 text-center text-[10px] font-mono uppercase tracking-widest font-bold transition-all rounded-sm flex items-center justify-center gap-2",
                    plan.popular ? "bg-cyan-400 text-black hover:bg-white" : "bg-white/5 hover:bg-white text-zinc-400 hover:text-black border border-white/10 hover:border-transparent"
                  )}>
                    Access Dashboard
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 overflow-x-auto border border-white/5 rounded-sm bg-[#080808]">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold bg-white/[0.02]">Feature / Limit</th>
                  <th className="p-4 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-white font-bold bg-white/[0.02]">Free</th>
                  <th className="p-4 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-white/[0.02]">Basic</th>
                  <th className="p-4 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-white font-bold bg-white/[0.02]">Premium</th>
                  <th className="p-4 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-white font-bold bg-white/[0.02]">Pro</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-mono tracking-wider text-zinc-400">
                {/* General Metric Header */}
                <tr className="bg-white/[0.02] border-y border-white/5">
                  <td colSpan={5} className="p-3 text-[9px] font-bold text-zinc-400 tracking-widest uppercase font-mono">
                    General Metrics
                  </td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">Pulse Allowance</td>
                  <td className="p-4">40,000 / mo</td>
                  <td className="p-4 text-cyan-400">120,000 / mo</td>
                  <td className="p-4">300,000 / mo</td>
                  <td className="p-4">1,500,000 / mo</td>
                </tr>

                {/* Voice & Audio Header */}
                <tr className="bg-white/[0.02] border-y border-white/5">
                  <td colSpan={5} className="p-3 text-[9px] font-bold text-zinc-400 tracking-widest uppercase font-mono">
                    Voice & Audio Limits & Rates
                  </td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">TTS Max Characters</td>
                  <td className="p-4">5,000</td>
                  <td className="p-4">5,000</td>
                  <td className="p-4">10,000</td>
                  <td className="p-4">15,000</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">Audio Max Duration</td>
                  <td className="p-4">5 mins</td>
                  <td className="p-4">5 mins</td>
                  <td className="p-4">10 mins</td>
                  <td className="p-4">15 mins</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">TTS Pulse Cost</td>
                  <td className="p-4">1 / char</td>
                  <td className="p-4">1 / char</td>
                  <td className="p-4">1 / char</td>
                  <td className="p-4">1 / char</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">Audio Pulse Cost</td>
                  <td className="p-4">1000 / min</td>
                  <td className="p-4">1000 / min</td>
                  <td className="p-4">1000 / min</td>
                  <td className="p-4">1000 / min</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">Voice Cloning</td>
                  <td className="p-4">—</td>
                  <td className="p-4">Max 2 Voices</td>
                  <td className="p-4">Max 5 Voices</td>
                  <td className="p-4">Max 10 Voices</td>
                </tr>

                {/* Video & Image Header */}
                <tr className="bg-white/[0.02] border-y border-white/5">
                  <td colSpan={5} className="p-3 text-[9px] font-bold text-zinc-400 tracking-widest uppercase font-mono">
                    Video & Image Limits & Rates
                  </td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">Image Gen Cost</td>
                  <td className="p-4">1500 / img</td>
                  <td className="p-4">1500 / img</td>
                  <td className="p-4">1500 / img</td>
                  <td className="p-4">1500 / img</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">Video Gen Cost (480p)</td>
                  <td className="p-4">1200 / sec</td>
                  <td className="p-4">1200 / sec</td>
                  <td className="p-4">1200 / sec</td>
                  <td className="p-4">1200 / sec</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">Video Gen Cost (720p+)</td>
                  <td className="p-4">1500 / sec</td>
                  <td className="p-4">1500 / sec</td>
                  <td className="p-4">1500 / sec</td>
                  <td className="p-4">1500 / sec</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center gap-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span>Secure Payments processed by <span className="text-white">Polar.sh</span></span>
          </div>
        </PageTransition>
      );

    case 'tutorials':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm text-[9px] font-mono uppercase tracking-widest backdrop-blur-sm mb-6">
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
            <div className="bg-[#080808] border border-white/5 p-6 rounded-sm hover:border-cyan-400/20 transition-all">
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
            <div className="bg-[#080808] border border-white/5 p-6 rounded-sm hover:border-cyan-400/20 transition-all">
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
            <div className="bg-[#080808] border border-white/5 p-6 rounded-sm hover:border-cyan-400/20 transition-all">
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
            <div className="bg-[#080808] border border-white/5 p-8 rounded-sm hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> What happens if my video generation times out or fails?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Video synthesis takes some processing time because the server polls xAI APIs asynchronously. If a video fails, is rejected, or expires, the backend automatically refunds all consumed pulses to your balance. Your session is updated automatically.
              </p>
            </div>
            <div className="bg-[#080808] border border-white/5 p-8 rounded-sm hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> Can I extend video outputs continuously using Flow?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Yes! Flow lets you upload an initial generated video and append new movements sequentially. The system feeds the tail end frames of the previous clip back as optical priors, ensuring continuity.
              </p>
            </div>
            <div className="bg-[#080808] border border-white/5 p-8 rounded-sm hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> Do I own copyrights for generated visual assets?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Yes. For all commercial memberships (Basic, Premium, Pro), full copyrights are granted to you. You can monetize, share, and utilize generated files in any commercial, broadcast, or streaming project.
              </p>
            </div>
            <div className="bg-[#080808] border border-white/5 p-8 rounded-sm hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> What is the language limitation for cloned voices?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Cloned voice identities are restricted to 13 fully validated languages (EN, ZH, JA, DE, FR, ES, KO, AR, RU, NL, IT, PL, PT) under our Fish Speech cloning subsystem. Default system voices do not share this limitation.
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
            <Link href="/terms-of-use" target="_blank" className="bg-[#080808] hover:bg-white/[0.02] border border-white/5 hover:border-white/20 p-8 rounded-sm flex flex-col items-start gap-6 transition-all group">
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all">
                <FileText className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-2">Terms of Use</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-6">Review standard usage policies, user licensing, and billing structures.</p>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest group-hover:underline">Read full document →</span>
              </div>
            </Link>

            <Link href="/privacy-policy" target="_blank" className="bg-[#080808] hover:bg-white/[0.02] border border-white/5 hover:border-white/20 p-8 rounded-sm flex flex-col items-start gap-6 transition-all group">
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
            <h1 className="text-3xl md:text-4xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              API Reference
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-3xl mb-6">
              The iPulse API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#080808] border border-white/10 rounded-sm text-[10px] font-mono uppercase tracking-widest text-white">
              Base URL: <span className="text-cyan-400">https://api.ipulselabs.net/v1</span>
            </div>
          </div>

          <div className="space-y-12 mt-8">
            {/* Authentication Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
                Authentication
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-2xl">
                The iPulse API uses API keys to authenticate requests. You can view and manage your API keys in the Dashboard. Your API keys carry many privileges, so be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.
              </p>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed max-w-2xl">
                Authentication to the API is performed via HTTP Bearer Auth. Provide your API key as the bearer token value.
              </p>
              <div className="bg-[#080808] border border-white/5 rounded-sm p-4 overflow-x-auto">
                <pre className="text-[11px] font-mono text-zinc-300">
                  <span className="text-emerald-400">Authorization:</span> Bearer <span className="text-amber-400">sk_live_...</span>
                </pre>
              </div>
            </div>

            {/* TTS Endpoint */}
            <div className="space-y-6">
              <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
                <div className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-1 rounded-sm">POST</div> Text to Speech
              </h2>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                <code className="bg-white/10 px-1 py-0.5 rounded-sm text-white">/v1/audio/speech</code>
                <br /><br />
                Converts text to lifelike spoken audio. Streams the audio file directly back to the client.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Request Params */}
                <div className="bg-[#080808] border border-white/5 rounded-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    Request Body
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="border-b border-white/5 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono text-white font-bold">model</span>
                        <span className="text-[9px] font-mono text-rose-400">required</span>
                        <span className="text-[9px] font-mono text-zinc-500">string</span>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400">The model to use, e.g., <code className="text-cyan-400">ipulse-tts-1</code> or <code className="text-cyan-400">ipulse-tts-1-hd</code>.</p>
                    </div>
                    <div className="border-b border-white/5 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono text-white font-bold">input</span>
                        <span className="text-[9px] font-mono text-rose-400">required</span>
                        <span className="text-[9px] font-mono text-zinc-500">string</span>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400">The text to generate audio for. Maximum length is 4096 characters.</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono text-white font-bold">voice</span>
                        <span className="text-[9px] font-mono text-rose-400">required</span>
                        <span className="text-[9px] font-mono text-zinc-500">string</span>
                      </div>
                      <p className="text-[10px] font-mono text-zinc-400">The voice ID to use. Can be a default voice or a Custom Voice ID.</p>
                    </div>
                  </div>
                </div>

                {/* Example Request/Response */}
                <div className="space-y-4">
                  <div className="bg-black border border-white/10 rounded-sm overflow-hidden shadow-2xl">
                    <div className="px-4 py-2 border-b border-white/10 bg-[#111] flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <div className="p-4 overflow-x-auto text-[11px] font-mono leading-relaxed">
                      <pre className="text-zinc-300">
                        curl https://api.ipulselabs.net/v1/audio/speech \
                        -H "Authorization: Bearer $IPULSE_API_KEY" \
                        -H "Content-Type: application/json" \
                        -d '{'{'}
                        "model": "ipulse-tts-1",
                        "input": "The neural synthesis engine is online.",
                        "voice": "alloy"
                        {'}'}' \
                        --output speech.mp3
                      </pre>
                    </div>
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
