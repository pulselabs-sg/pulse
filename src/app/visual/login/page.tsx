'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { ModernBackground } from '@/components/ui/VisualEffects';
import { Sparkles } from 'lucide-react';

export default function VisualLoginPage() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Cinematic Ambient Effects */}
      <ModernBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Branding Title */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-white/[0.03] border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_35px_rgba(34,211,238,0.2)] hover:border-cyan-500/30 transition-all duration-500 group"
          >
            <img src="/logo.webp" alt="iPulse Logo" className="w-10 h-10 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
          </motion.div>
          
          <h1 className="text-3xl font-mono tracking-[0.25em] font-bold mb-3 text-white uppercase text-glow-white">
            iPulse Vision
          </h1>
          <p className="text-zinc-400 font-mono text-[9px] tracking-[0.3em] uppercase opacity-75">
            Generative Synthesizer Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="glass-dark border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden group hover:border-white/15 transition-all duration-500">
          {/* Subtle Ambient Radial Light */}
          <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-cyan-500/5 transition-all duration-500 pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-indigo-500/5 transition-all duration-500 pointer-events-none" />

          <div className="space-y-8 relative z-10">
            <div className="text-center">
              <h2 className="text-xl font-editorial italic text-white mb-2 tracking-wide">
                Initialize System Workspace
              </h2>
              <p className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider leading-relaxed">
                Sign in to build, extend, and animate custom generative assets.
              </p>
            </div>

            {/* Fully Rounded Glow Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => signIn('google', { callbackUrl: '/visual' })}
              className="w-full h-14 bg-white text-black hover:bg-zinc-200 transition-all duration-300 rounded-full font-mono text-xs uppercase font-bold flex items-center justify-center gap-4 group/btn relative overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
            >
              <div className="flex items-center justify-center w-6 h-6 bg-black rounded-full transition-transform duration-300 group-hover/btn:scale-110">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              Continue with Google
            </motion.button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[9px] font-mono text-zinc-500 tracking-wider uppercase leading-relaxed">
            By continuing, you agree to our <br />
            <a href="/terms-of-use" className="text-zinc-300 hover:text-white transition-colors underline decoration-white/10 hover:decoration-white/30">Terms of Use</a> & <a href="/privacy-policy" className="text-zinc-300 hover:text-white transition-colors underline decoration-white/10 hover:decoration-white/30">Privacy Policy</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
