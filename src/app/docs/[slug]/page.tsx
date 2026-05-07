'use client';

import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, FileText, Zap, Mic, AudioLines, Sparkles, Terminal, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLANS } from '@/lib/dashboard-constants';

export default function DocsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const validSlugs = ['introduce', 'pricing', 'guide', 'faqs', 'terms'];
  if (!slug || !validSlugs.includes(slug)) {
    notFound();
  }

  const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
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
              <span className="text-zinc-400">SYSTEM ONLINE</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Introduction to iPulse
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Welcome to the official documentation for iPulse AI. We provide state-of-the-art neural voice engines, capable of real-time text-to-speech, speech-to-text, voice cloning, and audio cleaning. Our models are designed for developers, creators, and enterprises looking for the ultimate voice synthesis toolkit.
            </p>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-xl font-mono text-white tracking-widest uppercase flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400" /> Capabilities Matrix
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-sm p-6 group">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Zap className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Text to Speech (TTS)</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">High-fidelity natural voice synthesis supporting multiple languages and emotional tones.</p>
              </div>
              <div className="bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-sm p-6 group">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Speech to Text (STT)</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">Lightning-fast and highly accurate transcription with automatic punctuation and formatting.</p>
              </div>
              <div className="bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-sm p-6 group">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <AudioLines className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Voice Changer</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">Transform source audio into target voice styles while seamlessly preserving original prosody and emotion.</p>
              </div>
              <div className="bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-sm p-6 group">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Mic className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Audio Cleaner</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">Studio-grade noise reduction and vocal enhancement powered by advanced neural networks.</p>
              </div>
              <div className="bg-black/40 border border-white/5 hover:border-white/20 transition-all rounded-sm p-6 group">
                <div className="w-10 h-10 bg-white/5 rounded-sm flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                  <Wand2 className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white mb-2">Voice Cloning</h3>
                <p className="text-xs font-mono text-zinc-500 leading-relaxed">Map and synthesize neural identities from short audio samples to create custom, reusable voices.</p>
              </div>
            </div>
          </div>
        </PageTransition>
      );

    case 'pricing':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Resource Allocation Plans
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Choose the perfect capability tier for your production scale. All payments are processed securely via our merchant of record, Paddle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.id} className={cn("bg-[#080808] border p-6 flex flex-col relative transition-all duration-300 hover:-translate-y-1", plan.popular ? "border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.1)]" : "border-white/10 hover:border-white/30")}>
                {plan.popular && <div className="text-[9px] font-mono uppercase tracking-widest text-black bg-cyan-400 font-bold inline-block px-3 py-1 mb-4 self-start absolute top-0 -translate-y-1/2 left-6 shadow-[0_0_15px_rgba(34,211,238,0.5)]">RECOMMENDED</div>}
                
                <div className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-2">{plan.name}</div>
                
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-mono font-bold text-white">${plan.price}</span>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">{plan.period}</span>
                </div>
                
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-8 h-8 leading-relaxed">{plan.desc}</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                      <div className="mt-0.5 w-4 h-4 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-cyan-400" />
                      </div>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/dashboard" className={cn(
                  "w-full py-3 text-center text-[10px] font-mono uppercase tracking-widest font-bold transition-all rounded-sm flex items-center justify-center gap-2",
                  plan.popular ? "bg-cyan-400 text-black hover:bg-white" : "bg-white/5 hover:bg-white text-zinc-400 hover:text-black border border-white/10 hover:border-transparent"
                )}>
                  Access Dashboard
                </Link>
              </div>
            ))}
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
              <tbody className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">Pulse Allowance</td>
                  <td className="p-4">20,000 / mo</td>
                  <td className="p-4 text-cyan-400">60,000 / mo</td>
                  <td className="p-4">150,000 / mo</td>
                  <td className="p-4">800,000 / mo</td>
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
              </tbody>
            </table>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center gap-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5 text-cyan-400" /> 
            <span>Secure Payments processed by <span className="text-white">Paddle.com</span></span>
          </div>
        </PageTransition>
      );

    case 'guide':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Usage Guides
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Comprehensive step-by-step instructions for utilizing the iPulse dashboard modules to their fullest potential.
            </p>
          </div>
          
          <div className="space-y-8">
            {/* TTS */}
            <div className="bg-[#080808] border border-white/5 hover:border-white/10 transition-colors rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-sm flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white tracking-widest">Generating Speech (TTS)</h3>
              </div>
              <div className="p-6 md:p-8">
                <ol className="list-decimal list-inside space-y-4 text-xs font-mono text-zinc-400 leading-relaxed marker:text-cyan-400 marker:font-bold">
                  <li>Navigate to the <strong className="text-white">TTS tab</strong> in the primary dashboard sidebar.</li>
                  <li>Enter your desired script into the text workspace array. You can use expressiveness tags like <strong className="text-white">[laugh]</strong>, <strong className="text-white">[pause]</strong>, <strong className="text-white">[sigh]</strong>, <strong className="text-white">&lt;whisper&gt;</strong>, <strong className="text-white">&lt;emphasis&gt;</strong>, and <strong className="text-white">&lt;singing&gt;</strong> to add emotional nuance.</li>
                  <li>Select a voice avatar from the matrix (e.g., Eve for Energetic, Rex for Clear).</li>
                  <li>Hit the <strong className="text-white">Generate</strong> button. The neural engine will synthesize the audio within seconds.</li>
                  <li>Download the resulting high-fidelity waveform or review it in the History Log.</li>
                </ol>
              </div>
            </div>

            {/* STT */}
            <div className="bg-[#080808] border border-white/5 hover:border-white/10 transition-colors rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-sm flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white tracking-widest">Transcribing Audio (STT)</h3>
              </div>
              <div className="p-6 md:p-8">
                <ol className="list-decimal list-inside space-y-4 text-xs font-mono text-zinc-400 leading-relaxed marker:text-cyan-400 marker:font-bold">
                  <li>Access the <strong className="text-white">STT workspace</strong> via the dashboard.</li>
                  <li>Upload any supported audio file (MP3, WAV, MP4) using the drag-and-drop zone. The system utilizes <strong className="text-white">Automatic Language Detection</strong> to transcribe multi-lingual inputs seamlessly.</li>
                  <li>The system will automatically extract and detect speech components.</li>
                  <li>A clean, punctuated, and formatted transcript will be generated in the output panel.</li>
                  <li>Copy the text to your clipboard or download it as a raw `.txt` file.</li>
                </ol>
              </div>
            </div>

            {/* Voice Changer */}
            <div className="bg-[#080808] border border-white/5 hover:border-white/10 transition-colors rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-sm flex items-center justify-center">
                  <AudioLines className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white tracking-widest">Voice Changer</h3>
              </div>
              <div className="p-6 md:p-8">
                <ol className="list-decimal list-inside space-y-4 text-xs font-mono text-zinc-400 leading-relaxed marker:text-cyan-400 marker:font-bold">
                  <li>Navigate to the <strong className="text-white">Voice Changer</strong> module.</li>
                  <li>Upload a source audio file containing the base vocal track.</li>
                  <li>Select a target voice profile from the available roster to define the new vocal characteristics.</li>
                  <li>Initiate the transformation. The system uses advanced Voice Conversion (VC) to map the source intonation to the target timbre.</li>
                  <li>Download your transformed, studio-ready audio file.</li>
                </ol>
              </div>
            </div>

            {/* Audio Cleaner */}
            <div className="bg-[#080808] border border-white/5 hover:border-white/10 transition-colors rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-sm flex items-center justify-center">
                  <Mic className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white tracking-widest">Audio Cleaner</h3>
              </div>
              <div className="p-6 md:p-8">
                <ol className="list-decimal list-inside space-y-4 text-xs font-mono text-zinc-400 leading-relaxed marker:text-cyan-400 marker:font-bold">
                  <li>Open the <strong className="text-white">Audio Cleaner</strong> utility.</li>
                  <li>Upload an audio file suffering from background noise, reverb, or low fidelity.</li>
                  <li>The neural filter automatically isolates human speech and suppresses non-vocal artifacts.</li>
                  <li>Wait for processing to complete. The output will be a highly intelligible, enhanced waveform.</li>
                </ol>
              </div>
            </div>

            {/* Voice Cloning */}
            <div className="bg-[#080808] border border-white/5 hover:border-white/10 transition-colors rounded-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/20 rounded-sm flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-mono font-bold uppercase text-white tracking-widest">Cloning Voices</h3>
              </div>
              <div className="p-6 md:p-8">
                <ol className="list-decimal list-inside space-y-4 text-xs font-mono text-zinc-400 leading-relaxed marker:text-cyan-400 marker:font-bold">
                  <li>Navigate to the <strong className="text-white">Clone Voice</strong> module.</li>
                  <li>Upload a clear, 1-2 minute audio clip containing the speaker's voice with minimal background noise.</li>
                  <li>Click <strong className="text-white">Clone Voice</strong> and wait for the neural processing to complete.</li>
                  <li>The new identity will be saved in your <strong className="text-white">Saved Identities</strong> list, where you can rename it.</li>
                  <li>You can now select this custom voice in the TTS or Voice Changer modules.</li>
                </ol>
              </div>
            </div>

          </div>
        </PageTransition>
      );

    case 'faqs':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Common inquiries regarding limits, licensing, and general usage of the iPulse platform.
            </p>
          </div>
          <div className="space-y-6">
            <div className="bg-[#080808] border border-white/5 p-8 rounded-sm hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> Can I use generated audio commercially?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                Yes, commercial rights are fully included for all users on the <strong className="text-white">Basic, Premium, and Pro plans</strong>. Free tier users are restricted to non-commercial, personal, or evaluation use only.
              </p>
            </div>
            <div className="bg-[#080808] border border-white/5 p-8 rounded-sm hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> How are usages counted?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                One usage equals exactly one generation or processing request, regardless of the output length, provided it falls within your plan's maximum character or MB limits per request.
              </p>
            </div>
            <div className="bg-[#080808] border border-white/5 p-8 rounded-sm hover:border-white/10 transition-colors">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                <span className="text-cyan-400">Q.</span> How do I cancel my subscription?
              </h3>
              <p className="text-xs font-mono text-zinc-400 leading-relaxed pl-7">
                You can cancel anytime via the Dashboard's <strong className="text-white">Profile</strong> section by clicking 'Cancel Subscription'. Your access will remain fully active until the end of your current billing cycle.
              </p>
            </div>
          </div>
        </PageTransition>
      );

    case 'terms':
      return (
        <PageTransition>
          <div className="border-b border-white/5 pb-8">
            <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tighter text-white uppercase mb-6">
              Terms & Policy
            </h1>
            <p className="text-sm md:text-base font-mono text-zinc-400 leading-relaxed max-w-3xl">
              Please review our comprehensive legal documentation to understand your rights, data privacy, and obligations when utilizing the iPulse platform infrastructure.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <Link href="/terms-of-use" target="_blank" className="bg-[#080808] hover:bg-white/[0.02] border border-white/5 hover:border-white/20 p-8 rounded-sm flex flex-col items-start gap-6 transition-all group">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all">
                  <FileText className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-2">Terms of Use</h3>
                  <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-6">Read our core operational guidelines and user agreements.</p>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest group-hover:underline">Read full document →</span>
                </div>
             </Link>
             
             <Link href="/privacy-policy" target="_blank" className="bg-[#080808] hover:bg-white/[0.02] border border-white/5 hover:border-white/20 p-8 rounded-sm flex flex-col items-start gap-6 transition-all group">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-sm flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all">
                  <ShieldCheck className="w-5 h-5 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-2">Privacy Policy</h3>
                  <p className="text-xs font-mono text-zinc-500 leading-relaxed mb-6">Understand how we process, store, and protect your data.</p>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest group-hover:underline">Read full policy →</span>
                </div>
             </Link>
          </div>
        </PageTransition>
      );

    default:
      return null;
  }
}
