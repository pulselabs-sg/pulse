'use client';

import { useEffect, useRef, useState } from 'react';

export const StarfieldCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const FOCAL = 800;
    type Star = { x: number; y: number; z: number; r: number; alpha: number; color: string; };
    let stars: Star[] = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); };

    const init = () => {
      stars = [];
      const count = Math.min(350, Math.floor((canvas.width * canvas.height) / 5000));
      const colors = ['#ffffff', '#e0f2fe', '#c7d2fe'];
      for (let i = 0; i < count; i++) {
        stars.push({ x: (Math.random() - 0.5) * canvas.width * 2, y: (Math.random() - 0.5) * canvas.height * 2, z: Math.random() * FOCAL, r: Math.random() * 1.0 + 0.2, alpha: Math.random(), color: colors[Math.floor(Math.random() * colors.length)] });
      }
    };

    const hexToRgb = (hex: string) => {
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : '255, 255, 255';
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2; const cy = canvas.height / 2;
      for (const s of stars) {
        s.z -= 0.4;
        if (s.z <= 0) { s.z = FOCAL; s.x = (Math.random() - 0.5) * canvas.width * 2; s.y = (Math.random() - 0.5) * canvas.height * 2; }
        const scale = FOCAL / (FOCAL + s.z);
        const sx = cx + s.x * scale; const sy = cy + s.y * scale; const sr = s.r * scale;
        s.alpha += (Math.random() - 0.5) * 0.04;
        if (s.alpha < 0.15) s.alpha = 0.15; if (s.alpha > 1) s.alpha = 1;
        if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) continue;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.shadowBlur = sr > 0.8 ? 4 : 0; ctx.shadowColor = s.color;
        ctx.fillStyle = `rgba(${hexToRgb(s.color)}, ${(1 - s.z / FOCAL) * s.alpha})`; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize); resize(); draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.6 }} />;
};

const ShootingStars = () => {
  const stars = [
    { delay: '3s', dur: '5s', top: '8%', opacity: 0.5 },
    { delay: '9s', dur: '4s', top: '35%', opacity: 0.3 },
    { delay: '18s', dur: '6s', top: '65%', opacity: 0.4 },
    { delay: '26s', dur: '4s', top: '18%', opacity: 0.25 },
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <div key={i} className="absolute shooting-beam pointer-events-none" style={{ top: s.top, width: '120px', height: '1px', background: `linear-gradient(90deg, transparent, rgba(255,255,255,${s.opacity}), transparent)`, filter: 'blur(0.5px)', transform: 'rotate(35deg)', animationDelay: s.delay, animationDuration: s.dur }} />
      ))}
    </div>
  );
};

export const NebulaBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background" aria-hidden>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,#0e152d_0%,#03050c_100%)]" />
    <div className="absolute aurora-blob" style={{ width: '130vw', height: '70vh', top: '-10vh', left: '-15vw', background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(20,5,50,0.06), transparent 70%)', filter: 'blur(100px)', animationDuration: '32s' }} />
    <div className="absolute aurora-blob" style={{ width: '110vw', height: '55vh', top: '30vh', right: '-10vw', background: 'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(5,15,60,0.05), transparent 68%)', filter: 'blur(110px)', animationDuration: '40s', animationDelay: '-12s' }} />
    <div className="absolute aurora-blob" style={{ width: '90vw', height: '45vh', bottom: '-5vh', left: '15vw', background: 'radial-gradient(ellipse 55% 40% at 50% 50%, rgba(0,60,80,0.03), transparent 65%)', filter: 'blur(120px)', animationDuration: '28s', animationDelay: '-8s' }} />
    <ShootingStars />
    <div className="absolute inset-0 bg-gradient-to-b from-[#03050c]/70 via-transparent to-[#03050c]/90" />
    <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(3,5,12,0.7)]" />
  </div>
);

export const CinematicOverlay = () => (
  <>
    <div className="letterbox-top" />
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.5), inset 60px 0 120px rgba(0,0,0,0.25), inset -60px 0 120px rgba(0,0,0,0.25)' }} />
  </>
);

export const SpotlightCursor = () => {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, rgba(255,255,255,0.025) 0%, transparent 70%)` }} />
  );
};

export const ModernBackground = () => (
  <>
    <NebulaBackground />
    <StarfieldCanvas />
    <SpotlightCursor />
    <CinematicOverlay />
    <div className="fixed inset-0 bg-[url('/noise.png')] bg-repeat opacity-[0.025] mix-blend-overlay z-0 pointer-events-none" />
  </>
);