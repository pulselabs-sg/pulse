'use client';

import { motion, useScroll } from 'framer-motion';
import { ArrowRight, AudioLines, Zap, Terminal, Mic, Check, Layers, Code, ShieldCheck, Globe, Activity, Server, Users } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ModernBackground } from '@/components/ui/VisualEffects';

const Navbar = () => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setIsScrolled(v > 20));
    return unsub;
  }, [scrollY]);
  return (
    <nav className={cn('fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-500 flex items-center px-6 md:px-12', isScrolled ? 'border-b border-white/5 bg-black/60 backdrop-blur-xl' : '')}>
      <div className="flex-1 flex items-center gap-3">
        <img src="/logo.webp" alt="iPulse" className="w-7 h-7 rounded-sm object-cover" />
        <span className="font-mono text-sm tracking-[0.2em] text-white uppercase">iPulse</span>
      </div>
      <div className="hidden md:flex flex-1 items-center justify-center gap-8 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
        <Link href="#features" className="hover:text-white transition-colors">Platform</Link>
        <Link href="#workflow" className="hover:text-white transition-colors">Workflow</Link>
        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
        <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
      </div>
      <div className="flex-1 flex justify-end">
        <Link href="/dashboard" target='_blank' className="px-5 py-2 bg-white text-black rounded-sm text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-zinc-200 transition-all flex items-center gap-2 group">
          Launch App <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </nav>
  );
};

const WaveformLine = () => (
  <div className="flex items-end justify-center gap-[3px] h-16 w-full">
    {[...Array(60)].map((_, i) => (
      <motion.div key={i} animate={{ height: [4, 18 + Math.random() * 40, 4] }} transition={{ duration: 1.2 + Math.random() * 1.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 }} className="w-[2px] bg-white/50 rounded-full" style={{ minHeight: 2 }} />
    ))}
  </div>
);

const HeroSection = () => (
  <div className="relative z-10 min-h-screen flex items-center px-6 md:px-12 pt-24 pb-16">
    {/* vertical center-line decoration */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full pointer-events-none" style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.04) 60%, transparent 100%)' }} />

    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* ── Left: copy ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex flex-col items-start"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] font-mono uppercase tracking-widest mb-10 animate-badge-pulse">
          <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse rounded-full" />
          <span className="text-zinc-300">Neural Synthesis Engine v2.4 - Live</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl tracking-tighter leading-[1.15] text-white mb-6">
          The voice of<br />
          <span className="text-white text-glow-white">Artificial</span><br />
          <span className="text-white">Intelligence.</span>
        </h1>

        <p className="text-sm md:text-base font-mono text-zinc-400 max-w-md leading-relaxed">
          Generate hyper-realistic speech, clone any voice in seconds, and transcribe audio with 99% accuracy through a single neural API.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
          <Link href="/dashboard" target='_blank' className="px-8 py-4 bg-white text-black rounded-sm text-xs font-mono uppercase tracking-[0.2em] font-bold hover:bg-zinc-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.12)] flex items-center gap-2 group">
            Start Building <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/docs" target='_blank' className="px-8 py-4 glass-mid text-white rounded-sm text-xs font-mono uppercase tracking-[0.2em] font-bold hover:bg-white/10 transition-all border border-white/10 flex items-center gap-2">
            <Code className="w-3.5 h-3.5" /> Read the Docs
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> SOC 2 Compliant</span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Sub-200ms Latency</span>
          <span className="w-px h-3 bg-white/10" />
          <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> 32+ Languages</span>
        </div>
      </motion.div>

      {/* ── Right: waveform visualizer ── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        className="flex flex-col gap-4"
      >
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-[0_0_60px_rgba(255,255,255,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">Live Output Stream</span>
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />Rendering
            </span>
          </div>
          <WaveformLine />
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
            <span>24.4 kHz · 32-bit float</span>
            <span>en-neural-1</span>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);


const StatsStrip = () => {
  const stats = [
    { label: 'Generations / Day', value: '2.5M+' }, { label: 'Uptime', value: '99.99%' },
    { label: 'Active Creators', value: '150k+' }, { label: 'Languages', value: '32+' },
    { label: 'Voice Models', value: '1,200+' }, { label: 'Avg. Latency', value: '<200ms' },
  ];
  return (
    <div className="relative z-10 border-y border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-1">
              <span className="text-2xl font-bold font-mono text-white">{s.value}</span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-600">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeatureVisualTTS = () => (
  <div className="glass-dark rounded-2xl p-6 border border-white/8 overflow-hidden">
    <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Output Stream</div>
    <div className="flex items-end gap-[2px] h-20 mb-4">
      {[...Array(48)].map((_, i) => (
        <motion.div key={i} animate={{ height: [3, 15 + Math.random() * 45, 3] }} transition={{ duration: 1.4 + Math.random() * 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.035 }} className="flex-1 bg-white/25 rounded-full" style={{ minHeight: 2 }} />
      ))}
    </div>
    <div className="flex items-center justify-between border-t border-white/5 pt-4">
      <span className="text-[10px] font-mono text-zinc-600">24.4 kHz - 32-bit float</span>
      <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />Live</span>
    </div>
  </div>
);

const FeatureVisualClone = () => (
  <div className="glass-dark rounded-2xl p-6 border border-white/8 overflow-hidden">
    <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-5">Identity Match</div>
    <div className="space-y-3">
      {['Source Audio', 'Neural Embedding', 'Clone Output'].map((label, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[9px] font-mono text-zinc-600 w-28 shrink-0">{label}</span>
          <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
            <motion.div animate={{ width: ['0%', `${70 + i * 10}%`] }} transition={{ duration: 1.5, delay: i * 0.3, ease: 'easeOut' }} className="h-full bg-white/40 rounded-full" />
          </div>
          <span className="text-[9px] font-mono text-zinc-500">{70 + i * 10}%</span>
        </div>
      ))}
    </div>
    <div className="mt-5 pt-4 border-t border-white/5 text-[10px] font-mono text-zinc-500">Similarity: <span className="text-white font-bold">98.7%</span></div>
  </div>
);

const FeatureVisualAPI = () => (
  <div className="glass-dark rounded-2xl p-5 border border-white/8 font-mono text-xs overflow-hidden">
    <div className="flex gap-1.5 mb-4">
      <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-white/20" />
    </div>
    <pre className="text-[11px] leading-relaxed text-zinc-400 overflow-x-auto whitespace-pre-wrap">{`// Generate speech via REST
fetch('/v1/tts/generate', {
  method: 'POST',
  body: JSON.stringify({
    text: 'Hello world',
    voice_id: 'en-neural-1',
    format: 'mp3'
  })
});`}</pre>
  </div>
);

const featuresData = [
  { tag: 'Text-to-Speech', title: 'Words spoken with\nhuman-level nuance.', desc: 'Acoustic models that understand context, emotion, and prosody. Studio-quality voiceovers indistinguishable from real recordings. Zero-shot cloning. Sub-200ms latency.', icon: AudioLines, visual: <FeatureVisualTTS />, reverse: false },
  { tag: 'Voice Cloning', title: 'Any voice.\nFive seconds of audio.', desc: 'Upload a short reference clip and our neural encoder extracts the full vocal identity - tone, cadence, accent, texture - ready to synthesize anything.', icon: Mic, visual: <FeatureVisualClone />, reverse: true },
  { tag: 'Developer API', title: 'Integrate neural audio\ninto any stack.', desc: 'Standard REST endpoints, WebSocket streaming, and SDKs for Python, Node, and Go. Built for production with 99.99% uptime and global edge delivery.', icon: Terminal, visual: <FeatureVisualAPI />, reverse: false },
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
          <motion.div key={i} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.8 }} className={cn('grid grid-cols-1 lg:grid-cols-2 gap-16 items-center', f.reverse ? 'lg:grid-flow-dense' : '')}>
            <div className={f.reverse ? 'lg:col-start-2' : ''}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4">{f.tag}</p>
              <h3 className="text-3xl md:text-4xl text-white tracking-tight mb-6 whitespace-pre-line">{f.title}</h3>
              <p className="text-sm font-mono text-zinc-400 leading-relaxed max-w-md mb-8">{f.desc}</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white border-b border-white/20 pb-0.5 hover:border-white/60 transition-colors group">
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
  { num: '01', title: 'Input text or audio', desc: 'Provide a text payload or raw audio file via REST or WebSocket. Any format, any length.' },
  { num: '02', title: 'Neural processing', desc: 'Models analyze emotional context, cadence, and vocal characteristics to craft the perfect output.' },
  { num: '03', title: 'Stream the result', desc: 'Receive ultra-low latency PCM or MP3 audio streamed directly to your client in real-time.' },
];

const VerticalTimeline = () => (
  <section id="workflow" className="relative z-10 py-32 border-y border-white/5">
    <div className="max-w-4xl mx-auto px-6">
      <div className="text-center mb-20">
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Workflow</p>
        <h2 className="text-4xl md:text-5xl text-white tracking-tight">From signal to sound.</h2>
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
  const [text, setText] = useState('The neural synthesis engine renders speech with remarkable precision and emotional depth.');
  return (
    <section className="relative z-10 py-32 max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Live Studio</p>
        <h2 className="text-4xl text-white tracking-tight">Hear it for yourself.</h2>
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <div className="glass-dark rounded-2xl overflow-hidden border border-white/8 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
          <div className="h-11 border-b border-white/6 flex items-center px-4 gap-2 bg-black/40">
            <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-zinc-800" /><div className="w-2.5 h-2.5 rounded-full bg-white/15" /></div>
            <span className="flex-1 text-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest">iPulse Studio - Neural TTS</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />Online</span>
          </div>
          <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Text Input</label>
                <textarea value={text} onChange={e => setText(e.target.value)} className="w-full h-28 bg-black/50 border border-white/8 rounded-lg px-3 py-3 text-sm text-zinc-300 font-mono resize-none focus:outline-none focus:border-white/20 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Voice Model</label><div className="bg-black/50 border border-white/8 rounded-lg px-3 py-2.5 text-xs font-mono text-zinc-400">en-neural-1</div></div>
                <div><label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-2">Format</label><div className="bg-black/50 border border-white/8 rounded-lg px-3 py-2.5 text-xs font-mono text-zinc-400">MP3 128kbps</div></div>
              </div>
              <Link href="/dashboard" target='_blank' className="flex items-center justify-center gap-2 py-3 bg-white text-black rounded-lg text-xs font-mono uppercase tracking-widest font-bold hover:bg-zinc-100 transition-all">
                <Layers className="w-3.5 h-3.5" /> Try in Dashboard
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <label className="block text-[9px] font-mono uppercase tracking-widest text-zinc-600">Output Waveform</label>
              <div className="flex-1 glass rounded-xl border border-white/6 flex flex-col items-center justify-center p-4 min-h-[160px]">
                <div className="flex items-end gap-[2px] h-16 w-full">
                  {[...Array(50)].map((_, i) => (<motion.div key={i} animate={{ height: [2, 10 + Math.random() * 40, 2] }} transition={{ duration: 1.2 + Math.random() * 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 }} className="flex-1 bg-white/20 rounded-full" style={{ minHeight: 2 }} />))}
                </div>
                <p className="text-[9px] font-mono text-zinc-700 mt-4 uppercase tracking-widest">Visualizing output waveform</p>
              </div>
              <div className="flex justify-between text-[9px] font-mono text-zinc-700 uppercase tracking-widest px-1"><span>0:00</span><span>Confidence: 99.98%</span><span>~3s</span></div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

const quotesList = [
  { text: '"The API latency is incredibly low. We integrated voice cloning into our game engine in under a day."', author: 'Alex R.', role: 'Lead Developer' },
  { text: '"Best text-to-speech quality I have heard. The emotional range in the generated voices is genuinely unmatched."', author: 'Sarah M.', role: 'Content Creator' },
  { text: '"iPulse completely transformed our automated customer service pipeline. It actually sounds human."', author: 'David T.', role: 'Product Manager' },
  { text: '"The audio cleaning tool saves me hours of editing on every podcast episode. Truly remarkable."', author: 'Elena G.', role: 'Podcaster' },
  { text: '"Their transcription accuracy, even with heavy accents and background noise, is phenomenal."', author: 'Priya S.', role: 'ML Researcher' },
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
        <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-600 mb-16">Community</p>
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
  { name: 'Free', price: '0', pulse: '20,000', desc: 'Test the engine at no cost.' },
  { name: 'Basic', price: '5', pulse: '60,000', desc: 'For regular creators.', recommended: true },
  { name: 'Premium', price: '10', pulse: '150,000', desc: 'For serious production.' },
  { name: 'Pro', price: '50', pulse: '800,000', desc: 'Enterprise-grade volume.' },
];

const PricingSection = () => (
  <section id="pricing" className="relative z-10 py-32 max-w-7xl mx-auto px-6">
    <div className="text-center mb-20">
      <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-3">Pricing</p>
      <h2 className="text-4xl md:text-5xl text-white tracking-tight">Simple. Transparent.</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {pricingPlans.map((plan, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={cn('rounded-xl p-8 flex flex-col relative transition-all duration-300 border', plan.recommended ? 'glass-mid border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.04)] lg:-translate-y-3' : 'glass-dark border-white/6 hover:border-white/15')}>
          {plan.recommended && (<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold">Most Popular</div>)}
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3">{plan.name}</div>
          <div className="flex items-baseline gap-1 mb-2"><span className="text-4xl font-black text-white">${plan.price}</span><span className="text-[10px] font-mono text-zinc-600 uppercase">/mo</span></div>
          <p className="text-xs text-zinc-600 font-mono mb-8 h-8">{plan.desc}</p>
          <div className="flex-1 space-y-3 mb-8">
            <div className="flex items-center gap-2.5 text-sm text-white font-mono"><Zap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />{plan.pulse} Pulse Credits</div>
            <div className="flex items-center gap-2.5 text-sm text-zinc-500"><Check className="w-3.5 h-3.5 shrink-0" />Full API Access</div>
            <div className="flex items-center gap-2.5 text-sm text-zinc-500"><Check className="w-3.5 h-3.5 shrink-0" />Commercial License</div>
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
      <div className="inline-flex items-center gap-2 px-3 py-1.5 glass rounded-full text-[10px] font-mono uppercase tracking-widest mb-10 border border-white/8">
        <span className="w-1.5 h-1.5 bg-cyan-400 animate-pulse rounded-full" />
        <span className="text-zinc-400">Free plan - no credit card required</span>
      </div>
      <h2 className="text-5xl md:text-7xl text-white tracking-tight mb-6 leading-[0.92]">Hear the<br /><span className="editorial-italic">difference.</span></h2>
      <p className="text-base text-zinc-500 font-mono mb-10 max-w-xl mx-auto leading-relaxed">Join thousands of developers and creators powering the next generation of audio experiences with iPulse.</p>
    </div>
  </section>
);

const Footer = () => (
  <footer className="relative z-10 pt-20 pb-10 border-t border-white/5 overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
      <span className="text-[20vw] font-black text-white/[0.018] tracking-tighter whitespace-nowrap">iPulse</span>
    </div>
    <div className="max-w-7xl mx-auto px-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-5"><img src="/logo.webp" alt="iPulse" className="w-7 h-7 rounded-sm object-cover" /><span className="font-mono text-sm tracking-[0.2em] text-white font-bold uppercase">iPulse</span></div>
          <p className="text-xs font-mono text-zinc-600 max-w-xs leading-relaxed">Neural-powered voice engine. Real-time TTS, STT, and voice cloning for the modern web.</p>
        </div>
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-5">Platform</h4>
          <ul className="space-y-3 text-sm text-zinc-600"><li><Link href="#features" target='_blank' className="hover:text-white transition-colors">Modules</Link></li><li><Link href="#pricing" target='_blank' className="hover:text-white transition-colors">Pricing</Link></li><li><Link href="/dashboard" target='_blank' className="hover:text-white transition-colors">Dashboard</Link></li></ul>
        </div>
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-5">Resources</h4>
          <ul className="space-y-3 text-sm text-zinc-600"><li><Link href="/docs" target='_blank' className="hover:text-white transition-colors">Documentation</Link></li><li><Link href="/docs/api" target='_blank' className="hover:text-white transition-colors">API Reference</Link></li><li><Link href="#" target='_blank' className="hover:text-white transition-colors">System Status</Link></li></ul>
        </div>
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-5">Legal</h4>
          <ul className="space-y-3 text-sm text-zinc-600"><li><Link href="/privacy-policy" target='_blank' className="hover:text-white transition-colors">Privacy Policy</Link></li><li><Link href="/terms-of-use" target='_blank' className="hover:text-white transition-colors">Terms of Service</Link></li><li><Link href="/refund-policy" target='_blank' className="hover:text-white transition-colors">Refund Policy</Link></li></ul>
        </div>
      </div>
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">2026 iPulse Labs. All rights reserved.</div>
        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Neural synthesis - crafted with precision</div>
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

  const text = "Audio intelligence is no longer constrained by the limits of human recording. We are entering a new paradigm where synthetic speech is indistinguishable from reality, completely dynamic, and generated in milliseconds.";
  const words = text.split(" ");
  const totalWords = words.length;
  // Spread words across 0→0.95; last word fully reveals at 95% so there's
  // a small breathing room before the section scrolls away.
  const span = 0.95;
  const windowSize = span / totalWords;

  return (
    // spacerRef sits here to give the scroll distance; sticky child pins inside it.
    <div ref={spacerRef} className="relative z-10 bg-black h-[700vh]">
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

const InteractiveTypographyGrid = () => {
  return (
    <section className="relative z-10 py-32 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Frame 1 */}
          <motion.div
            whileHover={{ scale: 0.98 }}
            className="glass-dark border border-white/10 rounded-2xl p-8 aspect-square flex flex-col justify-between relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest relative z-10">Neural Architecture</div>
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <motion.div
                className="font-mono text-[8px] md:text-[10px] leading-[1.1] text-zinc-600 group-hover:text-white transition-colors duration-500 whitespace-pre text-center"
                whileHover={{ scale: 1.1, rotate: 2 }}
              >
                {`
/ / / / / / / / / / /
 / / / / / / / / / / 
/ / / / / / / / / / /
 / / / / / / / / / / 
/ / / / / / / / / / /
 / / / / / / / / / / 
/ / / / / / / / / / /
`}
              </motion.div>
            </div>
            <div className="text-2xl font-bold text-white mt-auto relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
              Infinite Scaling
            </div>
          </motion.div>

          {/* Frame 2 */}
          <motion.div
            whileHover={{ scale: 0.98 }}
            className="glass-dark border border-white/10 rounded-2xl p-8 aspect-square flex flex-col justify-between relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest relative z-10">Latency Metrics</div>
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <motion.div
                className="grid grid-cols-5 gap-2 md:gap-3"
              >
                {[...Array(25)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 md:w-2 md:h-2 bg-zinc-600 group-hover:bg-white rounded-full transition-colors duration-500"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 2 }}
                  />
                ))}
              </motion.div>
            </div>
            <div className="text-2xl font-bold text-white mt-auto relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
              Sub-200ms
            </div>
          </motion.div>

          {/* Frame 3 */}
          <motion.div
            whileHover={{ scale: 0.98 }}
            className="glass-dark border border-white/10 rounded-2xl p-8 aspect-[2/1] lg:aspect-square lg:col-span-1 md:col-span-2 flex flex-col justify-between relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
          >
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest relative z-10">Model Accuracy</div>
            <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <motion.div
                className="text-6xl md:text-8xl font-editorial italic text-zinc-600 group-hover:text-white transition-all duration-700 select-none"
                whileHover={{ letterSpacing: "0.1em", scale: 1.05 }}
              >
                99.9%
              </motion.div>
            </div>
            <div className="text-2xl font-bold text-white mt-auto relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
              Zero-Shot
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const featureItems = [
  { icon: AudioLines, tag: 'Text to Speech', desc: 'Turn any text into hyper-realistic speech in milliseconds. 32+ languages with neural prosody and emotional range.' },
  { icon: Mic, tag: 'Speech to Text', desc: 'Transcribe audio at 99% accuracy even in noisy environments, with speaker diarisation, punctuation, and timestamps.' },
  { icon: Users, tag: 'Voice Cloning', desc: 'Clone any voice from just 5 seconds of audio. Preserve tone, cadence, and accent — ready to synthesise anything.' },
  { icon: Globe, tag: 'Translation', desc: 'Translate and re-voice content across 32+ languages while preserving the original speaker\'s voice and emotion.' },
  { icon: Activity, tag: 'Voice Changer', desc: 'Transform voices in real-time with neural filters. Change age, gender, accent, or style with zero latency.' },
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
    <div ref={spacerRef} className="relative z-10 bg-black h-[500vh] border-t border-white/5">
      <div className="sticky top-0 h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: sequential scroll-reveal feature list ── */}
          <div className="flex flex-col gap-8">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-600 mb-3">Platform Capabilities</p>
              <h2 className="text-2xl md:text-3xl text-white tracking-tight leading-[1.1]">
                Everything you need.<br />
                <span className="text-zinc-500">All in one API.</span>
              </h2>
            </div>

            <div className="flex flex-col gap-5">
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
                    className="flex items-start gap-4"
                  >
                    <div className={`mt-0.5 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300 ${isLit ? 'bg-white/10 border-white/25' : 'bg-white/[0.02] border-white/8'
                      }`}>
                      <f.icon className={`w-4 h-4 transition-colors duration-300 ${isLit ? 'text-white' : 'text-zinc-700'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold mb-1 transition-colors duration-300 ${isLit ? 'text-white' : 'text-zinc-700'}`}>{f.tag}</p>
                      <p className={`text-xs font-mono leading-relaxed transition-colors duration-300 ${isLit ? 'text-zinc-400' : 'text-zinc-800'}`}>{f.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div style={{ opacity: Math.max(0, Math.min(1, (progress - 0.85) / 0.1)) }}>
              <Link href="/docs" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white border-b border-white/20 pb-0.5 hover:border-white/60 transition-colors w-fit group">
                View full API reference <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* ── Right: image ── */}
          <motion.div
            style={{ opacity: Math.min(1, progress * 4), y: 20 * (1 - Math.min(1, progress * 4)) }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-[600px] aspect-square overflow-hidden">
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
