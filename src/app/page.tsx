'use client';

import { motion, useScroll, useTransform, useVelocity, useSpring, useAnimationFrame, useMotionValue } from 'framer-motion';
import { ArrowRight, AudioLines, Zap, Terminal, Wand2, Type, Mic, Check, Layers, Code, Sparkles, ShieldCheck, Play, Star, PlayCircle, Quote, Activity, Server, Users, Globe } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

import { ModernBackground } from '@/components/ui/VisualEffects';

const SoundWaveVisualizer = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center gap-[2px] md:gap-1 px-4">
      <div className="absolute inset-0 bg-cyan-500/5 blur-[80px] rounded-full animate-pulse" />
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: [20, 100, 40, 150, 60, 20],
            opacity: [0.3, 0.7, 0.4, 1, 0.5, 0.3]
          }}
          transition={{
            duration: 1.5 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05
          }}
          className="w-1 md:w-1.5 bg-gradient-to-t from-cyan-600 via-cyan-400 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)]"
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-full h-[1px] bg-white/5" />
      </div>
    </div>
  );
};

// --- Sections ---

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const unsub = scrollY.onChange((v) => setIsScrolled(v > 20));
    return unsub;
  }, [scrollY]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 flex items-center px-6 md:px-12"
    )}>
      <div className="flex-1 flex items-center gap-3">
        <img src="/logo.webp" alt="iPulse" className="w-8 h-8 rounded-sm object-cover" />
        <span className="font-mono text-sm tracking-widest text-white font-bold">iPulse</span>
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center gap-8 text-[11px] font-mono uppercase tracking-widest text-zinc-400">
        <Link href="#features" className="hover:text-cyan-400 transition-colors">Platform</Link>
        <Link href="#how-it-works" className="hover:text-cyan-400 transition-colors">Engine</Link>
        <Link href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
        <Link href="/docs" className="hover:text-cyan-400 transition-colors">Docs</Link>
      </div>
      <div className="flex-1 flex justify-end">
        <Link href="/dashboard" className="px-5 py-2 glass-mid hover:bg-white hover:text-black border border-white/10 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all font-bold flex items-center gap-2 group shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.3)]">
          Launch App <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20">
      {/* Subtle deep space spotlight */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 10%, rgba(34,211,238,0.04) 0%, rgba(80,40,220,0.03) 50%, transparent 80%)',
        }}
      />
      {/* Floating dark nebulas */}
      <div className="absolute top-[15%] left-[8%] w-72 h-72 rounded-full bg-cyan-500/3 blur-[120px] animate-float pointer-events-none" />
      <div className="absolute top-[30%] right-[5%] w-96 h-80 rounded-full bg-indigo-500/3 blur-[140px] animate-float pointer-events-none" style={{ animationDelay: '-3s' }} />
      <div className="absolute bottom-[10%] left-[30%] w-64 h-64 rounded-full bg-violet-500/2 blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '-6s' }} />
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side: Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex flex-col items-start text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] font-mono uppercase tracking-widest mb-8 border border-cyan-500/30 animate-badge-pulse">
            <span className="w-2 h-2 bg-cyan-400 animate-pulse rounded-full" />
            <span className="text-cyan-100">Neural Synthesis Engine v2.4 Live</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-white mb-8">
            Intelligence <br />
            you can <span className="shimmer-gradient text-glow-cyan italic">hear.</span>
          </h1>
          <p className="text-sm md:text-base font-mono text-zinc-400 max-w-xl leading-relaxed mb-12">
            The ultimate AI voice ecosystem. Generate hyper-realistic speech, clone identities in seconds, and orchestrate neural audio with precision.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-sm text-xs font-mono uppercase tracking-[0.2em] font-bold hover:bg-cyan-300 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 group">
              Get Started <Terminal className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </Link>
            <Link href="/docs" className="w-full sm:w-auto px-8 py-4 glass-mid hover:bg-white/10 text-white rounded-sm text-xs font-mono uppercase tracking-[0.2em] font-bold transition-all border border-white/10 flex items-center justify-center gap-3">
              Docs <Code className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-cyan-500/70" /> SOC 2 Compliant</div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-cyan-500/70" /> &lt; 200ms Latency</div>
            <div className="w-px h-3 bg-white/10" />
            <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-cyan-500/70" /> 32+ Languages</div>
          </div>
        </motion.div>

        {/* Right Side: Visual Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          className="relative hidden lg:block"
        >
          {/* Outer glow ring */}
          <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent blur-2xl" />
          <div className="glass border border-white/10 rounded-3xl p-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
            {/* Animated top-right corner glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 blur-[60px] rounded-full group-hover:bg-cyan-400/20 transition-colors duration-700" />
            <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Neural Frequency</div>
                  <div className="text-xs font-bold text-white tracking-widest uppercase">Stream Active</div>
                </div>
              </div>
              <div className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 rounded-md text-[9px] font-mono text-cyan-400">
                24.4 kHz / 32-BIT
              </div>
            </div>

            <SoundWaveVisualizer />

            <div className="mt-12 grid grid-cols-2 gap-4">
              <div className="glass-mid border border-white/5 rounded-xl p-4">
                <div className="text-[8px] font-mono text-zinc-500 uppercase mb-2">Sync Confidence</div>
                <div className="text-lg font-mono font-bold text-white">99.98%</div>
              </div>
              <div className="glass-mid border border-white/5 rounded-xl p-4">
                <div className="text-[8px] font-mono text-zinc-500 uppercase mb-2">Neural Latency</div>
                <div className="text-lg font-mono font-bold text-cyan-400">142ms</div>
              </div>
            </div>
          </div>

          {/* Floating Decorations */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[100px] rounded-full animate-aurora" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 blur-[100px] rounded-full animate-aurora" style={{ animationDelay: '-5s' }} />
        </motion.div>
      </div>
    </div>
  );
};

const StatsMarquee = () => {
  const stats = [
    { label: 'Generations/Day', value: '2.5M+', icon: Activity },
    { label: 'Uptime', value: '99.99%', icon: Server },
    { label: 'Active Creators', value: '150k+', icon: Users },
    { label: 'Supported Languages', value: '32+', icon: Globe },
    { label: 'Voice Models', value: '1,200+', icon: Mic },
    { label: 'Latency', value: '< 200ms', icon: Zap },
  ];

  return (
    <div className="relative z-10 border-y border-white/5 bg-black/50 backdrop-blur-md py-6 overflow-hidden flex items-center">
      <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-black to-transparent z-10" />
      <div className="flex w-[200%] animate-marquee">
        {[...stats, ...stats].map((stat, i) => (
          <div key={i} className="flex-1 flex items-center justify-center gap-3 min-w-[250px]">
            <stat.icon className="w-5 h-5 text-cyan-500/70" />
            <div className="flex flex-col">
              <span className="text-xl font-bold font-mono text-white">{stat.value}</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeaturesBento = () => {
  return (
    <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-32">
      <div className="text-center mb-20">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 mb-3">Core Modules</h2>
        <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Built for scale.</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
        {/* Large Feature 1 */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2 glass-dark rounded-xl p-8 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden flex flex-col justify-end">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-colors" />
          <AudioLines className="w-12 h-12 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
          <h4 className="text-2xl font-bold text-white mb-2">Neural Text-to-Speech</h4>
          <p className="text-zinc-400 font-mono text-sm max-w-md">Generate studio-quality voiceovers with zero-shot cloning capabilities and emotional context understanding.</p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="glass-dark rounded-xl p-8 border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden flex flex-col justify-end">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-colors" />
          <Mic className="w-10 h-10 text-indigo-400 mb-6 group-hover:scale-110 transition-transform" />
          <h4 className="text-xl font-bold text-white mb-2">Voice Cloning</h4>
          <p className="text-zinc-400 font-mono text-sm">Clone any voice with just 5 seconds of audio.</p>
        </motion.div>

        {/* Feature 3 */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="glass-dark rounded-xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group relative overflow-hidden flex flex-col justify-end">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
          <Type className="w-10 h-10 text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
          <h4 className="text-xl font-bold text-white mb-2">Speech-to-Text</h4>
          <p className="text-zinc-400 font-mono text-sm">99% accurate transcription across 32+ languages.</p>
        </motion.div>

        {/* Large Feature 4 */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="md:col-span-2 glass-dark rounded-xl p-8 border border-white/5 hover:border-white/20 transition-all duration-500 group relative overflow-hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          <Terminal className="w-12 h-12 text-zinc-300 mb-6 relative z-10 group-hover:scale-110 transition-transform" />
          <h4 className="text-2xl font-bold text-white mb-2 relative z-10">Developer API</h4>
          <p className="text-zinc-400 font-mono text-sm max-w-md relative z-10">Integrate our neural engine into your app with standard REST endpoints and WebSockets.</p>
        </motion.div>
      </div>
    </section>
  );
};

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative z-10 py-32 border-y border-white/5 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 mb-3">Workflow</h2>
          <h3 className="text-4xl font-bold text-white tracking-tight">From input to synthesis.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {[
            { num: '01', title: 'Input Text or Audio', desc: 'Provide text payload or raw audio to the engine.', icon: Code },
            { num: '02', title: 'Neural Processing', desc: 'Models analyze context, emotion, and vocal characteristics.', icon: Layers },
            { num: '03', title: 'Real-time Output', desc: 'Stream ultra-low latency audio back to your client.', icon: Zap }
          ].map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full glass border border-white/10 flex items-center justify-center mb-8 relative z-10 group-hover:border-cyan-500/50 transition-colors bg-black">
                <step.icon className="w-8 h-8 text-white group-hover:text-cyan-400 transition-colors" />
              </div>
              <h4 className="text-lg font-bold text-white mb-3">{step.title}</h4>
              <p className="text-sm font-mono text-zinc-400">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const VoiceDemoSection = () => {
  return (
    <section className="relative z-10 py-32 max-w-5xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass-mid rounded-2xl p-2 border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
        <div className="bg-black rounded-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent z-0" />

          {/* Top Bar */}
          <div className="h-12 border-b border-white/10 flex items-center px-4 justify-between relative z-10 bg-black/50">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-zinc-800" />
              <div className="w-3 h-3 rounded-full bg-zinc-800" />
              <div className="w-3 h-3 rounded-full bg-cyan-500/50" />
            </div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live System
            </div>
          </div>

          <div className="p-8 md:p-12 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-3 py-1 glass rounded-md text-[10px] font-mono text-cyan-400 mb-2 border border-cyan-500/30">
                Synthesis Active
              </div>
              <h3 className="text-3xl font-bold text-white">Experience the engine.</h3>
              <p className="text-sm font-mono text-zinc-400 max-w-sm">
                Our acoustic models generate human-like speech patterns, breathing, and emotional inflection.
              </p>
              <button className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-cyan-300 transition-colors">
                <PlayCircle className="w-5 h-5" /> Play Sample
              </button>
            </div>

            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
              <div className="glass-dark border border-cyan-500/30 rounded-xl p-6 relative">
                <div className="flex items-end justify-center gap-1 h-32 overflow-hidden mb-4">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-cyan-400 rounded-t-sm"
                      animate={{ height: [10, Math.random() * 80 + 20, 10] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                    />
                  ))}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 text-center uppercase tracking-widest border-t border-white/10 pt-4">
                  Visualizing Output Waveform
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    { text: "The API latency is incredibly low. We integrated voice cloning into our game engine in under a day.", author: "Alex R.", role: "Lead Dev" },
    { text: "Best text-to-speech quality I've heard. The emotional range in the generated voices is unmatched.", author: "Sarah M.", role: "Content Creator" },
    { text: "iPulse completely transformed our automated customer service. It actually sounds human.", author: "David T.", role: "Product Manager" },
    { text: "The audio cleaning tool saves me hours of editing on my podcast. Truly magical.", author: "Elena G.", role: "Podcaster" },
    { text: "Simple, reliable, and exactly what we needed for scalable voice synthesis.", author: "Mark W.", role: "CTO" },
    { text: "Their transcription accuracy, even with heavy accents, is phenomenal.", author: "Priya S.", role: "Researcher" }
  ];

  return (
    <section className="relative z-10 py-32 bg-surface border-y border-white/5 overflow-hidden">
      <div className="text-center mb-16 px-6">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Community</h2>
        <h3 className="text-3xl font-bold text-white">Trusted by builders.</h3>
      </div>

      <div className="flex w-[200%] animate-marquee hover:[animation-play-state:paused]">
        {[...testimonials, ...testimonials].map((t, i) => (
          <div key={i} className="min-w-[350px] mx-4 glass-dark p-8 rounded-xl border border-white/5 flex flex-col justify-between h-[200px]">
            <Quote className="w-8 h-8 text-cyan-500/20 absolute top-6 right-6" />
            <p className="text-sm text-zinc-300 italic mb-6">"{t.text}"</p>
            <div>
              <div className="text-white font-bold text-sm">{t.author}</div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{t.role}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const PricingSection = () => {
  const plans = [
    { name: 'Free', price: '0', pulse: '20,000', desc: 'Test the engine.' },
    { name: 'Basic', price: '5', pulse: '60,000', desc: 'For regular creators.', recommended: true },
    { name: 'Premium', price: '10', pulse: '150,000', desc: 'For serious creators.' },
    { name: 'Pro', price: '50', pulse: '800,000', desc: 'High-volume production.' }
  ];

  return (
    <section id="pricing" className="relative z-10 py-32 max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <h2 className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 mb-3">Allocation</h2>
        <h3 className="text-4xl font-bold text-white tracking-tight">Simple, transparent pricing.</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, i) => (
          <div key={i} className={cn(
            "rounded-xl p-8 flex flex-col relative transition-all duration-300",
            plan.recommended ? "glass-mid border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.15)] lg:-translate-y-4" : "glass-dark border-white/5 hover:border-white/20"
          )}>
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-400 text-black text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                Recommended
              </div>
            )}
            <div className="text-sm font-mono uppercase tracking-widest text-zinc-400 mb-2">{plan.name}</div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-white">${plan.price}</span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">/mo</span>
            </div>
            <p className="text-xs text-zinc-500 mb-8 h-8">{plan.desc}</p>

            <div className="flex-1 space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white font-mono">{plan.pulse} Pulse</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">Full API Access</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-zinc-500" />
                <span className="text-sm text-zinc-400">Commercial Use</span>
              </div>
            </div>

            <button className={cn(
              "w-full py-3 rounded-sm text-xs font-mono uppercase tracking-widest font-bold transition-all",
              plan.recommended ? "bg-white text-black hover:bg-cyan-300" : "glass hover:bg-white hover:text-black border border-white/10"
            )}>
              Initialize
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const CtaBanner = () => {
  return (
    <section className="relative z-10 py-40 border-t border-white/5 overflow-hidden">
      {/* Aurora sweep behind CTA */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/8 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-cyan-500/8 to-indigo-500/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vh] bg-cyan-500/8 blur-[100px] rounded-full animate-float" />
      </div>
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] font-mono uppercase tracking-widest mb-8 border border-cyan-500/20">
          <span className="w-2 h-2 bg-emerald-400 animate-pulse rounded-full" />
          <span className="text-zinc-300">Free plan — no credit card required</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ready to build?</h2>
        <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto font-mono">
          Join thousands of developers and creators using iPulse to power the next generation of audio experiences.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="inline-flex items-center gap-3 px-8 py-4 bg-cyan-400 text-black rounded-sm text-sm font-mono uppercase tracking-widest font-bold hover:bg-white transition-colors shadow-[0_0_40px_rgba(34,211,238,0.3)]">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/docs" className="inline-flex items-center gap-3 px-8 py-4 glass-mid border border-white/10 text-white rounded-sm text-sm font-mono uppercase tracking-widest font-bold hover:bg-white/10 transition-colors">
            Read the Docs <Code className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="relative z-10 bg-transparent pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.webp" alt="iPulse" className="w-8 h-8 rounded-sm object-cover" />
              <span className="font-mono text-sm tracking-widest text-white font-bold">iPulse</span>
            </div>
            <p className="text-xs font-mono text-zinc-500 max-w-xs mb-6">
              Neural-powered voice engine. Real-time TTS, STT, and Voice Cloning for the modern web.
            </p>
            <div className="flex items-center gap-4">
              {/* Social placeholders */}
              <div className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors"><Globe className="w-4 h-4 text-zinc-400" /></div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-white mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="#features" className="hover:text-cyan-400 transition-colors">Modules</Link></li>
              <li><Link href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="/docs" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
              <li><Link href="/docs/api" className="hover:text-cyan-400 transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-colors">Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-white mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li><Link href="/privacy-policy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-use" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-cyan-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            © 2026 iPulse Labs. All rights reserved.
          </div>
          {/* <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-cyan-500/50" /> Secure Payments by Lemon Squeezy
          </div> */}
        </div>
      </div>
    </footer>
  );
};

// --- Main Page ---

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative selection:bg-cyan-500/30 overflow-x-hidden">
      <ModernBackground />

      <Navbar />
      <HeroSection />
      <StatsMarquee />
      <FeaturesBento />
      <HowItWorksSection />
      <VoiceDemoSection />
      <TestimonialsSection />
      <PricingSection />
      <CtaBanner />
      <Footer />
    </div>
  );
}