'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BookOpen, CreditCard, HelpCircle, FileText, Code, Zap, Sparkles, Image as ImageIcon, Video, Wand2, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'introduce' | 'image' | 'video' | 'flow' | 'audio' | 'pricing' | 'tutorials' | 'faqs' | 'terms' | 'api';

const TABS: { id: Tab; label: string; icon: any; disabled?: boolean; badge?: string }[] = [
  { id: 'introduce', label: 'Overview', icon: BookOpen },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'flow', label: 'Flow Extension', icon: Wand2 },
  { id: 'audio', label: 'Voices', icon: Mic },
  { id: 'pricing', label: 'Pricing', icon: CreditCard },
  { id: 'tutorials', label: 'Tutorials', icon: Zap },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'terms', label: 'Terms & Policy', icon: FileText },
  { id: 'api', label: 'API Reference', icon: Code, disabled: true, badge: 'Soon' },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Example pathname: /docs/pricing -> activeTab = 'pricing'
  const activeTab = pathname.split('/').pop() as Tab || 'introduce';

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans relative selection:bg-white/20">
      <div className="fixed inset-0 bg-[url('/noise.png')] bg-repeat opacity-40 mix-blend-overlay z-0 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3 group cursor-pointer">
            <div className="relative w-6 h-6 md:w-7 md:h-7 flex items-center justify-center overflow-hidden">
              <img src="/logo.webp" alt="iPulse Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-mono text-xs md:text-sm text-white tracking-widest">iPulse</span>
          </Link>
          <div className="flex items-center gap-4 md:gap-8 text-[10px] font-mono uppercase tracking-widest">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> <span className="hidden md:inline">Home Page</span>
            </Link>
            <Link href="/dashboard" className="px-3 py-1.5 bg-white text-black font-bold rounded-sm hover:bg-cyan-300 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row max-w-screen-2xl mx-auto pt-14 min-h-screen relative z-10">

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 backdrop-blur-md sticky top-14 self-start h-[calc(100vh-3.5rem)] flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 px-3">Documentation</h2>
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;

                if (tab.disabled) {
                  return (
                    <div
                      key={tab.id}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-[11px] font-mono tracking-widest uppercase text-zinc-700 cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </div>
                      {tab.badge && (
                        <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-sm text-zinc-500">{tab.badge}</span>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={tab.id}
                    href={`/docs/${tab.id}`}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-[11px] font-mono tracking-widest transition-all text-left",
                      isActive
                        ? "bg-white/10 text-white font-bold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className={cn("w-4 h-4", isActive ? "text-cyan-400" : "")} />
                      {tab.label}
                    </div>
                    {tab.badge && (
                      <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded-sm text-zinc-500">{tab.badge}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Social Footer */}
          <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md shrink-0">
            <h3 className="text-[9px] font-mono uppercase tracking-widest text-zinc-600 mb-3 text-center">Join Community</h3>
            <div className="flex items-center justify-center gap-4">
              <Link href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg>
              </Link>
              <Link href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path></svg>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-5xl bg-[#050505] shadow-[inset_1px_0_0_rgba(255,255,255,0.02)]">
          {children}
        </main>
      </div>
    </div>
  );
}
