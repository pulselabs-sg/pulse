'use client';

import { useEffect, useRef } from 'react';

export const StarfieldCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const FOCAL = 800;

    type Star = {
      x: number; y: number; z: number;
      r: number;
      alpha: number;
      color: string;
    };

    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      stars = [];
      const count = Math.min(400, Math.floor((canvas.width * canvas.height) / 4000)); // Nhiều sao hơn nhưng nhỏ hơn

      const colors = ['#ffffff', '#e0f2fe', '#c7d2fe', '#fdfdbd']; // Trắng, xanh nhạt, tím nhạt, vàng nhạt (hiếm)

      for (let i = 0; i < count; i++) {
        stars.push({
          x: (Math.random() - 0.5) * canvas.width * 2,
          y: (Math.random() - 0.5) * canvas.height * 2,
          z: Math.random() * FOCAL,
          r: Math.random() * 1.2 + 0.2, // Sao rất nhỏ
          alpha: Math.random(),
          color: colors[Math.floor(Math.random() * (Math.random() > 0.9 ? 4 : 3))], // 10% cơ hội là sao vàng
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      for (const s of stars) {
        s.z -= 0.5;

        if (s.z <= 0) {
          s.z = FOCAL;
          s.x = (Math.random() - 0.5) * canvas.width * 2;
          s.y = (Math.random() - 0.5) * canvas.height * 2;
        }

        const scale = FOCAL / (FOCAL + s.z);
        const sx = cx + s.x * scale;
        const sy = cy + s.y * scale;
        const sr = s.r * scale;

        const depthAlpha = (1 - s.z / FOCAL);

        s.alpha += (Math.random() - 0.5) * 0.05;
        if (s.alpha < 0.2) s.alpha = 0.2;
        if (s.alpha > 1) s.alpha = 1;

        const finalAlpha = depthAlpha * s.alpha;

        if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) continue;

        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);

        if (sr > 1) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = s.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(${hexToRgb(s.color)}, ${finalAlpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.8 }} />;
};

export const NebulaBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black" aria-hidden>
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,#030510_0%,#000000_100%)]" />

    <div
      className="absolute aurora-blob"
      style={{
        width: '140vw', height: '80vh',
        top: '-10vh', left: '-20vw',
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(40,10,80,0.15), transparent 70%)',
        filter: 'blur(80px)',
        animationDuration: '28s',
      }}
    />
    <div
      className="absolute aurora-blob"
      style={{
        width: '120vw', height: '60vh',
        top: '20vh', right: '-10vw',
        background: 'radial-gradient(ellipse 60% 45% at 50% 50%, rgba(10,30,90,0.12), transparent 68%)',
        filter: 'blur(90px)',
        animationDuration: '35s',
        animationDelay: '-10s',
      }}
    />
    <div
      className="absolute aurora-blob"
      style={{
        width: '100vw', height: '50vh',
        bottom: '-10vh', left: '10vw',
        background: 'radial-gradient(ellipse 55% 40% at 50% 50%, rgba(0,100,120,0.08), transparent 65%)',
        filter: 'blur(100px)',
        animationDuration: '30s',
        animationDelay: '-5s',
      }}
    />

    <ShootingStars />

    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
    <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
  </div>
);

const ShootingStars = () => {
  const stars = [
    { delay: '2s', dur: '4s', top: '10%', opacity: 0.6, rotate: '35deg' },
    { delay: '7s', dur: '3s', top: '40%', opacity: 0.4, rotate: '35deg' },
    { delay: '15s', dur: '5s', top: '70%', opacity: 0.5, rotate: '35deg' },
    { delay: '22s', dur: '4s', top: '20%', opacity: 0.3, rotate: '35deg' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute shooting-beam pointer-events-none"
          style={{
            top: s.top,
            width: '150px',
            height: '1px',
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,${s.opacity}), transparent)`,
            filter: 'blur(0.5px)',
            transform: `rotate(${s.rotate})`,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}
    </div>
  );
};

export const ModernBackground = () => (
  <>
    <NebulaBackground />
    <StarfieldCanvas />
    <div className="fixed inset-0 bg-[url('/noise.png')] bg-repeat opacity-[0.02] mix-blend-overlay z-0 pointer-events-none" />
  </>
);