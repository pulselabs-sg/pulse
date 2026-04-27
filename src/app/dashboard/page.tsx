'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';
import {
  Zap, Mic, UploadCloud, Wand2, Type, Loader2, Download, AudioLines,
  Settings2, CheckCircle2, Menu, X, ChevronRight, Crown, LogIn,
  User, LogOut, Check, CreditCard, Sparkles, Mail, AlertTriangle, ShieldCheck,
  Terminal, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { useSearchParams } from 'next/navigation';

type Tab = 'tts' | 'stt' | 'clean' | 'changer' | 'profile';
type Tier = 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';

const VOICES = [
  { id: 'eve', name: 'Eve', gender: 'Female', tone: 'Energetic & Upbeat', desc: 'Default – lively and enthusiastic' },
  { id: 'ara', name: 'Ara', gender: 'Female', tone: 'Warm & Friendly', desc: 'Balanced and conversational' },
  { id: 'rex', name: 'Rex', gender: 'Male', tone: 'Confident & Clear', desc: 'Professional, ideal for business' },
  { id: 'sal', name: 'Sal', gender: 'Neutral', tone: 'Smooth & Versatile', desc: 'Great for any context' },
  { id: 'leo', name: 'Leo', gender: 'Male', tone: 'Authoritative & Strong', desc: 'Commanding for instructions' },
  { id: 'una', name: 'Una', gender: 'Female', tone: 'Gentle & Natural', desc: 'New voice – calm and expressive' },
];

const TIER_LIMITS = {
  FREE: { generations: 5, maxFileMB: 50, maxChars: 5000 },
  BASIC: { generations: 20, maxFileMB: 300, maxChars: 10000 },
  PREMIUM: { generations: 100, maxFileMB: 500, maxChars: 15000 },
  PRO: { generations: 300, maxFileMB: 50, maxChars: 5000 },
} as const;

const PLANS = [
  { id: 'FREE' as Tier, name: 'Free', price: 0, period: '/mo', desc: 'Test the engine', features: ['5 generations/month', '50 MB files', '5,000 characters TTS'], popular: false },
  { id: 'BASIC' as Tier, name: 'Basic', price: 5.00, period: '/mo', desc: 'For regular creators', features: ['20 generations/month', '300 MB files', '10,000 characters TTS', 'Commercial license'], popular: true },
  { id: 'PREMIUM' as Tier, name: 'Premium', price: 10.00, period: '/mo', desc: 'For serious creators', features: ['100 generations/month', '500 MB files', '15,000 characters TTS', 'Priority support'], popular: false },
  { id: 'PRO' as Tier, name: 'Pro', price: 50.00, period: '/mo', desc: 'High-volume production', features: ['300 generations/month', '50 MB files', '5,000 characters TTS', 'Enterprise ready'], popular: false },
] as const;

function DashboardContent() {
  const { data: session, status, update } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('tts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [showVoiceList, setShowVoiceList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [result, setResult] = useState<{ type: 'text' | 'audio'; content: string } | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [userState, setUserState] = useState({
    tier: 'FREE' as Tier,
    usage: 0,
    limit: 5,
    maxFileMB: 50,
    maxChars: 5000,
  });

  const [paddle, setPaddle] = useState<Paddle>();
  const searchParams = useSearchParams();
  const successParam = searchParams.get('success');

  const tierConfig = TIER_LIMITS[userState.tier];

  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      const tier = (user.tier || 'FREE') as Tier;
      setUserState({
        tier,
        usage: user.usageCount || 0,
        limit: tier === 'PREMIUM' || tier === 'PRO' ? Infinity : TIER_LIMITS[tier].generations,
        maxFileMB: TIER_LIMITS[tier].maxFileMB,
        maxChars: TIER_LIMITS[tier].maxChars,
      });
    }
  }, [session]);

  // Paddle initialization (giữ nguyên)
  useEffect(() => {
    initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
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

  useEffect(() => {
    if (successParam === 'true') {
      setShowPlanModal(false);
      setShowSuccessModal(true);
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      update().catch(console.error);
    }
  }, [successParam, update]);

  const isLimitReached = userState.tier !== 'PREMIUM' && userState.tier !== 'PRO' && userState.usage >= userState.limit;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, []);

  const selectedVoiceObj = VOICES.find(v => v.id === selectedVoice) || VOICES[0];

  const VoiceSelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowVoiceList(!showVoiceList)}
        className="w-full flex items-center justify-between p-4 bg-[#050505] border border-white/10 hover:border-white/30 rounded-sm text-left transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-sm flex items-center justify-center text-xs font-mono font-bold">
            {selectedVoiceObj.name[0]}
          </div>
          <div>
            <div className="font-mono font-bold text-white">{selectedVoiceObj.name}</div>
            <div className="text-[10px] text-zinc-400">{selectedVoiceObj.gender} • {selectedVoiceObj.tone}</div>
          </div>
        </div>
        <ChevronDown className={cn("w-4 h-4 transition-transform", showVoiceList && "rotate-180")} />
      </button>

      <AnimatePresence>
        {showVoiceList && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full bg-[#050505] border border-white/10 rounded-sm shadow-2xl max-h-80 overflow-auto py-1"
          >
            {VOICES.map((voice) => (
              <button
                key={voice.id}
                onClick={() => { setSelectedVoice(voice.id); setShowVoiceList(false); }}
                className={cn(
                  "w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 text-left transition-colors",
                  selectedVoice === voice.id && "bg-emerald-400/10"
                )}
              >
                <div className="flex-1">
                  <div className="font-mono font-bold">{voice.name}</div>
                  <div className="text-[10px] text-zinc-400">{voice.gender} • {voice.tone}</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5">{voice.desc}</div>
                </div>
                {selectedVoice === voice.id && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'] },
    maxFiles: 1,
    maxSize: tierConfig.maxFileMB * 1024 * 1024,
  });

  const handleProcess = async () => {
    if (!session?.user?.id) {
      alert("Unauthorized");
      return;
    }
    if (isLimitReached) {
      alert("Quota exceeded. Please upgrade your plan.");
      return;
    }

    // Kiểm tra giới hạn text TTS dựa vào gói của user
    if (activeTab === 'tts' && textInput.length > userState.maxChars) {
      alert(`Text too long! Maximum ${userState.maxChars} characters allowed.`);
      return;
    }

    // Kiểm tra file size cho STT và Voice Changer (đổi maxFileMB sang Bytes để so sánh)
    if ((activeTab === 'stt' || activeTab === 'changer') && file && file.size > userState.maxFileMB * 1024 * 1024) {
      alert(`File too large. Maximum ${userState.maxFileMB} MB allowed.`);
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    let endpoint = '';

    if (activeTab === 'tts') {
      endpoint = 'text-to-speech';
      formData.append('text', textInput);
      formData.append('voiceId', selectedVoice);
    } else if (activeTab === 'stt') {
      endpoint = 'speech-to-text';
      if (file) formData.append('file', file);
    } else if (activeTab === 'changer') {
      endpoint = 'voice-changer';
      if (file) formData.append('file', file);
      formData.append('targetVoice', selectedVoice);
    } else {
      alert("This module is currently offline.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'API error');
      }

      const newUsage = parseInt(res.headers.get('X-User-Usage') || String(userState.usage + 1));
      setUserState((prev) => ({ ...prev, usage: newUsage }));

      if (activeTab === 'stt') {
        const data = await res.json();
        setResult({ type: 'text', content: data.text });
      } else {
        const audioBlob = await res.blob();
        const url = URL.createObjectURL(audioBlob);
        setResult({ type: 'audio', content: url });
      }
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (plan: Tier) => {
    if (!paddle || !session?.user || plan === 'FREE') return;

    const priceMap: Record<Tier, string> = {
      BASIC: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_BASIC!,
      PREMIUM: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PREMIUM!,
      PRO: process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_PRO!, // ← Thêm env var này
      FREE: '',
    };

    const priceId = priceMap[plan];
    if (!priceId) return;

    const checkoutConfig: any = {
      items: [{ priceId, quantity: 1 }],
      customData: { userId: String((session.user as any).id), plan },
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        successUrl: `${window.location.origin}/dashboard?success=true`,
      },
    };

    paddle.Checkout.open(checkoutConfig);
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will keep access until the end of the current billing cycle.")) {
      return;
    }

    setIsCanceling(true);
    try {
      const res = await fetch('/api/paddle/cancel', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Cancellation failed");

      alert("Subscription has been scheduled for cancellation.");
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsCanceling(false);
    }
  };

  const tabs = [
    { id: 'tts', label: 'Text to Speech', icon: Wand2, desc: 'Convert text to natural voice' },
    { id: 'stt', label: 'Speech to Text', icon: Type, desc: 'Transcribe audio to text' },
    { id: 'changer', label: 'Voice Changer', icon: AudioLines, desc: 'Transform voice style' },
    { id: 'clean', label: 'Audio Cleaner', icon: Mic, desc: 'Remove noise & enhance' },
    { id: 'profile', label: 'Profile', icon: User, desc: 'Account & Billing' },
  ] as const;

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Booting System...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-sm p-8 max-w-sm w-full mx-4 text-center relative z-10 shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-sm flex items-center justify-center">
            <Terminal className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-xl font-mono text-white mb-2 uppercase tracking-tight">VoiceLab OS</h2>
          <p className="text-xs font-mono text-zinc-500 mb-8 uppercase tracking-wider">Sign in to access AI voice engine</p>
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="w-full h-12 bg-white text-black font-mono font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all text-xs"
          >
            <LogIn className="w-4 h-4" /> Sign in with Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-zinc-300 font-sans overflow-hidden selection:bg-white/20">
      {/* ==================== SIDEBAR ==================== */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 260 : 70 }}
        className="bg-[#050505] border-r border-white/5 flex flex-col relative z-20 shrink-0 transition-all duration-300"
      >
        <div className="h-14 flex items-center border-b border-white/5 px-4">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center text-black font-bold text-[10px]">V</div>
              <span className="font-mono text-xs text-white uppercase tracking-widest">VoiceLab OS</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-white/10 text-zinc-500 hover:text-white rounded-sm ml-auto transition-colors"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
          {isSidebarOpen && (
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2 px-2">AI Modules</p>
          )}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResult(null);
              }}
              className={cn(
                "group relative flex items-center gap-3 p-2.5 rounded-sm text-xs transition-all",
                activeTab === tab.id ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                tab.id === 'profile' && "mt-auto border-t border-white/5 pt-3"
              )}
            >
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

        {/* User Mini Panel */}
        {isSidebarOpen ? (
          <div
            className="p-3 mx-2 mb-3 bg-black border border-white/10 rounded-sm cursor-pointer hover:border-white/30 transition-all group"
            onClick={() => setActiveTab('profile')}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-mono uppercase tracking-widest flex items-center gap-1.5 text-zinc-400 group-hover:text-white transition-colors">
                <Crown className={cn("w-3 h-3", userState.tier === 'FREE' ? "text-zinc-600" : "text-emerald-400")} />
                {userState.tier}
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                {userState.usage} / {userState.limit === Infinity ? '∞' : userState.limit}
              </span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-none mb-3 overflow-hidden">
              <motion.div
                animate={{ width: `${Math.min((userState.usage / (userState.limit === Infinity ? 100 : userState.limit)) * 100, 100)}%` }}
                className={cn("h-full", isLimitReached ? "bg-red-500" : "bg-emerald-400")}
              />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlanModal(true);
              }}
              className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-mono uppercase tracking-widest rounded-sm border border-white/10 flex items-center justify-center gap-2 transition-all"
            >
              <CreditCard className="w-3 h-3" /> Manage Plan
            </button>
          </div>
        ) : (
          <div className="p-3 flex justify-center border-t border-white/5 mt-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className="w-8 h-8 rounded-sm bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10"
            >
              {session.user.image ? (
                <img src={session.user.image} alt="" className="w-full h-full rounded-sm opacity-80 hover:opacity-100 transition-opacity" />
              ) : (
                <User className="w-4 h-4 text-zinc-500" />
              )}
            </button>
          </div>
        )}
      </motion.aside>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-[url('/noise.png')] bg-repeat opacity-95">
        <header className="h-14 border-b border-white/5 bg-black/80 backdrop-blur-md flex items-center px-6 justify-between z-10">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-600">
            <span>Root</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{tabs.find((t) => t.id === activeTab)?.label}</span>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto flex flex-col xl:flex-row gap-6">
          {/* PROFILE VIEW */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl mx-auto space-y-6">
              <h2 className="text-lg font-mono uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-zinc-500" /> Account Settings
              </h2>

              {/* User Identity Card */}
              <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
                <img
                  src={session.user.image || ''}
                  alt="Avatar"
                  className="w-24 h-24 rounded-sm object-cover border border-white/20 z-10 grayscale hover:grayscale-0 transition-all duration-500"
                />
                <div className="flex-1 space-y-3 text-center md:text-left z-10">
                  <div>
                    <h3 className="text-xl font-mono uppercase tracking-widest text-white">{session.user.name}</h3>
                    <p className="text-zinc-500 font-mono text-[10px] uppercase mt-1">UID: {(session.user as any).id}</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-3 items-center md:items-start">
                    <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1.5 rounded-sm border border-white/5 text-[11px] font-mono uppercase">
                      <Mail className="w-3 h-3 text-white" /> {session.user.email}
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 bg-white/5 px-3 py-1.5 rounded-sm border border-white/5 text-[11px] font-mono uppercase">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Auth Valid
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-mono uppercase tracking-widest rounded-sm border border-white/10 transition-colors flex items-center gap-2 z-10"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>

              {/* Billing & Subscription Card */}
              <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-6">
                <h3 className="text-sm font-mono uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-zinc-500" /> Subscription & Billing
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Plan */}
                  <div className="bg-[#050505] border border-white/5 rounded-sm p-5 flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-1">Current Plan</p>
                      <div className="flex items-center gap-3 mb-6">
                        <span className={cn("text-xl font-mono font-bold uppercase tracking-widest", userState.tier !== 'FREE' ? 'text-emerald-400' : 'text-zinc-500')}>
                          {userState.tier}
                        </span>
                        {userState.tier !== 'FREE' && (
                          <span className="bg-emerald-400 text-black text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-none">ACTIVE</span>
                        )}
                      </div>
                    </div>

                    {userState.tier === 'FREE' ? (
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-xs font-mono uppercase tracking-widest rounded-sm transition-colors"
                      >
                        Upgrade Plan
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowPlanModal(true)}
                          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-widest rounded-sm transition-colors border border-white/10"
                        >
                          Change Plan
                        </button>
                        <button
                          onClick={handleCancelSubscription}
                          disabled={isCanceling}
                          className="w-full py-2 bg-transparent hover:bg-red-500/10 text-zinc-500 hover:text-red-400 text-xs font-mono uppercase tracking-widest rounded-sm transition-colors border border-transparent hover:border-red-500/20 flex items-center justify-center gap-2"
                        >
                          {isCanceling ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-3 h-3" />}
                          Cancel Subscription
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Usage Stats */}
                  <div className="bg-[#050505] border border-white/5 rounded-sm p-5">
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-4">Usage this month</p>
                    <div className="flex justify-between items-end mb-3">
                      <span className="text-2xl font-mono text-white tracking-tighter">
                        {userState.usage} <span className="text-[10px] text-zinc-600 uppercase tracking-widest">uses</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                        Limit: {userState.limit === Infinity ? 'Unlimited' : userState.limit}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 rounded-none mb-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((userState.usage / (userState.limit === Infinity ? 100 : userState.limit)) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full", isLimitReached ? "bg-red-500" : "bg-emerald-400")}
                      />
                    </div>
                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Resets at the start of next billing cycle.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ENGINE MODULES VIEW */}
          {activeTab !== 'profile' && (
            <>
              {/* INPUT AREA */}
              <div className="flex-1 xl:max-w-xl flex flex-col gap-4">
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-5 relative z-10 flex flex-col h-full">
                  <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
                    <Settings2 className="w-4 h-4 text-white" /> Input Parameters
                  </h2>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-5 flex-1 flex flex-col"
                    >
                      {/* TTS Input */}
                      {activeTab === 'tts' && (
                        <>
                          <div className="flex justify-between text-[9px] uppercase font-mono text-zinc-500 tracking-widest">
                            <span>Text Input</span>
                            <span className={textInput.length > userState.maxChars ? "text-red-400" : ""}>
                              {textInput.length} / {userState.maxChars}
                            </span>
                          </div>
                          <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Type or paste your text here..."
                            className="flex-1 w-full min-h-[160px] bg-[#050505] border border-white/10 rounded-sm p-4 text-zinc-300 text-sm font-mono focus:border-white/40 focus:bg-white/5 transition-all resize-none outline-none"
                          />
                        </>
                      )}

                      {/* STT / Changer / Clean Input */}
                      {(activeTab === 'stt' || activeTab === 'changer' || activeTab === 'clean') && (
                        <div
                          {...getRootProps()}
                          className={cn(
                            "border border-dashed rounded-sm p-10 text-center cursor-pointer transition-all flex-1 flex flex-col items-center justify-center",
                            isDragActive ? "border-emerald-400 bg-emerald-400/5" : "border-white/20 hover:border-white/40 bg-[#050505]"
                          )}
                        >
                          <input {...getInputProps()} />
                          {file ? (
                            <div className="flex flex-col items-center">
                              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
                              <p className="text-white font-mono text-xs uppercase tracking-wider">{file.name}</p>
                              <p className="text-[10px] text-zinc-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <UploadCloud className="w-6 h-6 text-zinc-500 mb-3" />
                              <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Drop audio file here</p>
                              <p className="text-[9px] text-zinc-600">Max {userState.maxFileMB} MB</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Voice Selection (TTS & Changer) */}
                      {(activeTab === 'tts' || activeTab === 'changer') && (
                        <div className="space-y-3">
                          <span className="text-[9px] uppercase font-mono text-zinc-500 tracking-widest block">Choose Voice</span>
                          <VoiceSelector />
                        </div>
                      )}

                      {/* Process Button */}
                      <button
                        onClick={handleProcess}
                        disabled={loading || isLimitReached || (activeTab === 'tts' ? !textInput.trim() : !file)}
                        className={cn(
                          "w-full h-12 mt-auto font-mono text-xs font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 transition-all",
                          isLimitReached
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
                        )}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                          </>
                        ) : isLimitReached ? (
                          <>Quota Exceeded</>
                        ) : (
                          <>
                            <Zap className="w-3 h-3" /> Generate Now
                          </>
                        )}
                      </button>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* OUTPUT AREA */}
              <div className="flex-1 bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm flex flex-col relative overflow-hidden z-10">
                <div className="h-10 border-b border-white/10 flex items-center px-4 bg-black">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Output</span>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[#050505]">
                  {!result && !loading && (
                    <div className="text-center text-zinc-700 font-mono text-xs uppercase tracking-widest">Waiting for output...</div>
                  )}

                  {loading && (
                    <div className="flex flex-col items-center text-white">
                      <div className="relative w-16 h-16 mb-6">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border border-dashed border-white/30 rounded-full"
                        />
                        <AudioLines className="w-6 h-6 animate-pulse mx-auto mt-5 text-zinc-400" />
                      </div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 animate-pulse">Generating...</p>
                    </div>
                  )}

                  {result?.type === 'text' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full bg-black p-5 rounded-sm border border-white/10 overflow-auto font-mono text-xs leading-relaxed text-zinc-300"
                    >
                      {result.content}
                    </motion.div>
                  )}

                  {result?.type === 'audio' && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md space-y-4">
                      <div className="p-4 bg-black border border-white/10 rounded-sm">
                        <audio controls src={result.content} className="w-full" />
                      </div>
                      <a
                        href={result.content}
                        download
                        className="block w-full text-center py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-[10px] font-mono uppercase tracking-widest text-white transition-all"
                      >
                        Download MP3
                      </a>
                    </motion.div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ==================== PLAN MODAL ==================== */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
            onClick={() => setShowPlanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#050505] border border-white/10 rounded-sm max-w-5xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            >
              <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-white/10 bg-black">
                <div>
                  <h2 className="text-lg font-mono uppercase tracking-widest text-white">System Upgrade</h2>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mt-1">Select new capability matrix</p>
                </div>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="p-2 hover:bg-white/10 text-zinc-500 hover:text-white rounded-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {PLANS.map((plan) => {
                  const isCurrent = userState.tier === plan.id;
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "rounded-sm border p-5 transition-all bg-black flex flex-col",
                        isCurrent ? "border-white bg-white/5" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      {plan.popular && (
                        <div className="text-[9px] font-mono uppercase tracking-widest text-black bg-white inline-block px-2 py-0.5 mb-3 self-start">
                          RECOMMENDED
                        </div>
                      )}
                      <div className="text-sm font-mono uppercase tracking-widest text-white mb-1">{plan.name}</div>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-mono font-bold text-white">${plan.price}</span>
                        <span className="text-[10px] font-mono uppercase text-zinc-500">{plan.period}</span>
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-6">{plan.desc}</p>

                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-300">
                            <Check className="w-3 h-3 text-white shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => {
                          setShowPlanModal(false);
                          if (plan.id !== 'FREE') {
                            handleUpgrade(plan.id as 'BASIC' | 'PREMIUM');
                          }
                        }}
                        disabled={isCurrent}
                        className={cn(
                          "w-full py-2.5 font-mono text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all border",
                          isCurrent
                            ? "bg-white/10 text-zinc-400 border-transparent cursor-not-allowed"
                            : "bg-white hover:bg-zinc-200 text-black border-transparent"
                        )}
                      >
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

      {/* ==================== SUCCESS MODAL ==================== */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#050505] border border-white/20 rounded-sm max-w-sm w-full relative overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

              <div className="p-8 text-center relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, delay: 0.1 }}
                  className="w-16 h-16 mx-auto rounded-none bg-white text-black flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>

                <h2 className="text-xl font-mono uppercase tracking-widest text-white mb-2">Patch Applied</h2>
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-8 leading-relaxed">
                  System updated to <span className="text-white">[{userState.tier}]</span>. New constraints are live.
                </p>

                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-mono text-[10px] uppercase tracking-widest font-bold rounded-sm transition-all flex items-center justify-center gap-2"
                >
                  Return to Terminal <Sparkles className="w-3 h-3" />
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
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Loading Dashboard...</span>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}