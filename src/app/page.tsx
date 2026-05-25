'use client';

import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { ArrowRight, AudioLines, Zap, Terminal, Mic, Check, Layers, Code, ShieldCheck, Globe, Activity, Server, Users, Video, Image, Film, Sparkles, Volume2, ChevronDown, Sliders, Play, Eye, Cpu, ImagePlus, Tv } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ModernBackground } from '@/components/ui/VisualEffects';

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setIsScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  return (
    <nav className={cn('fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-500 flex items-center px-6 md:px-12', isScrolled ? 'backdrop-blur-xl' : '')}>
      <div className="flex-1 flex items-center gap-3">
        <img src="/logo.webp" alt="iPulse" className="w-7 h-7 rounded-sm object-cover" />
        <span className="font-mono text-sm tracking-[0.2em] text-white uppercase">iPulse</span>
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center gap-8 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
        <div
          className="relative py-4 cursor-pointer group"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <span className="hover:text-white transition-colors flex items-center gap-1">
            Product <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", isDropdownOpen ? "rotate-180 text-white" : "")} />
          </span>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[640px] bg-black/60 backdrop-blur-sm border border-white/10 rounded-2xl p-6 grid grid-cols-3 gap-0 divide-x divide-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
              >
                <div className="pr-6">
                  <h4 className="text-[10px] font-bold text-white mb-4 tracking-widest flex items-center gap-1.5 uppercase font-mono"><Video className="w-3.5 h-3.5 text-white" /> Video</h4>
                  <ul className="space-y-4 text-[10px] normal-case text-zinc-400 font-sans">
                    <li>
                      <Link href="https://visual.ipulselabs.net" target="_blank" className="hover:text-white transition-colors block group/item">
                        <span className="font-semibold block text-zinc-200 group-hover/item:text-white transition-colors">Prompt to Video</span>
                        <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Generate cinema from text prompts</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="https://visual.ipulselabs.net" target="_blank" className="hover:text-white transition-colors block group/item">
                        <span className="font-semibold block text-zinc-200 group-hover/item:text-white transition-colors">Flow Extension</span>
                        <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Extend existing scenes seamlessly</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="https://visual.ipulselabs.net" target="_blank" className="hover:text-white transition-colors block group/item">
                        <span className="font-semibold block text-zinc-200 group-hover/item:text-white transition-colors">Cinematic Render</span>
                        <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Produce high-fidelity visuals</span>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="px-6">
                  <h4 className="text-[10px] font-bold text-white mb-4 tracking-widest flex items-center gap-1.5 uppercase font-mono"><Image className="w-3.5 h-3.5 text-white" /> Image</h4>
                  <ul className="space-y-4 text-[10px] normal-case text-zinc-400 font-sans">
                    <li>
                      <Link href="https://visual.ipulselabs.net" target="_blank" className="hover:text-white transition-colors block group/item">
                        <span className="font-semibold block text-zinc-200 group-hover/item:text-white transition-colors">Text to Image</span>
                        <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Synthesize hyper-realistic art</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="https://visual.ipulselabs.net" target="_blank" className="hover:text-white transition-colors block group/item">
                        <span className="font-semibold block text-zinc-200 group-hover/item:text-white transition-colors">Style Variation</span>
                        <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Transfer styling dynamically</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="https://visual.ipulselabs.net" target="_blank" className="hover:text-white transition-colors block group/item">
                        <span className="font-semibold block text-zinc-200 group-hover/item:text-white transition-colors">Upscaling & Edit</span>
                        <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Refine resolution and details</span>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="pl-6">
                  <h4 className="text-[10px] font-bold text-white mb-4 tracking-widest flex items-center gap-1.5 uppercase font-mono"><Volume2 className="w-3.5 h-3.5 text-white" /> Audio</h4>
                  <ul className="space-y-4 text-[10px] normal-case text-zinc-400 font-sans">
                    <li>
                      <Link href="https://audio.ipulselabs.net" target="_blank" className="hover:text-white transition-colors block group/item">
                        <span className="font-semibold block text-zinc-200 group-hover/item:text-white transition-colors">Neural TTS</span>
                        <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Convert text to natural voice</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="https://audio.ipulselabs.net" target="_blank" className="hover:text-white transition-colors block group/item">
                        <span className="font-semibold block text-zinc-200 group-hover/item:text-white transition-colors">Voice Cloning</span>
                        <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Create custom voice identities</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="https://audio.ipulselabs.net" target="_blank" className="hover:text-white transition-colors block group/item">
                        <span className="font-semibold block text-zinc-200 group-hover/item:text-white transition-colors">Speech to Text</span>
                        <span className="text-[9px] text-zinc-500 block leading-normal mt-0.5">Transcribe voice streams instantly</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Link href="#workflow" className="hover:text-white transition-colors">Workflow</Link>
        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
      </div>
      <div className="flex-1 flex justify-end">
        <Link href="https://visual.ipulselabs.net" target='_blank' className="px-5 py-2 bg-white text-black rounded-lg text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 group">
          Launch App <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </nav>
  );
};

const BentoFrames = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-none mx-auto lg:mx-0 lg:ml-auto">
      {/* Column 1 */}
      <div className="flex flex-col gap-4">
        {/* Frame 1: 16:9 Landscape Video */}
        <div className="h-40 sm:h-44 lg:h-48 w-full rounded-2xl border border-white/10 bg-black relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <video
            src="/0519.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Frame 2: 1:1 Image */}
        <div className="h-64 sm:h-72 lg:h-[20rem] w-full rounded-2xl border border-white/10 bg-black relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <img
            src="/tree.png"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt="Creative Canvas"
          />
        </div>
      </div>

      {/* Column 2 */}
      <div className="flex flex-col gap-4">
        {/* Frame 3: 9:16 Portrait Video */}
        <div className="h-64 sm:h-72 lg:h-[20rem] w-full rounded-2xl border border-white/10 bg-black relative overflow-hidden group hover:border-pink-500/30 transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <img
            src="/lion.png"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt="Creative Canvas"
          />
        </div>

        {/* Frame 4: 4:3 Classic Composition */}
        <div className="h-40 sm:h-44 lg:h-48 w-full rounded-2xl border border-white/10 bg-black relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <video
            src="/0520.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => (
  <div className="relative z-10 min-h-screen flex items-center px-6 md:px-12 pt-20 pb-12 lg:pt-16 lg:pb-12">
    {/* vertical center-line decoration */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.04) 60%, transparent 100%)' }} />

    <div className="max-w-[90rem] 2xl:max-w-[95rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      {/* ── Left: copy ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex flex-col items-start lg:col-span-5"
      >
        <div className="relative inline-flex overflow-hidden rounded-full p-[1px] mb-6">
          <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_50%,rgba(255,255,255,0.3)_75%,rgba(255,255,255,0.9)_100%)]" />
          <div className="inline-flex h-full w-full items-center gap-2 rounded-full bg-zinc-950/50 px-3 py-1.5 text-[10px] font-mono tracking-widest backdrop-blur-xl cursor-default">
            <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse rounded-full" />
            <span className="text-zinc-300">Neural Creative Engine v3.0 - Live</span>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-5xl tracking-tighter leading-[1.15] text-white mb-5">
          The vision of<br />
          <span className="text-white text-glow-white">Artificial</span><br />
          <span className="text-white">Intelligence.</span>
        </h1>

        <p className="text-xs md:text-sm font-mono text-zinc-400 max-w-sm leading-relaxed">
          Synthesize cinematic video, generate stunning imagery, and orchestrate neural audio through a single unified creative API.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-start gap-3">
          <Link href="/dashboard" target='_blank' className="px-5 py-2.5 bg-white text-black rounded-lg text-[10px] font-mono uppercase tracking-[0.15em] font-bold hover:bg-zinc-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.08)] flex items-center gap-2 group">
            Try iPulse <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/docs" target='_blank' className="px-5 py-2.5 text-white rounded-lg text-[10px] font-mono uppercase tracking-[0.15em] font-bold hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2">
            <Code className="w-3 h-3" /> Read the Docs
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
          <span className="flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5" /> SOC 2 Compliant</span>
          <span className="w-px h-2.5 bg-white/10" />
          <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> Sub-1.2s Render</span>
          <span className="w-px h-2.5 bg-white/10" />
          <span className="flex items-center gap-1"><Globe className="w-2.5 h-2.5" /> 150+ Style Presets</span>
        </div>
      </motion.div>

      {/* ── Right: bento frames grid ── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        className="flex flex-col gap-3 w-full lg:col-span-7"
      >
        <BentoFrames />
      </motion.div>
    </div>
  </div>
);


const StatsStrip = () => {
  const stats = [
    { label: 'Generations / Day', value: '5.2M+' }, { label: 'Uptime', value: '99.99%' },
    { label: 'Active Creators', value: '250k+' }, { label: 'Video Models', value: '18+' },
    { label: 'Image Presets', value: '150+' }, { label: 'Avg. Render', value: '<1.2s' },
  ];
  return (
    <div className="relative z-10 bg-black/10 backdrop-blur-xl border-y border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1">
              <span className="text-2xl font-bold font-mono text-white">{s.value}</span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeatureVisualVideo = () => (
  <div className="glass-mid rounded-2xl p-6 border border-white/8 overflow-hidden relative">
    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center justify-between">
      <span>Video Flow Pipeline</span>
      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />Active</span>
    </div>

    <div className="flex items-center justify-between gap-3 mb-4">
      {/* Box 1: Video Placeholder */}
      <div className="flex-1 aspect-[4/3] rounded-xl border border-white/10 bg-black/40 flex flex-col items-center justify-center relative">
        <video
          src="/0521.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-xl"
        />
      </div>

      {/* Arrow Icon pointing to the right */}
      <ArrowRight className="w-5 h-5 text-zinc-600 shrink-0" />

      {/* Box 2: Empty description block */}
      <div className="flex-1 aspect-[4/3] rounded-lg border border-dashed border-white/10 bg-white/[0.01] flex items-center justify-center text-center">
        <span className="text-[9px] font-mono text-zinc-500 leading-normal italic">
          "Describe what happens next..."
        </span>
      </div>
    </div>

    <div className="flex items-center justify-between border-t border-white/5 pt-4">
      <span className="text-[10px] font-mono text-zinc-500">Flow Extension Mode</span>
      <span className="text-[10px] font-mono text-cyan-400">Ready to Extend</span>
    </div>
  </div>
);

const FeatureVisualImage = () => (
  <div className="glass-dark rounded-2xl p-6 border border-white/8 overflow-hidden relative">
    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-5">Adherence & Alignment</div>
    <div className="space-y-3">
      {['Text Prompt Match', 'Style Embedding', 'Pixel Synthesis'].map((label, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-zinc-500 w-28 shrink-0">{label}</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div animate={{ width: ['0%', `${85 + i * 5}%`] }} transition={{ duration: 1.8, delay: i * 0.2, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
          </div>
          <span className="text-[9px] font-mono text-zinc-400">{85 + i * 5}%</span>
        </div>
      ))}
    </div>
    <div className="mt-5 pt-4 border-t border-white/5 text-[10px] font-mono text-zinc-500 flex justify-between">
      <span>Generation Quality: <span className="text-white font-bold">Ultra-HD</span></span>
      <span>Style affinity: <span className="text-white font-bold">97.8%</span></span>
    </div>
  </div>
);

const FeatureVisualAPI = () => (
  <div className="glass-dark rounded-2xl p-5 border border-white/8 font-mono text-xs overflow-hidden">
    <div className="flex gap-1.5 mb-4">
      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-white/20" />
    </div>
    <pre className="text-[11px] leading-relaxed text-zinc-400 overflow-x-auto whitespace-pre-wrap">{`// Generate AI Video via REST API
fetch('/v1/video/generate', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer API_KEY' },
  body: JSON.stringify({
    prompt: 'Cinematic tracking shot of futuristic city',
    aspect_ratio: '16:9',
    motion_scale: 1.2,
    frames: 120
  })
});`}</pre>
  </div>
);

const featuresData = [
  { id: 'video-flow', tag: 'Flow Extension', title: 'Extend any video.\nSeamless continuity.', desc: 'Power your creative timeline with neural Flow video expansion. Seamlessly extend original video assets, generate subsequent keyframes, and maintain absolute character and style consistency across long clips.', icon: Film, visual: <FeatureVisualVideo />, reverse: false },
  { id: 'creative-canvas', tag: 'Image Synthesis', title: 'Stunning artwork.\nInfinite variations.', desc: 'Synthesize photorealistic images and high-fidelity designs from natural language prompts. Infinite style variation, hyper-accurate prompt adherence, and zero-shot control mapping.', icon: Sparkles, visual: <FeatureVisualImage />, reverse: true },
  { id: 'api', tag: 'Developer API', title: 'Integrate neural creative\ninto any stack.', desc: 'Standard REST endpoints, WebSocket streaming, and SDKs for Python, Node, and Go. Built for production with 99.99% uptime and global edge delivery.', icon: Terminal, visual: <FeatureVisualAPI />, reverse: false },
];

const FeaturesAlternating = () => (
  <section id="features" className="relative z-10 py-32">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-24">
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Core Modules</p>
        <h2 className="text-4xl md:text-5xl text-white tracking-tight">Built for what is next.</h2>
      </div>
      <div className="flex flex-col gap-32">
        {featuresData.map((f, i) => (
          <motion.div key={i} id={f.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }} className={cn('grid grid-cols-1 lg:grid-cols-2 gap-16 items-center', f.reverse ? 'lg:grid-flow-dense' : '')}>
            <div className={f.reverse ? 'lg:col-start-2' : ''}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">{f.tag}</p>
              <h3 className="text-3xl md:text-4xl text-white tracking-tight mb-6 whitespace-pre-line">{f.title}</h3>
              <p className="text-sm font-mono text-zinc-400 leading-relaxed max-w-md mb-8">{f.desc}</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-white border-b border-white/20 pb-0.5 hover:border-white/60 transition-colors group">
                Explore module <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className={f.reverse ? 'lg:col-start-1 lg:row-start-1' : ''}>{f.visual}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);


const steps = [
  { num: '01', title: 'Prompt & Direct', desc: 'Define your scene with natural language, reference images, or keyframes. Adjust motion paths and layouts.' },
  { num: '02', title: 'Neural Synthesis', desc: 'Models analyze context, flow maps, and styles to render high-fidelity video frames or upscale details.' },
  { num: '03', title: 'Stream & Scale', desc: 'Receive high-fidelity video streams or image variations instantly via REST, WebSocket, or SDKs.' },
];

const VerticalTimeline = () => (
  <section id="workflow" className="relative z-10 py-32 border-y border-white/5">
    <div className="max-w-4xl mx-auto px-6">
      <div className="text-center mb-20">
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Workflow</p>
        <h2 className="text-4xl md:text-5xl text-white tracking-tight">From vision to reality.</h2>

      </div>
      <div className="relative pl-12">
        <div className="absolute left-[23px] top-10 bottom-10 w-px bg-gradient-to-b from-white/15 via-white/8 to-transparent" />
        <div className="flex flex-col gap-16">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.15 }} className="relative">
              <div className="absolute -left-12 top-1.5 w-[10px] h-[10px] rounded-full border border-white/30 bg-black flex items-center justify-center">
                <div className="w-[4px] h-[4px] rounded-full bg-white/60" />
              </div>
              <p className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest mb-2">{s.num}</p>
              <h3 className="text-2xl font-bold text-white mb-3">{s.title}</h3>
              <p className="text-sm font-mono text-zinc-500 max-w-lg leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const StudioPanel = () => {
  const [prompt, setPrompt] = useState('A cinematic landscape of glowing crystal forests, purple gas giant rising in the background, unreal engine 5 render, highly detailed.');
  const [style, setStyle] = useState('Cinematic');
  const [ratio, setRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(100);

  const triggerGeneration = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setProgress(0);
  };

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsGenerating(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <section className="relative z-10 py-32 max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Live Creative Studio</p>
        <h2 className="text-4xl text-white tracking-tight">Direct the model live.</h2>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <div className="glass-dark rounded-2xl overflow-hidden border border-white/8 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
          <div className="h-11 border-b border-white/6 flex items-center px-4 gap-2 bg-black/40">
            <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-white/15" /></div>
            <span className="flex-1 text-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">iPulse Studio - Prompt to Video</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
              <span className={cn("w-1.5 h-1.5 rounded-full", isGenerating ? "bg-cyan-400 animate-pulse" : "bg-emerald-400")} />
              {isGenerating ? "Rendering" : "Ready"}
            </span>
          </div>
          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Prompt Input</label>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 bg-black/50 border border-white/8 rounded-lg px-3 py-3 text-xs text-zinc-300 font-mono resize-none focus:outline-none focus:border-white/20 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Creative Style</label>
                  <select value={style} onChange={e => setStyle(e.target.value)} className="w-full bg-black/50 border border-white/8 rounded-lg px-3 py-2 text-xs font-mono text-zinc-400 focus:outline-none focus:border-white/20">
                    <option value="Cinematic">Cinematic 3D</option>
                    <option value="Anime">Anime Dream</option>
                    <option value="Cyberpunk">Cyberpunk Neon</option>
                    <option value="OilPainting">Classical Oil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Aspect Ratio</label>
                  <select value={ratio} onChange={e => setRatio(e.target.value)} className="w-full bg-black/50 border border-white/8 rounded-lg px-3 py-2 text-xs font-mono text-zinc-400 focus:outline-none focus:border-white/20">
                    <option value="16:9">16:9 Landscape</option>
                    <option value="9:16">9:16 Portrait</option>
                    <option value="1:1">1:1 Square</option>
                    <option value="4:3">4:3 Classic</option>
                  </select>
                </div>
              </div>
              <button
                onClick={triggerGeneration}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 py-3 bg-white text-black rounded-lg text-xs font-mono uppercase tracking-widest font-bold hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> {isGenerating ? `Generating (${progress}%)` : "Generate"}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-600">Generated Preview</label>
              <div className="flex-1 glass rounded-xl border border-white/6 flex flex-col items-center justify-center p-4 min-h-[160px] relative overflow-hidden bg-black/40">
                {isGenerating ? (
                  <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
                    <motion.div
                      animate={{ y: ["-100%", "100%"] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-0.5 bg-cyan-400/50 shadow-[0_0_8px_rgba(34,211,238,0.5)] pointer-events-none z-20"
                    />
                    <div className="flex flex-col items-center justify-center gap-2 bg-black/80 px-4 py-3 rounded-lg border border-white/10 z-20">
                      <div className="w-8 h-8 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Rendering Diffusion Matrix</span>
                      <span className="text-[9px] font-mono text-cyan-400">{progress}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative z-10">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mb-3">
                      <Film className="w-5 h-5 text-zinc-400" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest mb-1">Rendering complete</span>
                    <p className="text-[9px] font-mono text-zinc-500 max-w-[80%] leading-normal mb-2 italic">
                      "{prompt.substring(0, 70)}..."
                    </p>
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">Style: {style} · Ratio: {ratio} · Seed: 442918</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[9px] font-mono text-zinc-700 uppercase tracking-widest px-1"><span>0:04</span><span>GPU Time: ~1.2s</span><span>24 FPS</span></div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const quotesList = [
  { text: '"The video extension API is incredibly powerful. We integrated Flow into our visual timeline in under a day."', author: 'Alex R.', role: 'Lead Creative Dev' },
  { text: '"Best text-to-image quality I have seen. The detail consistency across matching aspect ratios is genuinely unmatched."', author: 'Sarah M.', role: 'Creative Director' },
  { text: '"iPulse completely transformed our marketing assets workflow. We generate highly personalized video ads instantly."', author: 'David T.', role: 'Product Lead' },
  { text: '"The cinematic upscaler saves me hours of manual editing. The lighting diffusion consistency is remarkable."', author: 'Elena G.', role: 'VFX Artist' },
  { text: '"Their temporal alignment on long-duration video chains is phenomenal. Perfect for procedural generation."', author: 'Priya S.', role: 'ML Researcher' },
];

const CinematicQuote = () => {
  const [idx, setIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    const t = setInterval(() => { setIdx(i => (i + 1) % quotesList.length); setAnimKey(k => k + 1); }, 5000);
    return () => clearInterval(t);
  }, []);
  const q = quotesList[idx];
  return (
    <section className="relative z-10 py-32 border-y border-white/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-16">Community</p>
        <div className="relative min-h-[180px] flex flex-col items-center justify-center">
          <div className="text-8xl font-editorial text-white/6 absolute -top-4 left-4 leading-none select-none">&ldquo;</div>
          <motion.div key={animKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-2xl md:text-3xl font-editorial italic text-white leading-snug mb-8 max-w-2xl mx-auto">{q.text}</p>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-white">{q.author}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">{q.role}</span>
            </div>
          </motion.div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-12">
          {quotesList.map((_, i) => (<button key={i} onClick={() => { setIdx(i); setAnimKey(k => k + 1); }} className={cn('w-1.5 h-1.5 rounded-full transition-all', i === idx ? 'bg-white scale-125' : 'bg-white/20 hover:bg-white/40')} />))}
        </div>
      </div>
    </section>
  );
};

const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    pulse: '40,000',
    desc: 'Test the creative engine at no cost.',
    features: [
      '40k Pulse Credits',
      'Image Gen (Standard)',
      'Video Gen (480p)',
      'No Flow / Agent features'
    ]
  },
  {
    name: 'Basic',
    price: '10',
    pulse: '120,000',
    desc: 'For regular content creators.',
    recommended: true,
    features: [
      '120k Pulse Credits',
      'Flow & Agent Access',
      'Image Gen (2K Quality)',
      'Video/Flow/Agent (720p)',
      'API Ingress Key (Standard)'
    ]
  },
  {
    name: 'Premium',
    price: '20',
    pulse: '300,000',
    desc: 'For studio-grade production.',
    features: [
      '300k Pulse Credits',
      'Flow & Agent Access',
      'Image Gen (2K Quality)',
      'Video/Flow/Agent (720p)',
      'API Ingress Key (High)'
    ]
  },
  {
    name: 'Pro',
    price: '100',
    pulse: '1,500,000',
    desc: 'Enterprise volume and dedicated H100s.',
    features: [
      '1.5M Pulse Credits',
      'Flow & Agent Access',
      'Image Gen (2K Quality)',
      'Video/Flow/Agent (720p)',
      'API Ingress Key (Dedicated)'
    ]
  },
];

const PricingSection = () => (
  <section id="pricing" className="relative z-10 py-32 max-w-7xl mx-auto px-6">
    <div className="text-center mb-20">
      <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Pricing</p>
      <h2 className="text-4xl md:text-5xl text-white tracking-tight">Simple. Transparent.</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {pricingPlans.map((plan, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={cn('rounded-xl p-8 flex flex-col relative transition-all duration-300 border', plan.recommended ? 'glass-mid border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.04)] lg:-translate-y-3' : 'border-white/6 hover:border-white/15')}>
          {plan.recommended && (<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold">Most Popular</div>)}
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3">{plan.name}</div>
          <div className="flex items-baseline gap-1 mb-2"><span className="text-4xl font-black text-white">${plan.price}</span><span className="text-[10px] font-mono text-zinc-500 uppercase">/mo</span></div>
          <p className="text-xs text-zinc-400 font-mono mb-8 h-8">{plan.desc}</p>
          <div className="flex-1 space-y-3 mb-8">
            {plan.features.map((feature, idx) => {
              const isBlocked = feature.startsWith('No ');
              return (
                <div key={idx} className={cn('flex items-center gap-2.5 text-sm font-mono', isBlocked ? 'text-zinc-600 line-through' : 'text-zinc-300')}>
                  {isBlocked ? (
                    <span className="w-3.5 h-3.5 flex items-center justify-center text-zinc-600 font-bold shrink-0 text-xs">—</span>
                  ) : (
                    <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  )}
                  <span>{feature}</span>
                </div>
              );
            })}
          </div>
          <button className={cn('w-full py-3 rounded-sm text-[10px] font-mono uppercase tracking-widest font-bold transition-all', plan.recommended ? 'bg-white text-black hover:bg-zinc-100' : 'border border-white/10 text-white hover:bg-white hover:text-black')}>Get Started</button>
        </motion.div>
      ))}
    </div>
  </section>
);

const CtaBanner = () => (
  <section className="relative z-10 py-40 border-t border-white/5 overflow-hidden">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-white/15 via-white/6 to-transparent animate-beam-pulse" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-full bg-gradient-to-b from-white/3 via-transparent to-transparent" style={{ filter: 'blur(40px)' }} />
    </div>
    <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] font-mono tracking-widest mb-10 border border-white/8">
        <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse rounded-full" />
        <span className="text-zinc-400">Free plan - no credit card required</span>
      </div>
      <h2 className="text-5xl md:text-7xl text-white tracking-tight mb-6 leading-[0.92]">Create the<br /><span className="editorial-italic">future.</span></h2>
      <p className="text-base text-zinc-500 font-mono mb-10 max-w-xl mx-auto leading-relaxed">Join thousands of developers and creators powering the next generation of creative experiences with iPulse.</p>
    </div>
  </section>
);

const Footer = () => (
  <footer className="relative z-10 pt-20 pb-10 border-t border-white/5 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
      <span className="text-[18vw] text-white/[0.018] tracking-tighter whitespace-nowrap">iPulse</span>
    </div>
    <div className="max-w-7xl mx-auto px-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-5"><img src="/logo.webp" alt="iPulse" className="w-7 h-7 rounded-sm object-cover" /><span className="font-mono text-sm tracking-[0.2em] text-white font-bold uppercase">iPulse</span></div>
          <p className="text-xs font-mono text-zinc-500 max-w-xs leading-relaxed">Neural creative studio. High-fidelity Video flow extension, Image synthesis, and studio-grade sound.</p>
        </div>
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-5">Features</h4>
          <ul className="space-y-3 text-sm text-zinc-500">
            <li><Link href="#video-flow" className="hover:text-white transition-colors">Video Generation</Link></li>
            <li><Link href="#creative-canvas" className="hover:text-white transition-colors">Image Synthesis</Link></li>
            <li><Link href="#speech-to-text" className="hover:text-white transition-colors">Speech to Text</Link></li>
            <li><Link href="#api" className="hover:text-white transition-colors">Developer API</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-5">Resources</h4>
          <ul className="space-y-3 text-sm text-zinc-500"><li><Link href="/docs" target='_blank' className="hover:text-white transition-colors">Documentation</Link></li><li><Link href="/docs/api" target='_blank' className="hover:text-white transition-colors">API Reference</Link></li><li><Link href="#" target='_blank' className="hover:text-white transition-colors">System Status</Link></li></ul>
        </div>
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-5">Legal</h4>
          <ul className="space-y-3 text-sm text-zinc-500"><li><Link href="/privacy-policy" target='_blank' className="hover:text-white transition-colors">Privacy Policy</Link></li><li><Link href="/terms-of-use" target='_blank' className="hover:text-white transition-colors">Terms of Service</Link></li><li><Link href="/refund-policy" target='_blank' className="hover:text-white transition-colors">Refund Policy</Link></li></ul>
        </div>
      </div>
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-mono text-zinc-400 tracking-widest">2026 iPulse Labs. All rights reserved.</div>
      </div>
    </div>
  </footer>
);

const ScrollRevealWord = ({ word, progress, range }: { word: string; progress: number; range: [number, number] }) => {
  const [start, end] = range;
  const opacity = progress <= start ? 0.12 : progress >= end ? 1 : 0.12 + (0.88 * (progress - start)) / (end - start);
  return (
    <motion.span
      style={{ opacity }}
      className="inline-block mr-[0.25em] mt-[0.1em] mb-[0.1em] text-white"
    >
      {word}
    </motion.span>
  );
};

const ScrollRevealText = () => {
  const spacerRef = useRef<HTMLDivElement>(null);
  // Use window-level scroll — not target-based — so parent overflow:clip
  // does NOT interfere with sticky or progress tracking.
  const { scrollY } = useScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = (y: number) => {
      const el = spacerRef.current;
      if (!el) return;
      const top = el.offsetTop;
      const height = el.offsetHeight;
      const vh = window.innerHeight;
      // Pin starts when section top reaches viewport top; ends when section
      // bottom reaches viewport bottom (= el.offsetTop + height - vh).
      const pinStart = top;
      const pinEnd = top + height - vh;
      const p = pinEnd <= pinStart ? 0 : Math.max(0, Math.min(1, (y - pinStart) / (pinEnd - pinStart)));
      setProgress(p);
    };
    // Run once on mount in case already scrolled
    update(scrollY.get());
    const unsub = scrollY.on('change', update);
    return unsub;
  }, [scrollY]);

  const text = "Creative intelligence is no longer constrained by physical cameras or render farms. We are entering a new paradigm where cinematic video, stunning imagery, and synchronized audio are generated in real-time, completely from text.";
  const words = text.split(" ");
  const totalWords = words.length;
  // Spread words across 0→0.95; last word fully reveals at 95% so there's
  // a small breathing room before the section scrolls away.
  const span = 0.95;
  const windowSize = span / totalWords;

  return (
    // spacerRef sits here to give the scroll distance; sticky child pins inside it.
    <div ref={spacerRef} className="relative z-10 h-[700vh]">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="max-w-[1200px] mx-auto px-6 w-full">
          <h2 className="text-3xl md:text-5xl lg:text-6xl leading-[1.2] tracking-tight">
            {words.map((word, i) => {
              const start = (i / totalWords) * span;
              const end = start + windowSize;
              return <ScrollRevealWord key={i} word={word} progress={progress} range={[start, end]} />;
            })}
          </h2>
        </div>
      </div>
    </div>
  );
};

const getDeterministicRandom = (i: number) => {
  const x = Math.sin(i * 12.345) * 15;
  const y = Math.cos(i * 43.21) * 15;
  const rotate = Math.sin(i * 76.54) * 45;
  return { x, y, rotate };
};

const InteractiveTypographyGrid = () => {
  return (
    <section className="relative z-10 py-32 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Frame 1 */}
          <motion.div
            whileHover={{ scale: 0.98 }}
            className="glass-dark border border-white/10 rounded-2xl p-6 md:p-8 aspect-square flex flex-col justify-between relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest relative z-10 pointer-events-none">Neural Architecture</div>
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-700">
              <div className="flex flex-col items-center justify-center font-mono text-[8px] md:text-[10px] leading-[1.8] text-zinc-600 transition-colors duration-500">
                {[...Array(7)].map((_, row) => (
                  <div key={row} className="flex gap-2">
                    {[...Array(11)].map((_, col) => {
                      const { x, y, rotate } = getDeterministicRandom(row * 11 + col);
                      return (
                        <motion.span
                          key={col}
                          className="inline-block cursor-default group-hover:text-white transition-colors duration-500"
                          whileHover={{ scale: 1.8, x, y, rotate, color: '#22d3ee' }} // cyan-400
                          transition={{ type: "spring", stiffness: 300, damping: 10 }}
                        >
                          /
                        </motion.span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-white mt-auto relative z-10 group-hover:-translate-y-2 transition-transform duration-500 pointer-events-none">
              Infinite Scaling
            </div>
          </motion.div>

          {/* Frame 2 */}
          <motion.div
            whileHover={{ scale: 0.98 }}
            className="glass-dark border border-white/10 rounded-2xl p-6 md:p-8 aspect-square flex flex-col justify-between relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest relative z-10 pointer-events-none">Latency Metrics</div>
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-700">
              <motion.div
                className="grid grid-cols-5 gap-2 md:gap-3"
              >
                {[...Array(25)].map((_, i) => {
                  const { x, y } = getDeterministicRandom(i + 100);
                  return (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 group-hover:bg-white rounded-full transition-colors duration-500"
                      whileHover={{ scale: 2.5, x: x * 1.5, y: y * 1.5, backgroundColor: '#22d3ee' }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    />
                  );
                })}
              </motion.div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-white mt-auto relative z-10 group-hover:-translate-y-2 transition-transform duration-500 pointer-events-none">
              Sub-200ms
            </div>
          </motion.div>

          {/* Frame 3 */}
          <motion.div
            whileHover={{ scale: 0.98 }}
            className="glass-dark border border-white/10 rounded-2xl p-6 md:p-8 aspect-square sm:aspect-[2/1] lg:aspect-square lg:col-span-1 md:col-span-2 flex flex-col justify-between relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest relative z-10 pointer-events-none">Model Accuracy</div>
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-700">
              <motion.div
                className="flex text-5xl md:text-6xl lg:text-8xl font-editorial italic text-zinc-600 transition-colors duration-700 select-none"
              >
                {['9', '9', '.', '9', '%'].map((char, i) => {
                  const { x, y, rotate } = getDeterministicRandom(i + 200);
                  return (
                    <motion.span
                      key={i}
                      className="inline-block cursor-default group-hover:text-white transition-colors duration-500"
                      whileHover={{ scale: 1.3, x: x * 0.8, y: y * 0.8, rotate: rotate * 0.3, color: '#22d3ee' }}
                      transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </motion.div>
            </div>
            <div className="text-xl md:text-2xl font-bold text-white mt-auto relative z-10 group-hover:-translate-y-2 transition-transform duration-500 pointer-events-none">
              Zero-Shot
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const featureItems = [
  { icon: Video, tag: 'Video Generation', desc: 'Create cinematic videos from prompts or images. Flow technology extends existing shots seamlessly.' },
  { icon: Sparkles, tag: 'Image Synthesis', desc: 'Generate hyper-realistic art, design assets, and styles with extreme text adherence.' },
  { icon: Code, tag: 'Extension Video', desc: 'A tool for true creators, create a long, seamless video exactly as you want it.' },
  { icon: Film, tag: 'Style Transfer', desc: 'Map artistic styles onto videos or images dynamically, preserving structural consistency.' },
  { icon: AudioLines, tag: 'Neural TTS & Cloning', desc: 'Synthesize voiceovers in 32+ languages or clone any voice from a 5-second sample.' },

];

const FeatureShowcase = () => {
  const spacerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = (y: number) => {
      const el = spacerRef.current;
      if (!el) return;
      const top = el.offsetTop;
      const height = el.offsetHeight;
      const vh = window.innerHeight;
      // Same exact formula as ScrollRevealText
      const pinStart = top;
      const pinEnd = top + height - vh;
      const p = pinEnd <= pinStart ? 0 : Math.max(0, Math.min(1, (y - pinStart) / (pinEnd - pinStart)));
      setProgress(p);
    };
    update(scrollY.get());
    const unsub = scrollY.on('change', update);
    return unsub;
  }, [scrollY]);

  const n = featureItems.length;
  // Each item reveals over its 1/n slice of 0→0.9 progress range
  const slotSize = 0.9 / n;

  return (
    // Tall spacer — 500vh gives ~400vh of pinned scroll (same idea as ScrollRevealText)
    <div id="speech-to-text" ref={spacerRef} className="relative z-10 h-[500vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 items-center">

          {/* ── Left: sequential scroll-reveal feature list ── */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <div>
              <p className="text-[10px] lg:text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-2 lg:mb-3">Platform Capabilities</p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl text-white tracking-tight leading-[1.1]">
                Everything you need.<br />
                <span className="text-zinc-500">All in one platform.</span>
              </h2>
            </div>

            <div className="flex flex-col gap-4 lg:gap-5">
              {featureItems.map((f, i) => {
                // item starts revealing at its slot start, fully lit at slot end
                const slotStart = i * slotSize;
                const slotEnd = slotStart + slotSize;
                const itemProgress = Math.max(0, Math.min(1, (progress - slotStart) / (slotEnd - slotStart)));
                const opacity = 0.12 + 0.88 * itemProgress;
                const x = -16 * (1 - itemProgress);
                const isLit = itemProgress > 0.5;
                return (
                  <motion.div
                    key={i}
                    style={{ opacity, x }}
                    className="flex items-start gap-3 lg:gap-4"
                  >
                    <div className={`mt-0.5 w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${isLit ? 'bg-white/10 border-white/25' : 'bg-white/[0.02] border-white/8'
                      }`}>
                      <f.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-colors duration-300 ${isLit ? 'text-white' : 'text-zinc-700'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold mb-0.5 lg:mb-1 transition-colors duration-300 ${isLit ? 'text-white' : 'text-zinc-700'}`}>{f.tag}</p>
                      <p className={`text-[10px] lg:text-xs font-mono leading-relaxed transition-colors duration-300 ${isLit ? 'text-zinc-400' : 'text-zinc-800'}`}>{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div style={{ opacity: Math.max(0, Math.min(1, (progress - 0.85) / 0.1)) }}>
              <Link href="/docs" className="inline-flex items-center gap-2 text-[10px] lg:text-xs font-mono uppercase tracking-widest text-white border-b border-white/20 pb-0.5 hover:border-white/60 transition-colors w-fit group">
                View full API reference <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* ── Right: image ── */}
          <motion.div
            style={{ opacity: Math.min(1, progress * 4), y: 20 * (1 - Math.min(1, progress * 4)) }}
            className="flex items-center justify-center mt-2 lg:mt-0"
          >
            <div className="w-full max-w-[180px] sm:max-w-[280px] lg:max-w-[600px] aspect-square overflow-hidden">
              <img
                src="/phone.webp"
                alt="iPulse dashboard"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};


export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans relative selection:bg-white/15 overflow-clip">
      <ModernBackground />
      <Navbar />
      <HeroSection />
      <FeatureShowcase />
      <ScrollRevealText />
      <StatsStrip />
      <FeaturesAlternating />
      <InteractiveTypographyGrid />
      <VerticalTimeline />
      <StudioPanel />
      <CinematicQuote />
      <PricingSection />
      <CtaBanner />
      <Footer />
    </div>
  );
}
