// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  Loader2, LogIn, ChevronRight, Settings2, Mail,
  LogOut, CheckCircle2, X, Sparkles, Check,
  ShieldCheck, CreditCard, AlertTriangle, Crown, Menu,
  FileText, Scale, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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

  // Core States — tab defaults to URL ?tab= param, falling back to 'tts'
  const tabParam = searchParams.get('tab') as Tab | null;
  const validTabs: Tab[] = ['tts', 'stt', 'changer', 'clone', 'translate', 'history', 'profile'];
  const initialTab: Tab = tabParam && validTabs.includes(tabParam) ? tabParam : 'tts';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Workspace States
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [result, setResult] = useState<{ type: 'text' | 'audio'; content: string; blob?: Blob } | null>(null);

  // User & Billing States
  const [userState, setUserState] = useState({
    tier: 'FREE' as Tier,
    usage: 0,
    limit: 5,
    maxFileMB: 50,
    maxChars: 5000,
    maxAudioMins: 5,
    cancelAtPeriodEnd: false
  });
  const [isCanceling, setIsCanceling] = useState(false);

  // Polar States
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkoutPlanContext, setCheckoutPlanContext] = useState<Tier | null>(null);

  // Terms & Privacy States
  const [showGlobalTermsModal, setShowGlobalTermsModal] = useState(false);
  const [hasAgreedGlobalTerms, setHasAgreedGlobalTerms] = useState(false);
  const [checkoutTermsAgreed, setCheckoutTermsAgreed] = useState(false);
  const [checkoutTermsConfirmed, setCheckoutTermsConfirmed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Billing Cycle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const successHandledRef = useRef(false);

  const isLimitReached = userState.limit !== Infinity && userState.usage >= userState.limit;

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    router.replace(`/audio?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);

    // Check if user has agreed to terms
    const agreed = localStorage.getItem('voicelab_agreed_to_terms') === 'true';
    if (!agreed) {
      setShowGlobalTermsModal(true);
    }
  }, [session]);

  // Sync active tab with URL search params
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam as Tab) && tabParam !== activeTab) {
      setActiveTab(tabParam as Tab);
    }
  }, [tabParam, activeTab]);

  useEffect(() => {
    if (session?.user) {
      const tier = (session.user as any).tier || 'FREE';
      setUserState({
        tier,
        usage: (session.user as any).usageCount || 0,
        limit: TIER_LIMITS[tier as keyof typeof TIER_LIMITS].pulse,
        maxFileMB: tier === 'FREE' ? 50 : tier === 'BASIC' ? 300 : 500,
        maxChars: TIER_LIMITS[tier as keyof typeof TIER_LIMITS].maxTTSChars,
        maxAudioMins: TIER_LIMITS[tier as keyof typeof TIER_LIMITS].maxAudioMins,
        cancelAtPeriodEnd: (session.user as any).cancelAtPeriodEnd || false
      });
    }
  }, [session]);

  // Check for success from Polar
  useEffect(() => {
    if (successParam === 'true' && !successHandledRef.current) {
      successHandledRef.current = true;

      // 1. Clean up URL parameters instantly and thoroughly
      if (typeof window !== 'undefined') {
        // Use the modern URL API to strip specific params
        const url = new URL(window.location.href);
        url.searchParams.delete('success');
        url.searchParams.delete('customer_session_token');

        // Push the clean URL to the browser history immediately
        window.history.replaceState(null, '', url.pathname + url.search);
      }

      // 2. Show the success modal
      setShowSuccessModal(true);

      // 3. Trigger session update and auto-cleanup
      setTimeout(() => {
        update().catch(console.error);
        router.replace('/audio', { scroll: false });

        // 4. Auto-close the modal after 4 seconds to "automatically redirect" the view
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 4000);
      }, 500);
    }
  }, [successParam, update, router]);

  // Handle Checkout logic (Polar Redirect)
  useEffect(() => {
    if (showCheckoutModal && checkoutPlanContext && session?.user && isRedirecting) {
      const variantMapMonthly: Record<Tier, string> = {
        BASIC: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_BASIC || '',
        PREMIUM: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM || '',
        PRO: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO || '',
        FREE: '',
      };

      const variantMapYearly: Record<Tier, string> = {
        BASIC: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_BASIC_YEARLY || '',
        PREMIUM: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PREMIUM_YEARLY || '',
        PRO: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID_PRO_YEARLY || '',
        FREE: '',
      };

      const productId = billingCycle === 'monthly' ? variantMapMonthly[checkoutPlanContext] : variantMapYearly[checkoutPlanContext];

      if (!productId) {
        alert('Polar Product ID not configured.');
        setShowCheckoutModal(false);
        setIsRedirecting(false);
        return;
      }

      const userId = (session.user as any).id;

      window.location.href = `/api/polar/checkout?product_id=${productId}&metadata[userId]=${userId}`;
    }
  }, [showCheckoutModal, checkoutPlanContext, session, isRedirecting, billingCycle]);

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel? You will keep access until the end of the billing cycle. Your data will be preserved.")) return;
    setIsCanceling(true);
    try {
      const res = await fetch('/api/polar/cancel', { method: 'POST' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Cancellation request failed. Please contact support.");
      }

      setUserState(prev => ({ ...prev, cancelAtPeriodEnd: true }));
      update();
      alert("Cancellation request successful. Your subscription will remain active until the end of the current period.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleLoadRecord = (record: any) => {
    let recordType = record.type.toLowerCase();
    if (recordType === 'voice changer') recordType = 'changer';
    if (recordType === 'clone voice') recordType = 'clone';

    setActiveTab(recordType as Tab);

    if (recordType === 'clone') {
      setResult(null);
      setTextInput('');
    } else {
      setResult({
        type: recordType === 'stt' ? 'text' : 'audio',
        content: record.output
      });
      if (recordType === 'tts' && record.input) setTextInput(record.input);
    }
  };


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") return <div className="flex h-screen items-center justify-center bg-black"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>;

  if (!session) return null;

  return (
    <div className="flex h-[100dvh] bg-black text-zinc-300 font-sans overflow-hidden relative">
      <div className="fixed inset-0 bg-[url('/noise.png')] bg-repeat opacity-20 mix-blend-overlay z-0 pointer-events-none" />

      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <Sidebar
        isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab} setActiveTab={handleTabChange}
        userState={userState} session={session} setShowPlanModal={setShowPlanModal}
      />

      <main className="flex-1 flex flex-col relative bg-[url('/noise.png')] opacity-95 min-w-0 h-full">
        <header className="h-14 border-b border-glass-border glass backdrop-blur-md flex items-center justify-between px-4 md:px-6 text-[10px] font-mono uppercase text-zinc-500 z-30 relative">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden mr-3 p-1.5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-sm border border-white/10 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.1)]"
            >
              <Menu className="w-4 h-4" />
            </button>
            Root <ChevronRight className="w-3 h-3 mx-2" /> <span className="text-white ">{TABS.find(t => t.id === activeTab)?.label}</span>
          </div>
          <div className="flex items-center">
            <span className="text-[8px] md:text-[10px] font-bold text-white tracking-widest px-3 py-1.5 rounded-sm border border-white/10">
              <span className="text-white mr-2 ">PULSE:</span>
              {Math.max(0, userState.limit - userState.usage).toLocaleString()} <span className="text-zinc-500 font-normal ml-1">REMAINING</span>
            </span>
          </div>
        </header>

        {activeTab === 'history' ? (
          <HistoryPanel onLoadRecord={handleLoadRecord} />
        ) : activeTab === 'profile' ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-6 pb-10">
              <h2 className="text-lg font-mono uppercase tracking-widest text-white mb-6 flex items-center gap-2 ">
                <Settings2 className="w-5 h-5 text-white" /> Account Settings
              </h2>

              {/* Profile Card */}
              <div className="glass-dark border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <img src={session?.user?.image || ''} alt="Avatar" className="w-24 h-24 rounded-3xl object-cover border border-white/20 z-10 grayscale hover:grayscale-0 transition-all duration-500" />
                <div className="flex-1 space-y-3 text-center md:text-left z-10">
                  <div>
                    <h3 className="text-xl font-mono tracking-widest text-white">{session?.user?.name}</h3>
                    {/* <p className="text-zinc-500 font-mono text-[10px] uppercase mt-1">UID: {(session.user as any).id}</p> */}
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 items-center md:items-start">
                    <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-sm border border-white/5 text-[11px] font-mono">
                      <Mail className="w-3 h-3 text-white" /> {session?.user?.email}
                    </div>
                    <div className="flex items-center gap-2 text-white bg-white/5 px-3 py-1.5 rounded-sm border border-white/5 text-[11px] font-mono">
                      <ShieldCheck className="w-3 h-3 text-white" /> Auth Valid
                    </div>
                  </div>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/audio' })} className="px-4 py-2 glass-mid hover:bg-white hover:text-black text-white text-[10px] font-mono uppercase tracking-widest rounded-sm border border-white/10 transition-all flex items-center gap-2 z-10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>

              {/* Billing & Usage Section */}
              <div className="glass-dark border border-white/10 rounded-xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <h3 className="text-xs font-mono uppercase tracking-widest text-white mb-6 flex items-center gap-2 ">
                  <CreditCard className="w-4 h-4 text-white" /> Subscription & Billing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Plan Card */}
                  <div className="bg-black/60 border border-white/5 rounded-xl p-5 flex flex-col justify-between group/plan transition-all hover:border-white/20">
                    <div>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">Current Plan</p>
                      <div className="flex items-center gap-3 mb-6">
                        <span className={cn("text-xl font-mono font-bold uppercase tracking-widest", userState.tier !== 'FREE' ? 'text-white ' : 'text-zinc-500')}>
                          {userState.tier}
                        </span>
                        {userState.tier !== 'FREE' && <span className="bg-white text-black text-black text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-none shadow-[0_0_10px_rgba(255,255,255,0.2)]">ACTIVE</span>}
                      </div>
                    </div>
                    {userState.tier === 'FREE' ? (
                      <button onClick={() => setShowPlanModal(true)} className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-black text-xs font-mono uppercase tracking-widest rounded-sm transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                        Upgrade Plan
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {userState.cancelAtPeriodEnd ? (
                          <div className="w-full py-2 bg-red-500/10 text-red-400 text-xs font-mono tracking-widest rounded-sm border border-red-500/20 text-center flex items-center justify-center gap-2">
                            <AlertTriangle className="w-3 h-3" /> Cancels at Period End
                          </div>
                        ) : (
                          <>
                            <button onClick={() => setShowPlanModal(true)} className="w-full py-2 glass-mid hover:bg-white/20 text-white text-xs font-mono tracking-widest rounded-sm transition-colors border border-white/10">Change Plan</button>
                            <button onClick={handleCancelSubscription} disabled={isCanceling} className="w-full py-2 bg-transparent hover:bg-red-500/10 text-red-500 hover:text-red-400 text-xs font-mono tracking-widest rounded-sm transition-colors border border-red-500/50 hover:border-red-500/20 flex items-center justify-center gap-2">
                              {isCanceling ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />} Cancel Subscription
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Usage Card */}
                  <div className="bg-black/60 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-4">Usage this month</p>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-2xl font-mono text-white tracking-tighter ">
                        {userState.usage.toLocaleString()} <span className="text-[10px] text-zinc-500 uppercase tracking-widest">pulse</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Limit: {userState.limit.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full mb-4 overflow-hidden border border-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((userState.usage / (userState.limit === Infinity ? 100 : userState.limit)) * 100, 100)}%` }} transition={{ duration: 1, ease: "easeOut" }} className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", isLimitReached ? "bg-red-500" : "bg-white text-black")} />
                    </div>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Resets at the start of next billing cycle.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : activeTab === 'clone' && userState.tier === 'FREE' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
            <div className="glass-dark border border-white/10 rounded-2xl p-10 max-w-lg w-full text-center shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Crown className="w-48 h-48 text-white rotate-12" />
              </div>
              <div className="w-20 h-20 glass border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] relative z-10 group-hover:scale-110 transition-transform">
                <Lock className="w-10 h-10 text-white " />
              </div>
              <h2 className="text-2xl font-mono font-bold tracking-widest uppercase text-white mb-4 relative z-10 ">Voice Cloning Locked</h2>
              <p className="text-sm font-mono text-zinc-400 uppercase leading-relaxed mb-8 relative z-10">
                Custom voice creation is a high-compute feature reserved for Basic, Premium, and Pro tiers. Upgrade your access level to unlock this module.
              </p>
              <button
                onClick={() => setShowPlanModal(true)}
                className="px-8 py-4 bg-white text-black font-bold font-mono text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-white text-black transition-all shadow-lg relative z-10 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Upgrade Access Level
              </button>
            </div>
          </div>
        ) : (
          <WorkspacePanel
            activeTab={activeTab} session={session}
            userState={userState} setUserState={setUserState}
            textInput={textInput} setTextInput={setTextInput}
            file={file} setFile={setFile}
            selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice}
            result={result} setResult={setResult}
            onShowPlanModal={() => setShowPlanModal(true)}
          />
        )}
      </main>

      {/* --- POLAR MODALS --- */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center md:p-4" onClick={() => setShowPlanModal(false)}>
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="glass border-y md:border border-white/10 md:rounded-xl max-w-5xl w-full h-[100dvh] md:h-auto md:max-h-[90vh] overflow-auto shadow-[0_0_50px_rgba(0,0,0,1)] custom-scrollbar relative">
              <div className="px-4 md:px-6 pt-4 md:pt-5 pb-3 md:pb-4 flex items-center justify-between border-b border-white/10 sticky top-0 z-20">
                <div>
                  <h2 className="text-base md:text-lg font-mono uppercase tracking-widest text-white ">System Upgrade</h2>
                  <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">Select new capability matrix</p>
                </div>
                <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-white/10 text-zinc-500 hover:text-white rounded-sm transition-all">
                  <X className="w-4 md:w-5 h-4 md:h-5" />
                </button>
              </div>

              <div className="flex justify-center my-6 relative z-10">
                <div className="bg-black/50 border border-white/10 p-1 rounded-lg flex gap-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={cn("px-6 py-2 text-xs font-mono uppercase tracking-widest rounded-md transition-all", billingCycle === 'monthly' ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-zinc-500 hover:text-white")}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={cn("px-6 py-2 text-xs font-mono uppercase tracking-widest rounded-md transition-all relative", billingCycle === 'yearly' ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "text-zinc-500 hover:text-white")}
                  >
                    Yearly
                    <span className="absolute -top-3 -right-3 bg-white text-black text-black text-[8px] font-bold px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(255,255,255,0.2)]">SAVE 16%</span>
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 pb-20 md:pb-10 relative z-10 pt-0">
                {PLANS.map((plan) => {
                  const isCurrent = userState.tier === plan.id;
                  const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                  const period = billingCycle === 'monthly' ? '/mo' : '/yr';

                  return (
                    <div key={plan.id} className={cn("rounded-xl border p-4 md:p-5 transition-all flex flex-col relative group", isCurrent ? "border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]" : "border-white/10 hover:border-white/20")}>
                      {plan.popular && <div className="text-[9px] font-mono uppercase tracking-widest text-black bg-white text-black inline-block px-2 py-0.5 mb-2 md:mb-3 self-start shadow-[0_0_10px_rgba(255,255,255,0.2)]">RECOMMENDED</div>}
                      <div className="text-xs md:text-sm font-mono uppercase tracking-widest text-white mb-1">{plan.name}</div>
                      <div className="flex items-baseline gap-1 mb-3 md:mb-4">
                        <span className="text-xl md:text-3xl font-mono font-bold text-white">${price}</span>
                        <span className="text-[9px] md:text-[10px] font-mono uppercase text-zinc-500">{period}</span>
                      </div>
                      <p className="text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-4 md:mb-6">{plan.desc}</p>
                      <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-1">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-[9px] md:text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                            <Check className="w-3 h-3 text-white shrink-0 mt-0.5" /> <span className="group-hover:text-zinc-200 transition-colors">{f}</span>
                          </li>
                        ))}
                      </ul>
                      <button onClick={() => { setShowPlanModal(false); if (plan.id !== 'FREE') { setCheckoutPlanContext(plan.id); setShowCheckoutModal(true); setCheckoutTermsAgreed(false); setCheckoutTermsConfirmed(false); } }} disabled={isCurrent} className={cn("w-full py-2.5 font-mono text-[9px] uppercase font-bold rounded-lg transition-all", isCurrent ? "glass text-zinc-600 cursor-not-allowed border-white/5" : "bg-white text-black hover:bg-zinc-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]")}>
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
        {showCheckoutModal && checkoutPlanContext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[150] flex items-center justify-center p-4 md:p-6"
          >
            {/* Box Container */}
            <div className="glass-dark border border-white/10 w-full max-w-5xl rounded-xl relative flex flex-col md:flex-row overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]">

              {/* Close button */}
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white z-20 bg-black/50 md:bg-transparent p-1.5 rounded-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* --- LEFT: Plan Information --- */}
              <div className="w-full md:w-1/3 glass p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                {PLANS.filter(p => p.id === checkoutPlanContext).map(selectedPlan => {
                  const price = billingCycle === 'monthly' ? selectedPlan.priceMonthly : selectedPlan.priceYearly;
                  const period = billingCycle === 'monthly' ? '/mo' : '/yr';
                  return (
                    <div key={selectedPlan.id} className="h-full flex flex-col">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
                        Selected Tier
                      </span>
                      <h3 className="text-2xl font-mono font-bold uppercase tracking-widest text-white mb-4">
                        {selectedPlan.name}
                      </h3>

                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-mono font-bold text-white">
                          ${price}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-zinc-500">
                          {period}
                        </span>
                      </div>

                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-8 leading-relaxed">
                        {selectedPlan.desc}
                      </p>

                      <div className="flex-1 relative z-10">
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Included capabilities:</p>
                        <ul className="space-y-4">
                          {selectedPlan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                              <Check className="w-4 h-4 text-white shrink-0 " />
                              <span className="mt-0.5">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2 text-zinc-600">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[9px] font-mono uppercase tracking-widest">Secure checkout via Polar.sh</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* --- RIGHT: Checkout form --- */}
              <div className="w-full md:w-2/3 bg-black/40 relative min-h-[500px] flex flex-col items-center justify-center p-6 md:p-10">                {!checkoutTermsConfirmed ? (
                <div className="flex flex-col items-center justify-center h-full max-w-sm text-center mx-auto space-y-6">
                  <div className="p-4 glass rounded-full border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                    <Lock className="w-8 h-8 text-zinc-500" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-mono uppercase tracking-widest mb-2">Terms & Privacy</h3>
                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                      Please review and agree to our Terms of Use and Privacy Policy to proceed with the secure checkout process.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group bg-white/5 hover:bg-white/10 p-4 border border-white/10 rounded-sm transition-colors text-left w-full mt-4">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-4 h-4 border border-white/20 rounded-sm bg-black checked:bg-white checked:border-white transition-colors"
                        checked={checkoutTermsAgreed}
                        onChange={(e) => setCheckoutTermsAgreed(e.target.checked)}
                      />
                      <Check className="w-3 h-3 text-black absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 tracking-wider">
                      I have read and agree to the{' '}
                      <Link href="/terms-of-use" target="_blank" className="text-white hover:underline hover:text-white" onClick={e => e.stopPropagation()}>Terms of Use</Link>
                      {' '}and{' '}
                      <Link href="/privacy-policy" target="_blank" className="text-white hover:underline hover:text-white" onClick={e => e.stopPropagation()}>Privacy Policy</Link>.
                    </div>
                  </label>

                  <button
                    disabled={!checkoutTermsAgreed}
                    onClick={() => setCheckoutTermsConfirmed(true)}
                    className={cn(
                      "w-full py-3 md:py-4 font-mono text-[10px] md:text-xs uppercase font-bold tracking-widest rounded-lg transition-all duration-300 mt-2",
                      checkoutTermsAgreed
                        ? "bg-white text-black hover:bg-white text-black border border-transparent shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        : "glass text-zinc-500 border border-white/10 cursor-not-allowed"
                    )}
                  >
                    Agree & Continue
                  </button>
                </div>
              ) : !isRedirecting ? (
                <div className="flex flex-col items-center justify-center h-full max-w-sm text-center mx-auto space-y-8">
                  <div className="p-4 glass-mid rounded-full border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-mono uppercase tracking-widest mb-2 ">Checkout Options</h3>
                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                      Select your preferred payment method to initialize the secure session.
                    </p>
                  </div>

                  <div className="w-full space-y-4">
                    {/* Option 1: Card / PayPal */}
                    <button
                      onClick={() => setIsRedirecting(true)}
                      className="w-full py-4 bg-white text-black hover:bg-white text-black font-mono text-xs uppercase font-bold tracking-widest rounded-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 group"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay with Card / Apple / Google / PayPal
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                    </button>

                    {/* Option 2: Crypto */}
                    <button
                      onClick={() => setIsRedirecting(true)}
                      className="w-full py-3 bg-black/40 border border-white/10 text-zinc-400 hover:text-white hover:border-white/40 font-mono text-[10px] uppercase tracking-[0.2em] rounded-lg transition-all flex items-center justify-center gap-3 group"
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                      Pay with Crypto & Blockchains
                    </button>
                  </div>

                  <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
                    Secure processing via Polar.sh (Merchant of Record)
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full max-w-sm text-center mx-auto space-y-6">
                  <div className="p-4 glass-mid rounded-full border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-mono uppercase tracking-widest mb-2 ">Redirecting to Checkout</h3>
                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                      Preparing your secure payment session via Polar.sh. Please do not close this window.
                    </p>
                  </div>
                </div>
              )}

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center">
            <div className="bg-black border border-white/20 p-8 text-center max-w-sm">
              <CheckCircle2 className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-xl font-mono text-white">Payment successful</h2>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  window.history.replaceState(null, '', window.location.pathname);
                  router.replace('/audio', { scroll: false });
                }}
                className="mt-8 bg-white text-black px-6 py-2 rounded-xl font-mono uppercase text-[11px] font-bold"
              >
                Return Dashboard
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Terms & Privacy Modal */}
      <AnimatePresence>
        {showGlobalTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-[300] flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="glass border border-white/10 w-full max-w-lg rounded-xl relative shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden"
            >
              <div className="p-8 md:p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6">
                  <Scale className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-mono uppercase tracking-widest text-white mb-4 ">
                  Terms & Privacy
                </h2>

                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 leading-relaxed mb-8">
                  Welcome to VoiceLab AI. Before you can access the dashboard, you must read and agree to our operational guidelines and privacy protocols.
                </p>

                <div className="w-full space-y-4 mb-8">
                  <Link href="/terms-of-use" target="_blank" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-colors group">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">Terms of Use</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                  </Link>

                  <Link href="/privacy-policy" target="_blank" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm transition-colors group">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">Privacy Policy</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                  </Link>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group text-left w-full mb-8">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      className="peer appearance-none w-5 h-5 border border-white/20 rounded-sm bg-black checked:bg-white checked:border-white transition-colors cursor-pointer"
                      checked={hasAgreedGlobalTerms}
                      onChange={(e) => setHasAgreedGlobalTerms(e.target.checked)}
                    />
                    <Check className="w-3.5 h-3.5 text-black absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 tracking-wider">
                    I acknowledge that I have read, understood, and agree to be bound by the Terms of Use and Privacy Policy.
                  </div>
                </label>

                <button
                  disabled={!hasAgreedGlobalTerms}
                  onClick={() => {
                    localStorage.setItem('voicelab_agreed_to_terms', 'true');
                    setShowGlobalTermsModal(false);
                  }}
                  className={cn(
                    "w-full py-4 font-mono text-xs uppercase font-bold tracking-widest rounded-lg transition-all duration-300",
                    hasAgreedGlobalTerms
                      ? "bg-white text-black hover:bg-white text-black border border-transparent shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                      : "glass text-zinc-500 border border-white/10 cursor-not-allowed"
                  )}
                >
                  Confirm & Proceed
                </button>
              </div>
            </motion.div>
          </motion.div>
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
