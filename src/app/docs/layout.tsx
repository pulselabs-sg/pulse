'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BookOpen, CreditCard, HelpCircle, FileText, Code, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'introduce' | 'pricing' | 'guide' | 'faqs' | 'terms' | 'api';

const TABS: { id: Tab; label: string; icon: any; disabled?: boolean; badge?: string }[] = [
  { id: 'introduce', label: 'Introduce', icon: BookOpen },
  { id: 'pricing', label: 'Pricing', icon: CreditCard },
  { id: 'guide', label: 'Guide', icon: Zap },
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
            <Link href="/" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-3 h-3" /> <span className="hidden md:inline">Return to Hub</span>
            </Link>
            <Link href="/dashboard" className="px-3 py-1.5 bg-white text-black font-bold rounded-sm hover:bg-cyan-300 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row max-w-screen-2xl mx-auto pt-14 min-h-screen relative z-10">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 backdrop-blur-md sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4 px-3">Documentation Index</h2>
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
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-[11px] font-mono tracking-widest uppercase transition-all text-left",
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
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-12 lg:p-16 max-w-5xl bg-[#050505] shadow-[inset_1px_0_0_rgba(255,255,255,0.02)]">
          {children}
        </main>
      </div>
    </div>
  );
}
