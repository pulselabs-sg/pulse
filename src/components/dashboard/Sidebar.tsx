import { Menu, X, Crown, CreditCard, User, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tab, TABS, Tier } from '@/lib/dashboard-constants';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  userState: { tier: Tier; usage: number; limit: number };
  session: any;
  setShowPlanModal: (v: boolean) => void;
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, userState, session, setShowPlanModal }: SidebarProps) {
  const isLimitReached = userState.limit !== Infinity && userState.usage >= userState.limit;
  const mainTabs = TABS.filter(t => t.id !== 'profile' && t.id !== 'history' && t.id !== 'clone');
  const bottomTabs = TABS.filter(t => t.id === 'profile' || t.id === 'history');

  const handleTabClick = (id: Tab) => {
    setActiveTab(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
      className={cn(
        "glass-dark border-r border-white/10 flex flex-col shrink-0 transition-all duration-500 z-50 fixed md:relative h-[100dvh] md:h-full top-0 left-0 shadow-[0_0_50px_rgba(0,0,0,1)]",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="h-16 flex items-center border-b border-white/5 px-6">
        {isSidebarOpen && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden">
              <img src="/logo.webp" alt="iPulse Logo" className="w-full h-full object-cover opacity-80" />
            </div>
            <span className="font-bold text-sm text-white tracking-[0.3em] uppercase">iPulse</span>
          </div>
        )}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={cn("p-2 hover:bg-white/5 text-zinc-500 hover:text-white rounded-lg transition-all", isSidebarOpen ? "ml-auto" : "mx-auto")}>
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4 hidden md:block" />}
        </button>
      </div>

      <div className="flex-1 py-6 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-1 px-3">
          {isSidebarOpen && <p className="text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-3 px-3">Intelligence Matrix</p>}
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as Tab)}
              className={cn(
                "group relative flex items-center gap-2 p-2 rounded-xl text-sm transition-all duration-300",
                activeTab === tab.id ? "bg-white/5 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" : "text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300"
              )}
            >
              {activeTab === tab.id && (
                <>
                  <motion.div layoutId="active-pill" className="absolute left-0 top-3 bottom-3 w-[3px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                  <div className="absolute inset-0 bg-white/5 blur-xl rounded-full opacity-50" />
                </>
              )}
              <tab.icon className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-white" : "text-zinc-600")} />
              {isSidebarOpen && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className={cn("font-bold tracking-wider text-[10px] md:text-[11px] transition-colors uppercase", activeTab === tab.id ? "text-white " : "text-zinc-400 group-hover:text-zinc-200")}>{tab.label}</span>
                  <span className="text-[9px] md:text-[10px] truncate font-mono text-zinc-600 tracking-tighter">{tab.desc}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-white/5 pt-4 flex flex-col gap-2 px-3 mb-6">
          {bottomTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id as Tab)}
              className={cn(
                "group relative flex items-center gap-2 p-2 rounded-xl text-sm transition-all duration-300",
                activeTab === tab.id ? "bg-white/5 text-white" : "text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300"
              )}
            >
              {activeTab === tab.id && <motion.div layoutId="active-pill-bottom" className="absolute left-0 top-3 bottom-3 w-[3px] bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" />}
              <tab.icon className={cn("w-4 h-4 shrink-0", activeTab === tab.id ? "text-white" : "text-zinc-600")} />
              {isSidebarOpen && <span className={cn("font-bold tracking-wider text-[11px]", activeTab === tab.id ? "text-white " : "text-zinc-400")}>{tab.label}</span>}
            </button>
          ))}
          {/* <Link href="/docs" target="_blank" className="group relative flex items-center gap-2 p-2 rounded-xl text-sm transition-all duration-300 text-zinc-500 hover:bg-white/[0.02] hover:text-zinc-300 mt-1">
            <BookOpen className="w-4 h-4 shrink-0 text-zinc-600 group-hover:text-white transition-colors" />
            {isSidebarOpen && <span className="font-bold tracking-wider text-[11px] text-zinc-400 group-hover:text-zinc-200 transition-colors">Documentation</span>}
          </Link> */}
        </div>

        {isSidebarOpen ? (
          <div className="mx-4 mb-6 p-5 rounded-2xl glass border border-white/5 hover:border-white/10 transition-all group/usage relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/usage:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-400">
                  <Crown className={cn("w-3.5 h-3.5", userState.tier === 'FREE' ? "text-zinc-700" : "text-white")} /> {userState.tier}
                </span>
                <span className="text-[10px] font-bold text-white tracking-tighter ">{userState.usage.toLocaleString()}<span className="text-zinc-600 font-normal">/{userState.limit.toLocaleString()}</span></span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((userState.usage / (userState.limit === Infinity ? 100 : userState.limit)) * 100, 100)}%` }}
                  className={cn("h-full rounded-full", isLimitReached ? "bg-red-500" : "bg-white")}
                />
              </div>
              <button onClick={() => setShowPlanModal(true)} className="w-full py-2 hover:bg-white text-zinc-400 hover:text-black text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <CreditCard className="w-3.5 h-3.5" /> Manage
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 flex justify-center border-t border-white/5 mt-auto">
            <button onClick={() => handleTabClick('profile')} className="w-10 h-10 rounded-xl glass flex items-center justify-center border border-white/10 hover:border-white/50 transition-all active:scale-90 overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] group">
              {session?.user?.image ? <img src={session.user.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /> : <User className="w-5 h-5 text-zinc-500" />}
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}
