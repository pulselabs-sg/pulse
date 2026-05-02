'use client';

import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Globe, Shield, Zap, AudioLines } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 group hover:border-white/20 transition-colors"
          >
            <AudioLines className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </motion.div>
          <h1 className="text-3xl font-mono tracking-[0.2em] font-bold mb-3 text-white">iPulse</h1>
          <p className="text-zinc-500 font-mono text-[10px] tracking-widest">Advanced Neural Audio Synthesis</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Subtle line effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-mono uppercase tracking-widest text-zinc-300 mb-2">Access Portal</h2>
              <p className="text-zinc-500 text-[11px] font-mono">Log in to continue using our products.</p>
            </div>

            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full h-14 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl font-mono text-xs uppercase font-bold flex items-center justify-center gap-4 group/btn relative overflow-hidden"
            >
              <div className="flex items-center justify-center w-6 h-6 bg-black rounded-full transition-transform group-hover/btn:scale-110">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              Continue with Google
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-mono text-zinc-600 tracking-widest">
            By continuing, you agree to our <br />
            <a href="/terms-of-use" className="text-zinc-400 hover:text-white transition-colors">Terms</a> & <a href="/privacy-policy" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</a>
          </p>
        </div>
      </motion.div>

      {/* Decorative footer element */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-20">
        <div className="h-[1px] w-12 bg-white/20" />
        <div className="w-1 h-1 rounded-full bg-white/40" />
        <div className="h-[1px] w-12 bg-white/20" />
      </div>
    </div>
  );
}
