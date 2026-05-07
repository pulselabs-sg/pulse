'use client';

import { motion, useScroll, useVelocity, useSpring, useTransform, useMotionValue, useAnimationFrame, AnimatePresence } from 'framer-motion';
import { ArrowRight, AudioLines, Zap, Terminal, Wand2, Type, Mic, Check, Layers, Code, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const ScrollLiquidBackground = () => {
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 45, stiffness: 380, mass: 0.8 });
  const velocityFactor = useTransform(smoothVelocity, [-1200, 0, 1200], [-4.5, 0, 4.5], { clamp: false });
  const scaleMorph = useTransform(smoothVelocity, [-1200, 0, 1200], [1.22, 1, 1.22]);

  const rotate1 = useMotionValue(0);
  const rotate2 = useMotionValue(0);
  const rotate3 = useMotionValue(0);

  useAnimationFrame((t, delta) => {
    const v = velocityFactor.get();
    const frameDelta = delta / 16;
    rotate1.set(rotate1.get() + v * frameDelta * 1.1);
    rotate2.set(rotate2.get() - v * frameDelta * 0.9);
    rotate3.set(rotate3.get() + v * frameDelta * 1.3);
  });

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
      <motion.div style={{ rotate: rotate1, scale: scaleMorph }} className="absolute w-[120%] md:w-[82vw] aspect-square max-w-[1000px] bg-gradient-to-br from-cyan-500/25 via-indigo-600/20 to-transparent blur-[80px] md:blur-[130px] rounded-[45%_55%_60%_40%/50%_40%_55%_45%] mix-blend-screen opacity-70" />
      <motion.div style={{ rotate: rotate2, scale: scaleMorph }} className="absolute w-[90%] md:w-[58vw] aspect-square max-w-[700px] bg-gradient-to-tr from-white/10 via-cyan-400/15 to-transparent blur-[60px] md:blur-[110px] rounded-[55%_45%_40%_60%/40%_55%_45%_60%] mix-blend-overlay opacity-75" />
      <motion.div style={{ rotate: rotate3, scale: scaleMorph }} className="absolute w-[140%] md:w-[95vw] aspect-square max-w-[1200px] bg-gradient-to-r from-indigo-400/10 to-transparent blur-[100px] md:blur-[160px] rounded-[30%_70%_65%_35%/60%_30%_70%_40%] mix-blend-soft-light opacity-40" />
    </div>
  );
};

const SoundWaveVisualizer = () => {
  const barCount = 42;
  const bars = Array.from({ length: barCount }, (_, i) => i);
  return (
    <div className="relative w-full flex flex-col items-center justify-center py-6 md:py-8 overflow-hidden">
      <div className="flex items-end justify-center gap-[2px] md:gap-[3px] h-24 md:h-40 relative z-10 w-full px-2 overflow-hidden">
        {bars.map((i) => (
          <motion.div
            key={i}
            className="w-[1.5px] md:w-[2.5px] bg-gradient-to-t from-cyan-400 to-white rounded-full origin-bottom shadow-[0_0_8px_rgba(103,232,249,0.5)] shrink-0"
            animate={{ height: [14, 68, 22, 82, 18, 55, 28, 71, 15].map(h => h * 0.8) }}
            transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.018 }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 md:gap-2 mt-4 md:mt-6">
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 animate-pulse rounded-full"></div>
        <p className="text-[8px] md:text-[10px] font-mono tracking-[1px] md:tracking-[2px] uppercase text-cyan-400">LIVE • NEURAL • WAVEFORM</p>
        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-400 animate-pulse rounded-full"></div>
      </div>
      <AudioLines className="w-5 h-5 md:w-6 md:h-6 text-cyan-300/60 mt-2 md:mt-3" />
    </div>
  );
};

const NeuralOrbitVisualizer = () => {
  return (
    <div className="relative w-full h-36 md:h-48 flex items-center justify-center overflow-hidden py-4">
      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.1, 0.4] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute w-16 h-16 md:w-20 md:h-20 bg-cyan-500/20 rounded-full blur-xl md:blur-2xl" />
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="absolute w-8 h-8 md:w-12 md:h-12 border border-cyan-400/60 rounded-full" animate={{ scale: [1, 4], opacity: [0.8, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }} />
      ))}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-28 h-28 md:w-36 md:h-36 border border-white/20 border-dashed rounded-full" />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-20 h-20 md:w-24 md:h-24 border border-cyan-400/30 rounded-full flex items-center justify-center">
        <div className="absolute top-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-300 rounded-full shadow-[0_0_10px_#67e8f9] -mt-[3px] md:-mt-1" />
      </motion.div>
      <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 bg-black border border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(103,232,249,0.5)]">
        <Zap className="w-4 h-4 md:w-5 md:h-5 text-cyan-300" />
      </div>
    </div>
  );
};

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733-16z" />
    <path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772" />
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans relative selection:bg-white/20 overflow-x-hidden">

      <ScrollLiquidBackground />

      <div className="fixed inset-0 bg-[url('/noise.png')] bg-repeat opacity-40 mix-blend-overlay z-0 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer">
            <div className="relative w-6 h-6 md:w-7 md:h-7 flex items-center justify-center overflow-hidden">
              <img src="/logo.webp" alt="iPulse Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-mono text-xs md:text-sm text-white tracking-widest">iPulse</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            <Link href="#features" className="hover:text-white transition-colors">Modules</Link>
            <Link href="#fluid" className="hover:text-white transition-colors">Integration</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Allocation</Link>
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" target="_blank" className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-black text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm flex items-center gap-2 hover:bg-cyan-300 transition-all">
              App <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>


      {/* HERO SECTION */}
      <div className="relative pt-28 md:pt-40 pb-16 md:pb-24 max-w-screen-2xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-10 md:gap-16 z-10 min-h-[90vh] lg:min-h-0 justify-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex-1 space-y-6 md:space-y-8 text-center lg:text-left w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-sm text-[9px] md:text-[10px] font-mono uppercase tracking-widest backdrop-blur-sm mx-auto lg:mx-0">
            <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse rounded-full"></span>
            <span className="text-zinc-400">SYSTEM ONLINE •</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-mono font-bold tracking-tighter leading-[1.1] text-white uppercase">
            iPulse AI.<br />
            <span className="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent break-words">Next-Gen Voice_Synthesis.</span>
          </h1>
          <p className="text-xs md:text-sm font-mono text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed uppercase tracking-wider backdrop-blur-sm">
            Neural-powered voice engine. Real-time TTS • STT • Voice Cloning • Emotional Synthesis.
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 md:pt-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-black/50 backdrop-blur-md border border-white/10 hover:border-cyan-400 hover:bg-white/5 rounded-sm text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2">
              <Terminal className="w-3 h-3 text-zinc-400" /> View Logs
            </button>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="flex-1 w-full relative max-w-lg mx-auto lg:max-w-none mt-4 lg:mt-0">
          <div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[4/3] bg-black/40 backdrop-blur-xl rounded-sm border border-white/10 p-2 shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-8 border-b border-white/10 bg-black/80 flex items-center px-3 md:px-4 justify-between z-20 shrink-0">
              <div className="flex gap-1 md:gap-1.5">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-700"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-700"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400"></div>
              </div>
              <div className="text-[8px] md:text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Visual_Matrix</div>
            </div>
            <div className="flex-1 flex items-center justify-center z-10 pt-8 relative w-full h-full">
              <SoundWaveVisualizer />
            </div>
            <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 h-16 md:h-24 bg-black/80 border border-white/5 rounded-sm p-2 md:p-3 font-mono text-[8px] md:text-[9px] text-zinc-500 overflow-hidden z-20">
              <motion.div initial={{ y: 20 }} animate={{ y: -20 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="space-y-1">
                <p>&gt; Booting neural core...</p>
                <p>&gt; Loading audio models: <span className="text-cyan-400">SUCCESS</span></p>
                <p>&gt; Connecting to pulseLabs endpoint...</p>
                <p className="text-white">&gt; SYSTEM READY. Awaiting inputs.</p>
                <p>&gt; Processing live waveform_001...</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- MODULES / FEATURES GRID --- */}
      <div id="features" className="relative z-10 max-w-screen-2xl mx-auto px-4 md:px-8 py-16 md:py-24 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="mb-10 md:mb-16 text-center md:text-left">
          <h2 className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-2 flex items-center justify-center md:justify-start gap-2">
            <Layers className="w-4 h-4 text-cyan-400" /> AI_Voice_Modules
          </h2>
          <p className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-wider">Professional-grade neural audio tools. Built for creators and developers.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Wand2, title: "Text to Speech", desc: "Convert text to natural voice" },
            { icon: Type, title: "Speech to Text", desc: "Transcribe audio to text" },
            { icon: AudioLines, title: "Voice Changer", desc: "Transform voice style" },
            { icon: Mic, title: "Audio Cleaner", desc: "Remove noise & enhance" },
          ].map((feature, i) => (
            <motion.div key={i} whileHover={{ y: -4, scale: 1.02 }} className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm p-5 md:p-6 transition-all duration-300 hover:border-cyan-400 hover:bg-white/5 group flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center mb-4 md:mb-6 group-hover:bg-cyan-400 group-hover:border-cyan-400 transition-all shrink-0">
                <feature.icon className="w-4 h-4 text-zinc-400 group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-[11px] md:text-xs font-mono font-bold uppercase tracking-widest text-white mb-2 md:mb-3">{feature.title}</h3>
              <p className="text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- STUDIO SESSIONS --- */}
      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 md:px-8 py-16 md:py-24 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="mb-10 md:mb-16 text-center md:text-left">
          <h2 className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-2 flex items-center justify-center md:justify-start gap-2">
            <Wand2 className="w-4 h-4 text-cyan-400" /> Studio_Sessions
          </h2>
          <p className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-wider">Non-uniform interfaces. Infinite creative possibilities.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
          <div className="lg:col-span-5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm p-5 md:p-6 flex flex-col overflow-hidden relative min-h-[250px] md:min-h-[300px]">
            <div className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4 md:mb-6 text-center md:text-left">Live Neural Orbit</div>
            <div className="flex-1 flex items-center justify-center"><NeuralOrbitVisualizer /></div>
            <div className="mt-auto pt-4 md:pt-8 text-center md:text-left">
              <p className="text-[9px] md:text-[10px] font-mono text-zinc-400">Real-time neural spatial rendering.<br className="hidden md:block" />Scroll to feel the liquid core.</p>
            </div>
          </div>
          <div className="lg:col-span-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm p-6 md:p-8 flex flex-col items-center text-center md:items-start md:text-left">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center mb-4 md:mb-6 shrink-0">
              <Mic className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
            </div>
            <h3 className="text-xs md:text-sm font-mono font-bold uppercase tracking-widest text-white mb-2 md:mb-3">Voice Cloning Studio</h3>
            <p className="text-[10px] md:text-xs font-mono text-zinc-400 leading-relaxed mb-6 md:mb-8">Zero-shot. Instant. Your voice, reimagined in seconds.</p>
            <div className="mt-auto flex w-full justify-between items-center text-[9px] md:text-[10px] font-mono border-t md:border-none border-white/10 pt-4 md:pt-0">
              <span className="text-emerald-400">READY</span>
              <span className="px-3 md:px-4 py-1.5 md:py-1 bg-white/10 hover:bg-cyan-400 hover:text-black rounded-sm cursor-pointer transition-colors">CLONE NOW</span>
            </div>
          </div>
          <div className="lg:col-span-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-sm p-6 md:p-8 flex flex-col justify-between items-center text-center md:items-start md:text-left">
            <div className="w-full flex flex-col items-center md:items-start">
              <Terminal className="w-6 h-6 md:w-8 md:h-8 text-zinc-400 mb-4 md:mb-6" />
              <h3 className="text-xs md:text-sm font-mono font-bold uppercase tracking-widest text-white mb-2 md:mb-3">API Terminal</h3>
              <p className="text-[10px] md:text-xs font-mono text-zinc-400 leading-relaxed">One line of code.<br className="hidden md:block" />Full neural power at your fingertips.</p>
            </div>
            <div className="w-full mt-6 md:mt-12 pt-4 md:pt-6 border-t border-white/10 text-[8px] md:text-[9px] font-mono text-cyan-400 tracking-widest break-all bg-black/50 p-2 md:bg-transparent md:p-0 rounded-sm">
              curl https://api.ipulselabs.net/generate
            </div>
          </div>
        </div>
      </div>

      {/* --- RESOURCE_ALLOCATION SECTION --- */}
      <div id="pricing" className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-24 border-t border-white/5 bg-black/60 backdrop-blur-md">
        <div className="mb-10 md:mb-16 text-center">
          <h2 className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-2">Neural_Resource_Allocation</h2>
          <p className="text-[10px] md:text-xs font-mono text-zinc-500 uppercase tracking-wider">Premium AI Voice Generator plans for every scale.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* FREE */}
          <div className="bg-black border border-white/10 rounded-sm p-6 md:p-8 flex flex-col hover:border-white/30 transition-colors backdrop-blur-md">
            <div className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-1">Free</div>
            <div className="flex items-baseline gap-1 mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl font-mono font-bold text-white">$0</span>
              <span className="text-[9px] md:text-[10px] font-mono uppercase text-zinc-500">/mo</span>
            </div>
            <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6 md:mb-8 h-auto md:h-8">Test the engine.</p>
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
              {['20,000 Pulse/month', '5,000 characters TTS limit', '5 minutes STT/Audio limit', 'No Voice Cloning'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 md:gap-3 text-[9px] md:text-[10px] font-mono uppercase tracking-wider text-zinc-400"><Check className="w-3 h-3 text-white shrink-0 mt-0.5" /> {feature}</li>
              ))}
            </ul>
            <button className="w-full py-2.5 md:py-3 rounded-sm border border-white/20 hover:bg-white hover:text-black text-white text-[9px] md:text-[10px] font-mono uppercase tracking-widest font-bold transition-all">INITIALIZE</button>
          </div>

          {/* BASIC - RECOMMENDED */}
          <div className="bg-white/5 border border-cyan-400/40 rounded-sm p-6 md:p-8 flex flex-col relative transform lg:-translate-y-4 shadow-[0_0_30px_rgba(103,232,249,0.15)] backdrop-blur-md mt-4 sm:mt-0">
            <div className="text-[8px] md:text-[9px] font-mono uppercase tracking-widest text-black bg-white inline-block px-2 py-0.5 md:py-0.5 mb-3 md:mb-4 self-start absolute top-0 -translate-y-1/2 left-6 md:left-8">RECOMMENDED</div>
            <div className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-1">Basic</div>
            <div className="flex items-baseline gap-1 mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl font-mono font-bold text-white">$5</span>
              <span className="text-[9px] md:text-[10px] font-mono uppercase text-zinc-500">/mo</span>
            </div>
            <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-6 md:mb-8 h-auto md:h-8">For regular creators.</p>
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
              {['60,000 Pulse/month', '5,000 characters TTS limit', '5 minutes STT/Audio limit', 'Voice Cloning Access (Max 2)'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 md:gap-3 text-[9px] md:text-[10px] font-mono uppercase tracking-wider text-white"><Check className="w-3 h-3 text-white shrink-0 mt-0.5" /> {feature}</li>
              ))}
            </ul>
            <button className="w-full py-2.5 md:py-3 rounded-sm bg-white hover:bg-cyan-300 text-black text-[9px] md:text-[10px] font-mono uppercase tracking-widest font-bold transition-all shadow-[0_0_15px_rgba(103,232,249,0.3)]">INITIALIZE</button>
          </div>

          {/* PREMIUM */}
          <div className="bg-black border border-white/10 rounded-sm p-6 md:p-8 flex flex-col hover:border-white/30 transition-colors backdrop-blur-md">
            <div className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-1">Premium</div>
            <div className="flex items-baseline gap-1 mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl font-mono font-bold text-white">$10</span>
              <span className="text-[9px] md:text-[10px] font-mono uppercase text-zinc-500">/mo</span>
            </div>
            <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6 md:mb-8 h-auto md:h-8">For serious creators.</p>
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
              {['150,000 Pulse/month', '10,000 characters TTS limit', '10 minutes STT/Audio limit', 'Voice Cloning Access (Max 5)'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 md:gap-3 text-[9px] md:text-[10px] font-mono uppercase tracking-wider text-zinc-400"><Check className="w-3 h-3 text-white shrink-0 mt-0.5" /> {feature}</li>
              ))}
            </ul>
            <button className="w-full py-2.5 md:py-3 rounded-sm border border-white/20 hover:bg-white hover:text-black text-white text-[9px] md:text-[10px] font-mono uppercase tracking-widest font-bold transition-all">INITIALIZE</button>
          </div>

          {/* PRO */}
          <div className="bg-black border border-white/10 rounded-sm p-6 md:p-8 flex flex-col hover:border-white/30 transition-colors backdrop-blur-md">
            <div className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-1">Pro</div>
            <div className="flex items-baseline gap-1 mb-3 md:mb-4">
              <span className="text-2xl md:text-3xl font-mono font-bold text-white">$50</span>
              <span className="text-[9px] md:text-[10px] font-mono uppercase text-zinc-500">/mo</span>
            </div>
            <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6 md:mb-8 h-auto md:h-8">High-volume production.</p>
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1">
              {['800,000 Pulse/month', '15,000 characters TTS limit', '15 minutes STT/Audio limit', 'Voice Cloning Access (Max 10)'].map((feature, i) => (
                <li key={i} className="flex items-start gap-2 md:gap-3 text-[9px] md:text-[10px] font-mono uppercase tracking-wider text-zinc-400"><Check className="w-3 h-3 text-white shrink-0 mt-0.5" /> {feature}</li>
              ))}
            </ul>
            <button className="w-full py-2.5 md:py-3 rounded-sm border border-white/20 hover:bg-white hover:text-black text-white text-[9px] md:text-[10px] font-mono uppercase tracking-widest font-bold transition-all">INITIALIZE</button>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/5 bg-black pt-12 pb-8">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden flex items-center justify-center shrink-0">
                <img src="/logo.webp" alt="iPulse Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-xs md:text-sm font-mono text-white tracking-widest">iPulse</span>
                <span className="text-[8px] md:text-[9px] font-mono text-zinc-600 uppercase tracking-widest mt-0.5">
                  © 2026 • Built for the future of voice AI
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <Link href="/docs" className="text-[10px] font-mono text-zinc-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                Docs
              </Link>
              <Link href="/terms-of-use" target='_blank' className="text-[10px] font-mono text-zinc-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy-policy" target='_blank' className="text-[10px] font-mono text-zinc-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                Privacy Policy
              </Link>
              <Link href="/refund-policy" target='_blank' className="text-[10px] font-mono text-zinc-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                Refund Policy
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Link href="#" className="p-2 md:p-2.5 rounded-sm hover:border-cyan-400 hover:text-cyan-400 text-zinc-500 transition-all group"><XIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /></Link>
              <Link href="#" className="p-2 md:p-2.5 rounded-sm hover:border-cyan-400 hover:text-cyan-400 text-zinc-500 transition-all group"><FacebookIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /></Link>
              <Link href="#" className="p-2 md:p-2.5 rounded-sm hover:border-cyan-400 hover:text-cyan-400 text-zinc-500 transition-all group"><InstagramIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /></Link>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 text-cyan-400/50" /> Secure Payments processed by Paddle.com
          </div>
        </div>
      </footer>

    </div>
  );
}