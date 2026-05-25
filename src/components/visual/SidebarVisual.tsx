import { Menu, X, Crown, CreditCard, User, LayoutDashboard, PanelRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VISUAL_TABS, VisualTab } from '@/lib/visual-constants';
import { Tier } from '@/lib/dashboard-constants';

interface SidebarVisualProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (v: boolean) => void;
  activeTab: VisualTab;
  setActiveTab: (t: VisualTab) => void;
  userState: { tier: Tier; usage: number; limit: number };
  session: any;
  setShowPlanModal: (v: boolean) => void;
  projectId?: string;
  onSelectHistory?: (item: any) => void;
}

export default function SidebarVisual({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  userState,
  session,
  setShowPlanModal,
  projectId,
  onSelectHistory
}: SidebarVisualProps) {
  const isLimitReached = userState.limit !== Infinity && userState.usage >= userState.limit;

  const handleTabClick = (id: VisualTab) => {
    setActiveTab(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 260 : 60 }}
      className={cn(
        "border-r border-white/10 flex flex-col shrink-0 transition-all duration-500 z-50 fixed md:relative h-[100dvh] md:h-full top-0 left-0 backdrop-blur-sm",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 flex items-center border-b border-white/5 px-6">
        {isSidebarOpen && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-8 h-8 flex items-center justify-center overflow-hidden">
              <img src="/logo.webp" alt="iPulse Logo" className="w-full h-full object-cover opacity-80" />
            </div>
            <span className="text-sm text-white tracking-[0.3em] font-mono font-bold uppercase text-glow-white">iPulse</span>
          </div>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn("hover:bg-white/5 text-zinc-400 hover:text-white rounded-lg transition-all", isSidebarOpen ? "ml-auto" : "mx-auto")}
        >
          {isSidebarOpen ? <X className="w-4 h-4" /> : <PanelRight className="w-5 h-5 hidden md:block" />}
        </button>
      </div>

      {/* Sidebar Navigation Links */}
      <div className="flex-1 py-6 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-2 px-3">
          {/* Dashboard Button */}
          <button
            onClick={() => handleTabClick('imagine')}
            className={cn(
              "group relative flex items-center justify-center gap-3 transition-all duration-300 border font-mono text-xs rounded-lg",
              isSidebarOpen ? "py-2.5 px-5 justify-start w-full" : "w-9 h-9 justify-center mx-auto",
              activeTab === 'imagine'
                ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)] border-white/10"
                : "text-zinc-400 hover:bg-white/[0.03] hover:text-white border-transparent"
            )}
          >
            {activeTab === 'imagine' && (
              <div className="absolute inset-0 bg-white/5 blur-md rounded-full opacity-40" />
            )}
            <LayoutDashboard className={cn("w-5 h-5 ml-0.5 shrink-0 transition-transform", activeTab === 'imagine' ? "text-white" : "text-zinc-400")} />
            {isSidebarOpen && (
              <span className="font-bold tracking-[0.15em] transition-colors uppercase text-[10px]">
                Dashboard
              </span>
            )}
          </button>

          {/* Profile Button */}
          <button
            onClick={() => handleTabClick('profile')}
            className={cn(
              "group relative flex items-center justify-center gap-3 transition-all duration-300 border font-mono text-xs rounded-xl",
              isSidebarOpen ? "py-2.5 px-5 justify-start w-full" : "w-9 h-9 justify-center mx-auto",
              activeTab === 'profile'
                ? "bg-white/10 text-white border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                : "text-zinc-400 hover:bg-white/[0.02] hover:text-zinc-300 border-transparent"
            )}
          >
            {activeTab === 'profile' && (
              <div className="absolute inset-0 bg-white/5 blur-md rounded-full opacity-40" />
            )}
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-xl object-cover opacity-80 group-hover:opacity-100 transition-opacity shrink-0" />
            ) : (
              <User className={cn("w-4 h-4 shrink-0 transition-transform group-hover:scale-110", activeTab === 'profile' ? "text-white" : "text-zinc-400")} />
            )}
            {isSidebarOpen && (
              <span className="font-bold tracking-[0.15em] text-[10px] uppercase">
                Profile
              </span>
            )}
          </button>
        </div>

        {/* Sidebar Usage Card */}
        <div className="mt-auto">
          {isSidebarOpen && (
            <div className="mx-4 mb-6 p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group/usage relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/usage:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 text-zinc-300">
                    <Crown className={cn("w-3.5 h-3.5", userState.tier === 'FREE' ? "text-zinc-600" : "text-white text-glow-white")} /> {userState.tier}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-white tracking-widest">
                    {userState.usage.toLocaleString()}
                    <span className="text-zinc-500 font-normal">/{userState.limit.toLocaleString()}</span>
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((userState.usage / (userState.limit === Infinity ? 100 : userState.limit)) * 100, 100)}%` }}
                    className={cn("h-full rounded-full", isLimitReached ? "bg-red-500 animate-pulse" : "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]")}
                  />
                </div>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="w-full py-2.5 bg-white/15 hover:bg-white text-zinc-300 hover:text-black text-[11px] font-bold tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all border border-white/15 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                >
                  Manage Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
