'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  Loader2, LogIn, ChevronRight, Settings2, Mail, 
  LogOut, CheckCircle2, X, Sparkles, Check, 
  ShieldCheck, CreditCard, AlertTriangle, Crown, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { useSearchParams, useRouter } from 'next/navigation';

import Sidebar from '@/components/dashboard/Sidebar';
import HistoryPanel from '@/components/dashboard/HistoryPanel';
import WorkspacePanel from '@/components/dashboard/WorkspacePanel';
import { Tab, Tier, TIER_LIMITS, VOICES, TABS, PLANS } from '@/lib/dashboard-constants';
import { cn } from '@/lib/utils';

function DashboardContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');

  // Core States
  const [activeTab, setActiveTab] = useState<Tab>('tts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Workspace States
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [result, setResult] = useState<{ type: 'text' | 'audio'; content: string } | null>(null);

  // User & Billing States
  const [userState, setUserState] = useState({ 
    tier: 'FREE' as Tier, 
    usage: 0, 
    limit: 5, 
    maxFileMB: 50, 
    maxChars: 5000 
  });
  const [isCanceling, setIsCanceling] = useState(false);
  
  // Paddle States
  const [paddle, setPaddle] = useState<Paddle>();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkoutPlanContext, setCheckoutPlanContext] = useState<Tier | null>(null);

  const isLimitReached = userState.limit !== Infinity && userState.usage >= userState.limit;

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (session?.user) {
      const tier = (session.user as any).tier || 'FREE';
      setUserState({
        tier,
        usage: (session.user as any).usageCount || 0,
        limit: tier === 'PREMIUM' || tier === 'PRO' ? Infinity : TIER_LIMITS[tier as keyof typeof TIER_LIMITS].generations,
        maxFileMB: TIER_LIMITS[tier as keyof typeof TIER_LIMITS].maxFileMB,
        maxChars: TIER_LIMITS[tier as keyof typeof TIER_LIMITS].maxChars,
      });
    }
  }, [session]);

  // Initialize Paddle
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) return;

    initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
      eventCallback: (event) => {
        if (event.name === 'checkout.completed') {
          setShowPlanModal(false);
          setShowSuccessModal(true);
          update().catch(console.error);
        }
      },
    }).then((paddleInstance) => {
      if (paddleInstance) setPaddle(paddleInstance);
    });
  }, [update]);

  // Handle Checkout logic
  useEffect(() => {
    if (showCheckoutModal && checkoutPlanContext && paddle && session?.user) {
      const priceMap: Record<Tier, string> = {
        BASIC: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_BASIC || '',
        PREMIUM: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PREMIUM || '',
        PRO: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO || '',
        FREE: '',
      };
      const priceId = priceMap[checkoutPlanContext];
      if (!priceId) return;

      const timer = setTimeout(() => {
        try {
          paddle.Checkout.open({
            items: [{ priceId, quantity: 1 }],
            customData: { userId: String((session.user as any).id), plan: checkoutPlanContext },
            settings: {
              displayMode: 'inline',
              frameTarget: 'paddle-inline-container',
              frameInitialHeight: 500,
              frameStyle: 'width: 100%; background-color: transparent; border: none;',
              theme: 'dark',
              successUrl: `${window.location.origin}/dashboard?success=true`,
            },
          });
        } catch (err) {
          console.error("Paddle Checkout Error:", err);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [showCheckoutModal, checkoutPlanContext, paddle, session]);

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel? You will keep access until the end of the billing cycle.")) return;
    setIsCanceling(true);
    try {
      const res = await fetch('/api/paddle/cancel', { method: 'POST' });
      if (!res.ok) throw new Error("Cancellation failed");
      alert("Subscription scheduled for cancellation.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleLoadRecord = (record: any) => {
    const recordType = record.type.toLowerCase(); 
    
    setActiveTab(recordType as Tab);
    setResult({ type: recordType === 'stt' ? 'text' : 'audio', content: record.output });
    if (recordType === 'tts' && record.input) setTextInput(record.input);
  };

  if (status === "loading") return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>;

  if (!session) return <div className="flex h-screen items-center justify-center bg-black"><button onClick={() => signIn('google')} className="bg-white text-black px-6 py-3 font-mono uppercase font-bold">Sign In</button></div>;

  return (
    <div className="flex h-[100dvh] bg-black text-zinc-300 font-sans overflow-hidden">
      
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          />
        )}
      </AnimatePresence>

      <Sidebar 
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        userState={userState} session={session} setShowPlanModal={setShowPlanModal}
      />

      <main className="flex-1 flex flex-col relative bg-[url('/noise.png')] opacity-95 min-w-0 h-full">
        <header className="h-14 border-b border-white/5 bg-black/80 flex items-center px-4 md:px-6 text-[10px] font-mono uppercase text-zinc-600 z-10 relative">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden mr-3 p-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-sm border border-white/10 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          Root <ChevronRight className="w-3 h-3 mx-2" /> <span className="text-white">{TABS.find(t => t.id === activeTab)?.label}</span>
        </header>

        {activeTab === 'history' ? (
          <HistoryPanel onLoadRecord={handleLoadRecord} />
        ) : activeTab === 'profile' ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-6 pb-10">
              <h2 className="text-lg font-mono uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-zinc-500" /> Account Settings
              </h2>
              
              {/* Profile Card */}
              <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                <img src={session?.user?.image || ''} alt="Avatar" className="w-24 h-24 rounded-sm object-cover border border-white/20 z-10 grayscale hover:grayscale-0 transition-all duration-500" />
                <div className="flex-1 space-y-3 text-center md:text-left z-10">
                  <div>
                    <h3 className="text-xl font-mono tracking-widest text-white">{session?.user?.name}</h3>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase mt-1">UID: {(session.user as any).id}</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 items-center md:items-start">
                    <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-sm border border-white/5 text-[11px] font-mono">
                      <Mail className="w-3 h-3 text-white" /> {session?.user?.email}
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 bg-white/5 px-3 py-1.5 rounded-sm border border-white/5 text-[11px] font-mono">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Auth Valid
                    </div>
                  </div>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/' })} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-mono uppercase tracking-widest rounded-sm border border-white/10 transition-colors flex items-center gap-2 z-10">
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>

              {/* Billing & Usage Section */}
              <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-6">
                <h3 className="text-xs font-mono uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-zinc-500" /> Subscription & Billing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plan Card */}
                  <div className="bg-[#050505] border border-white/5 rounded-sm p-5 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Current Plan</p>
                      <div className="flex items-center gap-3 mb-6">
                        <span className={cn("text-xl font-mono font-bold uppercase tracking-widest", userState.tier !== 'FREE' ? 'text-emerald-400' : 'text-zinc-500')}>
                          {userState.tier}
                        </span>
                        {userState.tier !== 'FREE' && <span className="bg-emerald-400 text-black text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-none">ACTIVE</span>}
                      </div>
                    </div>
                    {userState.tier === 'FREE' ? (
                      <button onClick={() => setShowPlanModal(true)} className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-xs font-mono uppercase tracking-widest rounded-sm transition-colors">
                        Upgrade Plan
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button onClick={() => setShowPlanModal(true)} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono tracking-widest rounded-sm transition-colors border border-white/10">Change Plan</button>
                        <button onClick={handleCancelSubscription} disabled={isCanceling} className="w-full py-2 bg-transparent hover:bg-red-500/10 text-red-500 hover:text-red-400 text-xs font-mono tracking-widest rounded-sm transition-colors border border-red-500/50 hover:border-red-500/20 flex items-center justify-center gap-2">
                          {isCanceling ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />} Cancel Subscription
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Usage Card */}
                  <div className="bg-[#050505] border border-white/5 rounded-sm p-5">
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Usage this month</p>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-2xl font-mono text-white tracking-tighter">
                        {userState.usage} <span className="text-[10px] text-zinc-600 uppercase tracking-widest">uses</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Limit: {userState.limit === Infinity ? 'Unlimited' : userState.limit}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-none mb-4 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((userState.usage / (userState.limit === Infinity ? 100 : userState.limit)) * 100, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} className={cn("h-full", isLimitReached ? "bg-red-500" : "bg-emerald-400")} />
                    </div>
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Resets at the start of next billing cycle.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <WorkspacePanel 
            activeTab={activeTab} session={session} 
            userState={userState} setUserState={setUserState}
            textInput={textInput} setTextInput={setTextInput}
            file={file} setFile={setFile}
            selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}
            result={result} setResult={setResult}
          />
        )}
      </main>

      {/* --- PADDLE MODALS  --- */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowPlanModal(false)}>
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#050505] border border-white/10 rounded-sm max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl custom-scrollbar">
              <div className="px-5 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4 flex items-center justify-between border-b border-white/10 bg-black sticky top-0 z-10">
                <div>
                  <h2 className="text-base md:text-lg font-mono uppercase tracking-widest text-white">System Upgrade</h2>
                  <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">Select new capability matrix</p>
                </div>
                <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-white/10 text-zinc-500 hover:text-white rounded-sm transition-colors">
                  <X className="w-4 md:w-5 h-4 md:h-5" />
                </button>
              </div>
              <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map((plan) => {
                  const isCurrent = userState.tier === plan.id;
                  return (
                    <div key={plan.id} className={cn("rounded-sm border p-4 md:p-5 transition-all bg-black flex flex-col", isCurrent ? "border-white bg-white/5" : "border-white/10 hover:border-white/30")}>
                      {plan.popular && <div className="text-[9px] font-mono uppercase tracking-widest text-black bg-white inline-block px-2 py-0.5 mb-3 self-start">RECOMMENDED</div>}
                      <div className="text-sm font-mono uppercase tracking-widest text-white mb-1">{plan.name}</div>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-2xl md:text-3xl font-mono font-bold text-white">${plan.price}</span>
                        <span className="text-[9px] md:text-[10px] font-mono uppercase text-zinc-500">{plan.period}</span>
                      </div>
                      <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6">{plan.desc}</p>
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-[9px] md:text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                            <Check className="w-3 h-3 text-white shrink-0 mt-0.5" /> <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => { setShowPlanModal(false); if (plan.id !== 'FREE') { setCheckoutPlanContext(plan.id); setShowCheckoutModal(true); } }} disabled={isCurrent} className={cn("w-full py-2.5 font-mono text-[9px] uppercase font-bold rounded-sm border", isCurrent ? "bg-white/10 text-zinc-400 cursor-not-allowed" : "bg-white text-black")}>
                        {isCurrent ? '[ ACTIVE ]' : 'INITIALIZE'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal Frame */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/95 z-[150] flex items-center justify-center p-4">
             <div className="bg-[#050505] border border-white/10 w-full max-w-4xl p-6 rounded-sm relative">
                <button onClick={() => setShowCheckoutModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X/></button>
                <div id="paddle-inline-container" className="min-h-[500px]"></div>
             </div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center">
            <div className="bg-black border border-white/20 p-8 text-center max-w-sm">
              <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-xl font-mono text-white">Patch Applied</h2>
              <button onClick={() => setShowSuccessModal(false)} className="mt-8 bg-white text-black px-6 py-2 font-mono uppercase text-xs font-bold">Return</button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex h-[100dvh] items-center justify-center bg-black"><Loader2 className="animate-spin text-white" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}