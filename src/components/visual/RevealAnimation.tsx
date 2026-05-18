"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- Types ---
interface RevealAnimationProps {
  isVideo?: boolean;
  onComplete?: () => void;
  duration?: number; // Duration in milliseconds
}

// --- Sub-components ---

const DenseEffectBackground = ({ progress }: { progress: number }) => {
  // Simulate noise and blur clearing up as progress increases
  const blurAmount = Math.max(0, 30 - (progress / 100) * 30);
  const opacityAmount = Math.max(0.15, 1 - progress / 100);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[#050505] z-0">

      {/* Layer 1: Heavy Animated Gradient Mesh */}
      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.4), transparent 60%), radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.4), transparent 50%), radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.4), transparent 50%)'
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 100%', '100% 0%'],
          scale: [1, 1.25, 1.1, 1],
        }}
        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      />

      {/* Layer 2: Denser SVG Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-color-dodge pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* Layer 3: Multiple Intersecting Shimmer Sweeps */}
      {/* Sweep 1 - Primary white/silver */}
      <motion.div
        className="absolute inset-0 w-[300%] h-[300%] -top-[100%] -left-[100%]"
        style={{
          background: 'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 60%, transparent 80%)',
        }}
        animate={{ x: ['-50%', '50%'], y: ['-50%', '50%'] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
      {/* Sweep 2 - Secondary colored sweep intersecting */}
      <motion.div
        className="absolute inset-0 w-[300%] h-[300%] -top-[100%] -left-[100%]"
        style={{
          background: 'linear-gradient(250deg, transparent 20%, rgba(6, 182, 212, 0.15) 40%, rgba(99, 102, 241, 0.25) 50%, rgba(6, 182, 212, 0.15) 60%, transparent 80%)',
          mixBlendMode: 'overlay'
        }}
        animate={{ x: ['50%', '-50%'], y: ['50%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
      />

      {/* Layer 4: Dynamic Blur Layer (Simulating image getting clearer) */}
      <motion.div
        className="absolute inset-0 bg-white/5 backdrop-blur-3xl"
        animate={{ backdropFilter: `blur(${blurAmount}px)`, opacity: opacityAmount }}
        transition={{ ease: "linear", duration: 0.5 }}
      />

      {/* Layer 5: Generation Overlay (Vignette & Pulsing Glows) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)]" />

        {/* Top and Bottom pulsing ambient glows */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-500/30 to-transparent"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-cyan-500/30 to-transparent"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Inner Premium Border with Inner Shadow */}
        <div className="absolute inset-0 border-[2px] border-white/20 rounded-[2rem] mix-blend-overlay shadow-[inset_0_0_30px_rgba(255,255,255,0.1)]" />
      </div>
    </div>
  );
};

// --- Main Orchestrator ---

export default function RevealAnimation({
  isVideo = false, // Vẫn giữ lại prop này để không phá vỡ logic truyền vào từ component cha
  onComplete,
  duration = 8000 // 8 seconds default fake generation
}: RevealAnimationProps) {
  const [progress, setProgress] = useState(0);

  // Fake generation progress logic drives the blur clearing up
  useEffect(() => {
    const updateInterval = 50;
    const step = (100 / duration) * updateInterval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          if (onComplete) onComplete();
          return 100;
        }
        return next;
      });
    }, updateInterval);

    return () => clearInterval(timer);
  }, [duration, onComplete]);

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black/50 rounded-[2rem] shadow-2xl overflow-hidden z-20 group">
      {/* Background Effect Only */}
      <DenseEffectBackground progress={progress} />
    </div>
  );
}