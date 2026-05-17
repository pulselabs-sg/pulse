import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { Zap, Mic, UploadCloud, CheckCircle2, ChevronDown, Check, Loader2, AudioLines, Copy, Settings2, Sparkles, Wand2, Play, Square, Edit2, Save, Trash2, AlertTriangle, Crown, Globe, ShieldCheck, X, Search, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { upload } from '@vercel/blob/client';
import { Tab, VOICES, Voice, formatSTTText, TRANSLATION_LANGUAGES } from '@/lib/dashboard-constants';
import { CustomAudioPlayer } from './CustomAudioPlayer';

// ── Processing stage definitions by tab ─────────────────────────────────────
const TAB_STAGES: Record<string, string[]> = {
    tts: ['Encoding Text', 'Synthesizing Voice', 'Rendering Audio', 'Finalizing Output'],
    stt: ['Uploading Audio', 'Decoding Signal', 'Transcribing', 'Formatting Text'],
    changer: ['Uploading Audio', 'Analyzing Voice', 'Transforming', 'Mastering Output'],
    clean: ['Uploading Audio', 'Denoising Signal', 'Deep Filtering', 'Enhancing Quality'],
    translate: ['Uploading Audio', 'Detecting Language', 'Translating', 'Synthesizing Voice'],
    clone: ['Uploading Sample', 'Mapping Neural Identity', 'Training Model', 'Saving Voice'],
};
const DEFAULT_STAGES = ['Uploading', 'Processing', 'Synthesizing', 'Finalizing'];

// ── Simulated progress hook ──────────────────────────────────────────────────
function useSimulatedProgress(active: boolean) {
    const [progress, setProgress] = useState(0);
    const [stageIdx, setStageIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const rafRef = useRef<number | undefined>(undefined);
    const startRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (!active) {
            setProgress(0);
            setStageIdx(0);
            setElapsed(0);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            return;
        }

        startRef.current = Date.now();

        const tick = () => {
            const now = Date.now();
            const sec = (now - startRef.current!) / 1000;
            setElapsed(Math.floor(sec));

            // Eased progression: fast at first, then slows near 90%
            // Never actually reaches 100% until request resolves
            const eased = 90 * (1 - Math.exp(-sec / 25));
            setProgress(Math.min(eased, 90));

            // Advance stage label every ~22% of the first 90%
            setStageIdx(Math.min(Math.floor(eased / 22.5), 3));

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [active]);

    return { progress, stageIdx, elapsed };
}

interface WorkspaceProps {
    activeTab: Tab;
    session: any;
    userState: any;
    setUserState: any;
    result: { type: 'text' | 'audio', content: string, blob?: Blob } | null;
    setResult: (v: any) => void;
    textInput: string;
    setTextInput: (v: string) => void;
    file: File | null;
    setFile: (v: File | null) => void;
    selectedVoice: string;
    setSelectedVoice: (v: string) => void;
    onShowPlanModal?: () => void;
}

export default function WorkspacePanel({ activeTab, session, userState, setUserState, result, setResult, textInput, setTextInput, file, setFile, selectedVoice, setSelectedVoice, onShowPlanModal }: WorkspaceProps) {
    const [loading, setLoading] = useState(false);
    const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav' | 'pcm' | 'ulaw'>('mp3');
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [voiceGenderFilter, setVoiceGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
    const [voiceCountryFilter, setVoiceCountryFilter] = useState<string>('All');
    const [voiceSearch, setVoiceSearch] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [customVoices, setCustomVoices] = useState<any[]>([]);
    const [editingVoiceId, setEditingVoiceId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    // ── Simulated progress (driven by rAF) ──────────────────────────────────
    const { progress, stageIdx, elapsed } = useSimulatedProgress(loading);
    const stages = TAB_STAGES[activeTab] || DEFAULT_STAGES;
    const [selectedLanguage, setSelectedLanguage] = useState(TRANSLATION_LANGUAGES[0].id);
    const [showLanguageList, setShowLanguageList] = useState(false);
    const languageMenuRef = useRef<HTMLDivElement>(null);

    const [showCustomVoiceModal, setShowCustomVoiceModal] = useState(false);
    const [pendingVoice, setPendingVoice] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleVoiceSelect = (voiceId: string) => {
        setSelectedVoice(voiceId);
        setShowVoiceModal(false);
    };

    // ── Validation State ──────────────────────────────────────────────────────
    const [fileError, setFileError] = useState<string | null>(null);
    const [durationError, setDurationError] = useState<string | null>(null);

    const handleRenameVoice = async (id: string) => {
        if (!editingName.trim()) {
            setEditingVoiceId(null);
            return;
        }
        try {
            const res = await fetch(`/api/custom-voices/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editingName })
            });
            if (res.ok) {
                const data = await res.json();
                setCustomVoices(prev => prev.map(v => v.id === id ? data.voice : v));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setEditingVoiceId(null);
        }
    };

    const handleDeleteVoice = async (id: string, voiceId: string) => {
        if (!confirm("Are you sure you want to delete this cloned voice?")) return;
        try {
            const res = await fetch(`/api/custom-voices/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCustomVoices(prev => prev.filter(v => v.id !== id));
                if (selectedVoice === voiceId) setSelectedVoice(VOICES[0].id);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Playback state
    const [playingVoice, setPlayingVoice] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const voiceMenuRef = useRef<HTMLDivElement>(null);

    const isLimitReached = userState.limit !== Infinity && userState.usage >= userState.limit;

    // Derived limit flags
    const isTextOverLimit = activeTab === 'tts' && textInput.length > userState.maxChars;
    const isFileInvalid = !!(fileError || durationError);
    const maxFileSizeBytes = userState.maxFileMB * 1024 * 1024;
    // Clone tab has a fixed 60s duration limit regardless of tier
    const maxAudioSeconds = activeTab === 'clone' ? 60 : userState.maxAudioMins * 60;

    // Clear file errors when tab changes or file is cleared
    useEffect(() => {
        setFileError(null);
        setDurationError(null);
    }, [activeTab, file]);

    useEffect(() => {
        const fetchVoices = async () => {
            try {
                const res = await fetch('/api/custom-voices');
                if (res.ok) {
                    const data = await res.json();
                    setCustomVoices(data.voices || []);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchVoices();
    }, [activeTab]);

    // Check audio duration after a file is accepted
    useEffect(() => {
        if (!file || !file.type.startsWith('audio/')) return;
        const url = URL.createObjectURL(file);
        const audio = new Audio();
        audio.onloadedmetadata = () => {
            if (audio.duration > maxAudioSeconds) {
                const maxLabel = activeTab === 'clone'
                    ? '60 seconds'
                    : `${userState.maxAudioMins} minute${userState.maxAudioMins !== 1 ? 's' : ''}`;
                setDurationError(
                    `Audio duration (${Math.round(audio.duration)}s) exceeds the ${maxLabel} limit for your plan.`
                );
            } else {
                setDurationError(null);
            }
            URL.revokeObjectURL(url);
        };
        audio.onerror = () => URL.revokeObjectURL(url);
        audio.src = url;
    }, [file, maxAudioSeconds, activeTab, userState.maxAudioMins]);

    const allVoices: Voice[] = [
        ...VOICES,
    ];

    // Derived lists for the modal filters
    const allCountries = useMemo(() => {
        const countries = Array.from(new Set(allVoices.map(v => v.country)));
        return ['All', ...countries.sort()];
    }, []);

    const filteredVoices = useMemo(() => {
        return allVoices.filter(v => {
            const matchGender = voiceGenderFilter === 'All' || v.gender === voiceGenderFilter;
            const matchCountry = voiceCountryFilter === 'All' || v.country === voiceCountryFilter;
            const matchSearch = voiceSearch === '' ||
                v.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
                v.language.toLowerCase().includes(voiceSearch.toLowerCase()) ||
                v.country.toLowerCase().includes(voiceSearch.toLowerCase()) ||
                v.tone.toLowerCase().includes(voiceSearch.toLowerCase());
            return matchGender && matchCountry && matchSearch;
        });
    }, [voiceGenderFilter, voiceCountryFilter, voiceSearch]);

    const selectedVoiceObj = allVoices.find(v => v.id === selectedVoice) || allVoices[0];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (languageMenuRef.current && !languageMenuRef.current.contains(e.target as Node)) setShowLanguageList(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (audioRef.current) audioRef.current.pause();
        };
    }, []);

    const togglePlay = (e: React.MouseEvent, voiceId: string) => {
        e.stopPropagation();
        if (playingVoice === voiceId) {
            audioRef.current?.pause();
            setPlayingVoice(null);
        } else {
            if (audioRef.current) audioRef.current.pause();
            const audio = new Audio(`/previews/${voiceId}.mp3`);
            audio.onended = () => setPlayingVoice(null);
            audio.onerror = () => {
                alert("Preview not available for this voice yet.");
                setPlayingVoice(null);
            };
            audio.play().catch(() => setPlayingVoice(null));
            audioRef.current = audio;
            setPlayingVoice(voiceId);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (accepted) => {
            if (accepted[0] && accepted[0].type.startsWith('audio/')) {
                setFileError(null);
                setFile(accepted[0]);
            }
        },
        onDropRejected: (rejectedFiles) => {
            const err = rejectedFiles[0]?.errors[0];
            if (err?.code === 'file-too-large') {
                setFileError(`File size exceeds the ${userState.maxFileMB} MB limit for your plan.`);
            } else if (err?.message) {
                setFileError(err.message);
            } else {
                setFileError('File rejected. Please upload a valid audio file within the size limit.');
            }
            setFile(null);
        },
        accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'] },
        maxFiles: 1,
        maxSize: maxFileSizeBytes,
    });

    const handleProcess = async () => {
        // All hard guards are now enforced via the disabled button, but keep
        // a safety net here in case someone bypasses the UI.
        if (!session?.user || isLimitReached || isTextOverLimit || isFileInvalid) return;
        const cleanText = textInput.trim();

        setLoading(true); setResult(null);
        let requestBody: any = activeTab === 'clean' ? {} : { format: outputFormat };
        const endpoint =
            activeTab === 'tts' ? 'text-to-speech' :
                activeTab === 'stt' ? 'speech-to-text' :
                    activeTab === 'translate' ? 'translate' :
                        activeTab === 'clone' ? 'clone-voice' :
                            activeTab === 'clean' ? 'clean-audio' :
                                'voice-changer';

        try {
            if (activeTab === 'tts') { requestBody.text = cleanText; requestBody.voiceId = selectedVoice; }
            else {
                if (!file) throw new Error("File missing");
                const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                const blob = await upload(safeName, file, { access: 'public', handleUploadUrl: '/api/upload' });
                requestBody.fileUrl = blob.url; requestBody.fileName = file.name;
                if (activeTab === 'changer') requestBody.targetVoice = selectedVoice;
                if (activeTab === 'translate') {
                    requestBody.targetLanguage = selectedLanguage;
                    requestBody.targetVoice = selectedVoice;
                }
            }

            const res = await fetch(`/api/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });

            if (!res.ok) throw new Error(await res.text());

            if (activeTab === 'clone') {
                const data = await res.json();
                setCustomVoices(prev => [data.voice, ...prev]);
                setSelectedVoice(data.voice.voiceId);
                alert("Voice cloned successfully! You can now use it in TTS and Voice Changer.");
                setFile(null);
            } else {
                setUserState((prev: any) => ({ ...prev, usage: parseInt(res.headers.get('X-User-Usage') || String(prev.usage + 1)) }));

                if (activeTab === 'stt') {
                    const data = await res.json(); setResult({ type: 'text', content: data.text });
                } else {
                    const audioBlob = await res.blob();
                    const url = URL.createObjectURL(audioBlob); setResult({ type: 'audio', content: url, blob: audioBlob });
                }
            }
        } catch (err: any) { alert(err.message); } finally { setLoading(false); }
    };

    const handleCopy = () => {
        if (result?.content) { navigator.clipboard.writeText(result.content); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }
    };

    const cycleFormat = () => {
        const formats: ('mp3' | 'wav' | 'pcm' | 'ulaw')[] = ['mp3', 'wav', 'pcm', 'ulaw'];
        setOutputFormat(prev => formats[(formats.indexOf(prev) + 1) % formats.length]);
    };

    const insertTag = (tag: string) => {
        setTextInput(textInput + tag);
    };

    return (
        <div className="flex-1 p-4 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 relative z-10 min-h-0 overflow-y-auto custom-scrollbar">
            <div className={cn("flex flex-col min-h-0 relative z-20", (activeTab === 'clone' || activeTab === 'tts') ? "flex-none lg:flex-1" : "flex-1 lg:max-w-2xl")}>
                <div className={cn("glass border border-white/10 rounded-2xl flex flex-col relative group shadow-[0_0_50px_rgba(0,0,0,0.3)]",
                    (activeTab === 'clone' || activeTab === 'tts') ? "h-auto lg:h-full p-4 md:p-8" : "h-full min-h-[300px] lg:min-h-0 p-4 md:p-8"
                )}>
                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none z-0">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Settings2 className="w-32 h-32 text-white rotate-12" />
                        </div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
                    </div>

                    <h2 className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-3 relative z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-pulse" />
                        <span className=" text-zinc-400">{activeTab === 'clone' ? 'Neural Identity Scanner' : 'Intelligence Input Matrix'}</span>
                    </h2>

                    <div className="flex-1 flex flex-col gap-6 relative z-10">
                        {activeTab === 'tts' && (
                            <div className="flex-1 flex flex-col group/textarea relative">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {['[laugh]', '[pause]', '[sigh]', '<whisper>', '<emphasis>', '<singing>'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => insertTag(tag.includes('<') ? `${tag} ${tag.replace('<', '</')}` : ` ${tag} `)}
                                            className="px-2 py-1 text-[8px] md:text-[10px] font-mono border border-white/10 hover:border-white hover:text-white bg-white/5 rounded-md transition-colors text-zinc-400"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Enter your script for neural synthesis. Use tags for expressive control..."
                                    className="flex-1 w-full min-h-[150px] bg-black/40 border border-white/5 rounded-xl p-5 text-white font-sans text-xs md:text-sm leading-relaxed resize-none outline-none focus:border-white/50 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-zinc-700 custom-scrollbar shadow-inner"
                                />
                                <div className="flex justify-between mt-2 px-1">
                                    <span className="text-[9px] font-mono uppercase text-zinc-600">Max Chars: {userState.maxChars.toLocaleString()}</span>
                                    <span className={cn("text-[9px] font-mono uppercase font-bold", isTextOverLimit ? "text-red-500" : "text-zinc-600")}>
                                        {textInput.length.toLocaleString()} / {userState.maxChars.toLocaleString()}
                                    </span>
                                </div>
                                <AnimatePresence>
                                    {isTextOverLimit && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
                                        >
                                            <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                                            <span className="text-[9px] font-mono text-red-400">
                                                Text exceeds the {userState.maxChars.toLocaleString()}-character limit for your plan ({textInput.length - userState.maxChars} over). Shorten your text or upgrade your plan.
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="mt-4 px-1 flex items-start gap-2 text-zinc-500">
                                    <p className="text-[10px] md:text-[12px] font-mono leading-relaxed tracking-tight">
                                        The <a href="/docs/guide" target="_blank" className="text-white hover:text-zinc-300 underline decoration-white/30 underline-offset-2 transition-colors">language</a> of the generated voice will be automatically detected based on the original language of the text or audio you provide.
                                    </p>
                                </div>
                            </div>
                        )}

                        {(activeTab === 'stt' || activeTab === 'changer' || activeTab === 'clean' || activeTab === 'clone' || activeTab === 'translate') && (
                            <>
                                <div {...getRootProps()} className={cn(
                                    "relative flex-1 min-h-[120px] max-h-[140px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden group/drop",
                                    isDragActive ? "border-white bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.1)]" : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/[0.02]"
                                )}>
                                    <input {...getInputProps()} />
                                    {file ? (
                                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10">
                                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2 border border-white/20">
                                                <CheckCircle2 className="w-7 h-7 text-white" />
                                            </div>
                                            <p className="text-sm font-bold text-white truncate max-w-[250px]">{file.name}</p>
                                            <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • READY</p>
                                        </motion.div>
                                    ) : (
                                        <div className="text-center z-10 transition-transform group-hover/drop:scale-101 duration-500">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-2 border border-white/5 group-hover/drop:border-white/30 transition-colors">
                                                <UploadCloud className="w-7 h-7 text-zinc-500 group-hover/drop:text-white transition-colors" />
                                            </div>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-widest">{activeTab === 'clone' ? 'Transmit Voice Sample (~1 min)' : 'Transmit Audio Signal'}</p>
                                            <p className="text-[9px] font-mono text-zinc-500 uppercase">MP3, WAV, M4A • MAX {activeTab === 'clone' ? '60 SECONDS' : `${userState.maxFileMB}MB`}</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover/drop:opacity-100 transition-opacity" />
                                </div>

                                <div className="px-1 flex items-start gap-2 text-zinc-500">
                                    <p className="text-[10px] md:text-[11px] font-mono leading-relaxed tracking-tight">
                                        The <a href="/docs/guide" target="_blank" className="text-white hover:text-zinc-300 underline decoration-white/30 underline-offset-2 transition-colors">language</a> of the generated voice will be automatically detected based on the original language of the text or audio you provide.
                                    </p>
                                </div>

                                {/* File / Duration error banners */}
                                <AnimatePresence>
                                    {(fileError || durationError) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2"
                                        >
                                            <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                                            <span className="text-[9px] font-mono text-red-400 leading-relaxed">
                                                {fileError || durationError}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}



                        <div className={cn("flex flex-row gap-2 md:gap-3 mt-auto pt-2", activeTab === 'clone' ? "mt-4" : "")}>
                            {(activeTab === 'tts' || activeTab === 'changer' || activeTab === 'translate') && (
                                <div className="flex-[2] md:flex-1 relative min-w-0">
                                    {/* Voice selector trigger button */}
                                    <button
                                        id="voice-selector-btn"
                                        onClick={() => {
                                            setShowVoiceModal(true);
                                            setVoiceSearch('');
                                            setVoiceGenderFilter('All');
                                            setVoiceCountryFilter('All');
                                        }}
                                        className="w-full flex items-center justify-between px-2 md:px-4 py-2 bg-black/40 border border-white/5 hover:border-white/30 rounded-xl text-left transition-all h-10 md:h-12 group/voice relative z-20 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="flex items-center gap-2 md:gap-3 overflow-hidden min-w-0">
                                            <div
                                                className={cn("w-6 h-6 md:w-7 md:h-7 shrink-0 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-lg border border-white/20 group-hover/voice:scale-110 transition-transform cursor-pointer", selectedVoiceObj.gradient)}
                                                onClick={(e) => { e.stopPropagation(); togglePlay(e, selectedVoiceObj.id); }}
                                            >
                                                {playingVoice === selectedVoiceObj.id ? <Square className="w-2.5 h-2.5 md:w-3 md:h-3 text-white fill-white" /> : <Play className="w-2.5 h-2.5 md:w-3 md:h-3 text-white fill-white ml-0.5" />}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-white uppercase text-[9px] md:text-[10px] tracking-wider truncate">{selectedVoiceObj.name}</span>
                                                <span className="hidden md:block text-[8px] md:text-[9px] text-zinc-500 font-mono uppercase tracking-tighter truncate mt-0.5">
                                                    {selectedVoiceObj.gender} • {selectedVoiceObj.tone}
                                                </span>
                                            </div>
                                        </div>
                                        <SlidersHorizontal className="w-3 h-3 md:w-4 md:h-4 shrink-0 ml-1 md:ml-2 text-zinc-500 group-hover/voice:text-white transition-colors" />
                                    </button>
                                </div>
                            )}

                            {activeTab === 'translate' && (
                                <div className="flex-[2] md:flex-1 relative min-w-0" ref={languageMenuRef}>
                                    <button
                                        onClick={() => setShowLanguageList(!showLanguageList)}
                                        className="w-full flex items-center justify-between px-2 md:px-4 py-2 bg-black/40 border border-white/5 hover:border-white/30 rounded-xl text-left transition-all h-10 md:h-12 group/lang relative z-20 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="flex items-center gap-2 md:gap-3 overflow-hidden min-w-0">
                                            <div className="w-6 h-6 md:w-7 md:h-7 shrink-0 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover/lang:border-white/50 transition-colors">
                                                <Globe className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-white uppercase text-[9px] md:text-[10px] tracking-wider truncate">
                                                    {(() => {
                                                        const availableLangs = selectedVoice.startsWith('fish_')
                                                            ? TRANSLATION_LANGUAGES.filter(lang => !['Hindi', 'Vietnamese'].includes(lang.id))
                                                            : TRANSLATION_LANGUAGES;
                                                        return availableLangs.find(l => l.id === selectedLanguage)?.name || 'Language';
                                                    })()}
                                                </span>
                                                <span className="hidden md:block text-[8px] md:text-[9px] text-zinc-500 font-mono uppercase tracking-tighter truncate mt-0.5">
                                                    Target Output
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronDown className={cn("w-3 h-3 md:w-4 md:h-4 shrink-0 transition-all ml-1 md:ml-2 text-zinc-600", showLanguageList && "rotate-180 text-white")} />
                                    </button>

                                    <AnimatePresence>
                                        {showLanguageList && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute z-[100] bottom-[calc(100%+12px)] w-full md:w-[100%] glass-mid border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-64 overflow-y-auto py-2 custom-scrollbar"
                                            >
                                                {(selectedVoice.startsWith('fish_') ? TRANSLATION_LANGUAGES.filter(lang => !['Hindi', 'Vietnamese'].includes(lang.id)) : TRANSLATION_LANGUAGES).map((lang) => (
                                                    <button
                                                        key={lang.id}
                                                        onClick={() => { setSelectedLanguage(lang.id); setShowLanguageList(false); }}
                                                        className={cn(
                                                            "w-full px-2 md:px-2 py-2 md:py-2 flex items-center gap-3 md:gap-4 hover:bg-white/[0.03] text-left transition-colors relative group/item",
                                                            selectedLanguage === lang.id && "bg-white/5"
                                                        )}
                                                    >
                                                        {selectedLanguage === lang.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-white text-black rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]" />}
                                                        <div className="text-sm md:text-base shrink-0 font-bold">{lang.flag}</div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className={cn("text-[9px] md:text-[10px] tracking-widest block truncate", selectedLanguage === lang.id ? "text-white " : "text-white")}>
                                                                {lang.name}
                                                            </span>
                                                        </div>
                                                        {selectedLanguage === lang.id && <Check className="w-3 h-3 text-white shrink-0" />}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {activeTab !== 'stt' && activeTab !== 'clone' && activeTab !== 'translate' && (
                                <button
                                    onClick={cycleFormat}
                                    className="w-14 md:w-20 shrink-0 h-10 md:h-12 px-2 bg-black/40 border border-white/5 hover:border-white/30 rounded-xl font-mono text-[9px] md:text-[10px] uppercase transition-all text-white font-bold tracking-widest active:scale-95 flex items-center justify-center gap-1.5 md:gap-2 relative z-20 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
                                >
                                    <AudioLines className="w-3 h-3 hidden md:block" />
                                    {outputFormat}
                                </button>
                            )}

                            {/* ── Generate / Upgrade Button ────────────────────────────── */}
                            {isLimitReached && activeTab !== 'clone' ? (
                                <button
                                    onClick={() => onShowPlanModal?.()}
                                    className="flex-[1.5] h-10 md:h-12 font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all relative overflow-hidden group/btn text-[10px] md:text-xs z-20 bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400/50 hover:scale-[1.01] active:scale-95"
                                >
                                    <Crown className="w-3 h-3 md:w-4 md:h-4" /> Pulse Limit Reached
                                </button>
                            ) : (
                                <button
                                    onClick={handleProcess}
                                    disabled={
                                        loading ||
                                        isTextOverLimit ||
                                        isFileInvalid ||
                                        (activeTab === 'tts' ? !textInput.trim() : !file && !result)
                                    }
                                    className={cn(
                                        "flex-[1.5] h-10 md:h-12 font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-all relative overflow-hidden group/btn text-[10px] md:text-xs z-20",
                                        (isTextOverLimit || isFileInvalid)
                                            ? "bg-red-500/10 text-red-400 border border-red-500/30 cursor-not-allowed"
                                            : "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:grayscale"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                    {loading ? (
                                        <><Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> Processing</>
                                    ) : (isTextOverLimit || isFileInvalid) ? (
                                        <><AlertTriangle className="w-3 h-3 md:w-4 md:h-4" /> {activeTab === 'clone' ? 'Clone Voice' : 'Generate'}</>
                                    ) : (
                                        <><Zap className="w-3 h-3 md:w-4 md:h-4 group-hover:scale-125 transition-transform " /> {activeTab === 'clone' ? 'Clone Voice' : 'Generate'}</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {activeTab !== 'clone' && (
                <div className="flex-none lg:flex-1 flex flex-col min-h-[200px] lg:min-h-0 relative z-10">
                    <div className="glass border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden relative">
                        <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between bg-white/[0.02]">
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-white " /> System Output
                            </span>
                            {result && (
                                <button onClick={handleCopy} className="text-[9px] font-mono uppercase text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors">
                                    {isCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Data</>}
                                </button>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative bg-black/20 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {!result && !loading && (
                                    <motion.div
                                        key="idle"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="text-center space-y-4"
                                    >
                                        <div className="w-16 h-16 flex items-center justify-center mx-auto opacity-40">
                                            <img src="/logo.webp" alt="iPulse Logo" className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-zinc-400 font-mono text-[8px] md:text-[10px] tracking-[0.3em]">Awaiting Instruction</p>
                                    </motion.div>
                                )}

                                {loading && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.97 }}
                                        transition={{ duration: 0.35, ease: 'easeOut' }}
                                        className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-sm"
                                    >
                                        {/* ── Waveform bars ──────────────────────────── */}
                                        <div className="relative flex items-center gap-[3px] h-14">
                                            {/* ambient glow */}
                                            <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-zinc-500 via-white to-zinc-500 rounded-full pointer-events-none" />
                                            {[...Array(16)].map((_, i) => {
                                                const colors = [
                                                    'bg-white text-black shadow-[0_0_12px_rgba(255,255,255,0.5)]',
                                                    'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.4)]',
                                                    'bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.4)]',
                                                    'bg-white/60 shadow-[0_0_10px_rgba(255,255,255,0.4)]',
                                                ];
                                                return (
                                                    <motion.div
                                                        key={i}
                                                        animate={{
                                                            height: [8, 44, 14, 36, 10, 28, 8],
                                                            opacity: [0.4, 1, 0.5, 0.9, 0.4, 0.8, 0.4],
                                                        }}
                                                        transition={{
                                                            repeat: Infinity,
                                                            duration: 1.2 + (i % 5) * 0.18,
                                                            delay: i * 0.06,
                                                            ease: 'easeInOut',
                                                        }}
                                                        className={`w-[3px] rounded-full ${colors[i % colors.length]}`}
                                                    />
                                                );
                                            })}
                                        </div>

                                        {/* ── Stage label ────────────────────────────── */}
                                        <div className="text-center space-y-1">
                                            <AnimatePresence mode="wait">
                                                <motion.p
                                                    key={stageIdx}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="text-white font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs "
                                                >
                                                    {stages[stageIdx]}
                                                </motion.p>
                                            </AnimatePresence>
                                            <p className="text-[9px] font-mono text-zinc-500 tracking-widest">
                                                Neural Engine Active · {elapsed}s elapsed
                                            </p>
                                        </div>

                                        {/* ── Progress bar ───────────────────────────── */}
                                        <div className="w-full space-y-2">
                                            <div className="flex justify-between items-center px-0.5">
                                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Progress</span>
                                                <motion.span
                                                    className="text-[10px] font-mono font-bold text-white tabular-nums"
                                                    key={Math.floor(progress)}
                                                >
                                                    {Math.floor(progress)}%
                                                </motion.span>
                                            </div>

                                            {/* track */}
                                            <div className="relative h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                                                {/* shimmer overlay */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
                                                    animate={{ x: ['-100%', '200%'] }}
                                                    transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                                                />
                                                {/* fill */}
                                                <motion.div
                                                    className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-zinc-500 via-white to-zinc-500 shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                                                    animate={{ width: `${progress}%` }}
                                                    transition={{ ease: 'linear', duration: 0.5 }}
                                                />
                                            </div>

                                            {/* stage dots */}
                                            <div className="flex justify-between px-0.5 pt-1">
                                                {stages.map((label, idx) => (
                                                    <div key={label} className="flex flex-col items-center gap-1">
                                                        <motion.div
                                                            className={cn(
                                                                'w-1.5 h-1.5 rounded-full transition-colors duration-500',
                                                                idx <= stageIdx
                                                                    ? 'bg-white text-black shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                                                                    : 'bg-white/10'
                                                            )}
                                                            animate={idx === stageIdx ? { scale: [1, 1.5, 1] } : {}}
                                                            transition={{ repeat: Infinity, duration: 1.2 }}
                                                        />
                                                        <span className={cn(
                                                            'text-[7px] font-mono uppercase tracking-tight hidden md:block',
                                                            idx <= stageIdx ? 'text-white' : 'text-zinc-700'
                                                        )}>
                                                            {label.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {result?.type === 'text' && (
                                    <motion.div
                                        key="text"
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="w-full h-full max-h-[200px] md:max-h-[500px] p-6 bg-black/40 rounded-xl border border-white/5 text-zinc-300 font-sans text-xs md:text-dm leading-relaxed whitespace-pre-wrap overflow-y-auto relative shadow-inner group/text custom-scrollbar"
                                    >
                                        {result.content}
                                    </motion.div>
                                )}

                                {result?.type === 'audio' && (
                                    <motion.div
                                        key="audio"
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                        className="w-full max-w-md space-y-4 md:space-y-8"
                                    >
                                        <div className="w-full">
                                            <CustomAudioPlayer src={result.content} blob={result.blob} />
                                        </div>
                                        <a
                                            href={result.content}
                                            download={result.content.startsWith('http') ? `ipulse_output_${Date.now()}.${result.content.split('.').pop()}` : `ipulse_output.${outputFormat}`}
                                            className="flex items-center justify-center gap-3 w-full py-3 bg-white text-black font-bold text-[10px] md:text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-white text-black transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                        >
                                            <UploadCloud className="w-4 h-4 rotate-180" />
                                            Download
                                        </a>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-1.5 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-cyan-500/20 animate-pulse" />
                    </div>
                </div>
            )}

            {activeTab === 'clone' && (
                <div className="flex-none lg:flex-1 flex flex-col mt-2 lg:mt-0 relative z-10">
                    <div className="glass border border-white/10 rounded-2xl p-4 lg:p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-zinc-500 text-[10px] font-mono leading-relaxed max-w-sm mb-6">
                            Upload a clear, 30-60s audio clip with minimal background noise. Our neural engine will map the identity and save it securely to your account.
                        </p>
                        <ul className="text-[9px] md:text-[10px] font-mono text-zinc-400 uppercase tracking-widest text-left space-y-3 bg-black/40 p-6 rounded-xl border border-white/5 w-full max-w-sm">
                            <li className="flex gap-3"><Check className="w-3.5 h-3.5 text-white shrink-0 " /> Processing time &lt; 2 minutes</li>
                            <li className="flex gap-3"><Check className="w-3.5 h-3.5 text-white shrink-0 " /> Available in all modules</li>
                            <li className="flex gap-3"><Check className="w-3.5 h-3.5 text-white shrink-0 " /> Preserves emotional nuance</li>
                        </ul>

                        {customVoices.length > 0 && (
                            <div className="w-full max-w-sm mt-6 text-left h-full overflow-y-auto custom-scrollbar pr-2 max-h-48">
                                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">Saved Identities</h3>
                                <div className="space-y-2">
                                    {customVoices.map(voice => (
                                        <div key={voice.id} className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-white/5 group">
                                            {editingVoiceId === voice.id ? (
                                                <input
                                                    autoFocus
                                                    value={editingName}
                                                    onChange={e => setEditingName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleRenameVoice(voice.id)}
                                                    className="bg-transparent border-b border-blue-500 outline-none text-xs font-mono text-white flex-1 mr-2"
                                                />
                                            ) : (
                                                <span className="text-[11px] md:text-sm font-mono font-bold tracking-wider text-white truncate pr-2 flex-1">{voice.name}</span>
                                            )}

                                            {editingVoiceId === voice.id ? (
                                                <button onClick={() => handleRenameVoice(voice.id)} className="p-1.5 hover:bg-white/10 rounded-md text-emerald-400 transition-colors shrink-0">
                                                    <Save className="w-3.5 h-3.5" />
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0">
                                                    <button onClick={() => { setEditingVoiceId(voice.id); setEditingName(voice.name); }} className="p-1.5 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-all">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDeleteVoice(voice.id, voice.voiceId)} className="p-1.5 hover:bg-red-500/10 rounded-md text-zinc-400 hover:text-red-400 transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Custom Voice Terms Modal */}
            {/* ── Voice Picker Modal ──────────────────────────────────────────── */}
            {mounted && typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {showVoiceModal && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-5 md:p-8 bg-black/70 backdrop-blur-md"
                            onClick={() => setShowVoiceModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                                className="w-[92vw] sm:w-full max-w-5xl glass-panel border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden h-[75vh] sm:h-[80vh] max-h-[75vh] sm:max-h-[80vh]"
                                onClick={e => e.stopPropagation()}
                            >
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-white/8">
                                <div>
                                    <h2 className="text-sm md:text-base font-mono font-bold uppercase text-white tracking-widest">Voice Library</h2>
                                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                                        {filteredVoices.length} voice{filteredVoices.length !== 1 ? 's' : ''} • Powered by xAI Grok
                                    </p>
                                </div>
                                <button onClick={() => setShowVoiceModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                                    <X className="w-4 h-4 text-zinc-400" />
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="px-5 md:px-7 py-3 border-b border-white/5 flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                                    <input
                                        id="voice-search-input"
                                        type="text"
                                        value={voiceSearch}
                                        onChange={e => setVoiceSearch(e.target.value)}
                                        placeholder="Search by name, language, or tone..."
                                        className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/8 hover:border-white/20 rounded-xl text-xs text-white placeholder:text-zinc-600 outline-none focus:border-white/30 transition-colors font-mono"
                                    />
                                </div>
                                {/* Gender filter pills */}
                                <div className="flex gap-1.5 items-center">
                                    {(['All', 'Male', 'Female'] as const).map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setVoiceGenderFilter(g)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all border',
                                                voiceGenderFilter === g
                                                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                                    : 'bg-black/40 text-zinc-400 border-white/8 hover:border-white/30 hover:text-white'
                                            )}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                                {/* Country filter */}
                                <div className="relative">
                                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                                    <select
                                        value={voiceCountryFilter}
                                        onChange={e => setVoiceCountryFilter(e.target.value)}
                                        className="pl-7 pr-6 py-2 bg-black/40 border border-white/8 hover:border-white/20 rounded-xl text-[10px] text-white outline-none focus:border-white/30 transition-colors font-mono uppercase tracking-widest appearance-none cursor-pointer min-w-[130px]"
                                    >
                                        {allCountries.map(c => (
                                            <option key={c} value={c} className="bg-zinc-900 text-white normal-case tracking-normal">{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Voice Grid */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-5">
                                {filteredVoices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <Search className="w-8 h-8 text-zinc-700 mb-3" />
                                        <p className="text-zinc-500 text-xs font-mono">No voices match your filters</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                                        {filteredVoices.map(voice => {
                                            const isSelected = selectedVoice === voice.id;
                                            const isPlaying = playingVoice === voice.id;
                                            const countryFlag: Record<string, string> = {
                                                'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Australia': '🇦🇺',
                                                'China': '🇨🇳', 'Japan': '🇯🇵', 'South Korea': '🇰🇷',
                                                'Spain': '🇪🇸', 'France': '🇫🇷', 'Germany': '🇩🇪',
                                                'Brazil': '🇧🇷', 'India': '🇮🇳', 'Vietnam': '🇻🇳',
                                                'Russia': '🇷🇺', 'Saudi Arabia': '🇸🇦', 'Italy': '🇮🇹',
                                            };
                                            return (
                                                <button
                                                    key={voice.id}
                                                    id={`voice-card-${voice.id}`}
                                                    onClick={() => handleVoiceSelect(voice.id)}
                                                    className={cn(
                                                        'relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 group/card',
                                                        isSelected
                                                            ? 'bg-white/10 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.08)]'
                                                            : 'bg-black/30 border-white/5 hover:bg-white/[0.04] hover:border-white/15'
                                                    )}
                                                >
                                                    {/* Gradient avatar */}
                                                    <div className={cn('w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br flex items-center justify-center border border-white/10 shadow-lg', voice.gradient)}>
                                                        <span className="text-base font-bold text-white drop-shadow">{voice.name[0]}</span>
                                                    </div>
                                                    {/* Text info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className="font-bold text-white text-[11px] uppercase tracking-widest truncate">{voice.name}</span>
                                                            {isSelected && <Check className="w-3 h-3 text-white shrink-0" />}
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-wrap">
                                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tight">{voice.language}</span>
                                                            <span className="text-zinc-700 text-[9px]">•</span>
                                                            <span className={cn('text-[9px] font-mono uppercase tracking-tight', voice.gender === 'Female' ? 'text-pink-400/80' : 'text-sky-400/80')}>
                                                                {voice.gender}
                                                            </span>
                                                            <span className="text-zinc-700 text-[9px]">•</span>
                                                            <span className="text-[10px]" title={voice.country}>{countryFlag[voice.country] || '🌐'}</span>
                                                        </div>
                                                        <p className="text-[8px] font-mono text-zinc-600 mt-0.5 truncate">{voice.tone}</p>
                                                    </div>
                                                    {/* Play button */}
                                                    <button
                                                        onClick={e => togglePlay(e, voice.id)}
                                                        className={cn(
                                                            'w-7 h-7 shrink-0 rounded-lg flex items-center justify-center border transition-all',
                                                            isPlaying
                                                                ? 'bg-white text-black border-white'
                                                                : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/30 text-zinc-400 hover:text-white opacity-0 group-hover/card:opacity-100'
                                                        )}
                                                    >
                                                        {isPlaying
                                                            ? <Square className="w-2.5 h-2.5 fill-black text-black" />
                                                            : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                                                        }
                                                    </button>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>,
            document.body
        )}

            {/* ── Custom Voice Terms Modal ──────────────────────────────────── */}
            <AnimatePresence>
                {showCustomVoiceModal && (

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-lg glass-panel border border-white/10 rounded-2xl p-5 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <ShieldCheck className="w-48 h-48 text-white rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-lg md:text-2xl font-mono font-bold uppercase text-white mb-2 flex items-center gap-3 tracking-tighter">
                                    Custom Voice Notice
                                </h2>
                                <p className="text-xs font-mono text-zinc-400 mb-6 leading-relaxed">
                                    Please review the capabilities and legal requirements before utilizing cloned neural identities.
                                </p>

                                <div className="space-y-3 md:space-y-4 mb-5 md:mb-8">
                                    <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                                        <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest mb-2">Language Limitations</h3>
                                        <p className="text-[10px] font-mono text-white-500/80 leading-relaxed mb-3">
                                            The custom voice engine natively supports exactly 13 languages. Using unsupported languages will result in generation failures.
                                        </p>
                                        <a href="/docs/custom-voices" target="_blank" className="text-[10px] font-mono font-bold text-white hover:text-white uppercase tracking-widest underline decoration-cyan-500/30 underline-offset-4 transition-colors">
                                            View Supported Languages →
                                        </a>
                                    </div>

                                    <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                        <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <ShieldCheck className="w-3 h-3 text-white" /> Legal Responsibility
                                        </h3>
                                        <ul className="list-disc list-inside space-y-2 text-[10px] font-mono text-zinc-500 leading-relaxed">
                                            <li>You must possess explicit permission to clone and synthesize this individual's voice.</li>
                                            <li>The creation of audio that is defamatory, misleading, serves fraudulent or illegal purposes is strictly prohibited.</li>
                                            <li>Accounts violating these terms are subject to immediate and permanent termination.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            setShowCustomVoiceModal(false);
                                            setPendingVoice(null);
                                        }}
                                        className="flex-1 py-3 px-4 glass border border-white/10 hover:bg-white/5 rounded-xl text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCustomVoiceModal(false);
                                            if (pendingVoice) {
                                                setSelectedVoice(pendingVoice);
                                                if (['Hindi', 'Vietnamese'].includes(selectedLanguage)) {
                                                    setSelectedLanguage('English');
                                                }
                                            }
                                        }}
                                        className="flex-[2] py-3 px-4 bg-white text-black hover:bg-white text-black text-black rounded-xl text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all text-center"
                                    >
                                        I Agree & Continue
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
