import { Menu, X, Crown, CreditCard, User } from 'lucide-react';
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
  const mainTabs = TABS.filter(t => t.id !== 'profile' && t.id !== 'history');
  const bottomTabs = TABS.filter(t => t.id === 'profile' || t.id === 'history');

  const handleTabClick = (id: Tab) => {
    setActiveTab(id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 260 : 70 }}
      className={cn(
        "bg-[#050505] border-r border-white/5 flex flex-col shrink-0 transition-transform duration-300 z-50 absolute md:relative h-full",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="h-14 flex items-center border-b border-white/5 px-4">
        {isSidebarOpen && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
              <img src="/logo.webp" alt="iPulse Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-mono text-xs text-white uppercase tracking-widest">iPulse</span>
          </div>
        )}
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-white/10 text-zinc-500 hover:text-white rounded-sm ml-auto transition-colors">
          {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 py-4 flex flex-col overflow-y-auto">
        <div className="flex flex-col gap-1 px-2">
          {isSidebarOpen && <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2 px-2">AI Modules</p>}
          {mainTabs.map((tab) => (
            <button key={tab.id} onClick={() => handleTabClick(tab.id as Tab)} className={cn("group relative flex items-center gap-3 p-2.5 rounded-sm text-xs transition-all", activeTab === tab.id ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300")}>
              {activeTab === tab.id && <motion.div layoutId="active-pill" className="absolute left-0 top-0 bottom-0 w-[2px] bg-white" />}
              <tab.icon className={cn("w-4 h-4 shrink-0", activeTab === tab.id ? "text-white" : "text-zinc-500")} />
              {isSidebarOpen && (
                <div className="flex flex-col min-w-0 text-left">
                  <span className="font-mono uppercase tracking-wider text-[11px] truncate">{tab.label}</span>
                  <span className="text-[9px] truncate font-mono text-zinc-600 uppercase">{tab.desc}</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-white/5 pt-3 flex flex-col gap-1 px-2 mb-3">
          {bottomTabs.map((tab) => (
            <button key={tab.id} onClick={() => handleTabClick(tab.id as Tab)} className={cn("group relative flex items-center gap-3 p-2.5 rounded-sm text-xs transition-all", activeTab === tab.id ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300")}>
              {activeTab === tab.id && <motion.div layoutId="active-pill" className="absolute left-0 top-0 bottom-0 w-[2px] bg-white" />}
              <tab.icon className={cn("w-4 h-4 shrink-0", activeTab === tab.id ? "text-white" : "text-zinc-500")} />
              {isSidebarOpen && <span className="font-mono uppercase tracking-wider text-[11px] truncate">{tab.label}</span>}
            </button>
          ))}
        </div>

        {isSidebarOpen ? (
          <div className="p-3 mx-2 mb-3 bg-black border border-white/10 rounded-sm hover:border-white/30 transition-all">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 text-zinc-400">
                <Crown className={cn("w-3 h-3", userState.tier === 'FREE' ? "text-zinc-600" : "text-emerald-400")} /> {userState.tier}
              </span>
              <span className="text-[9px] font-mono text-zinc-500">{userState.usage} / {userState.limit === Infinity ? '∞' : userState.limit}</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 mb-3 overflow-hidden">
              <motion.div animate={{ width: `${Math.min((userState.usage / (userState.limit === Infinity ? 100 : userState.limit)) * 100, 100)}%` }} className={cn("h-full", isLimitReached ? "bg-red-500" : "bg-emerald-400")} />
            </div>
            <button onClick={() => setShowPlanModal(true)} className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-mono uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 transition-all">
              <CreditCard className="w-3 h-3" /> Manage Plan
            </button>
          </div>
        ) : (
          <div className="p-3 flex justify-center border-t border-white/5">
            <button onClick={() => handleTabClick('profile')} className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center border border-white/10">
              {session?.user?.image ? <img src={session.user.image} alt="" className="w-full h-full rounded-sm opacity-80" /> : <User className="w-4 h-4 text-zinc-500" />}
            </button>
          </div>
        )}
      </div>
    </motion.aside>
  );
}