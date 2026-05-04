import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Zap, Mic, UploadCloud, CheckCircle2, ChevronDown, Check, Loader2, AudioLines, Copy, Settings2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { upload } from '@vercel/blob/client';
import { Tab, VOICES, formatSTTText } from '@/lib/dashboard-constants';

interface WorkspaceProps {
    activeTab: Tab;
    session: any;
    userState: any;
    setUserState: any;
    result: { type: 'text' | 'audio', content: string } | null;
    setResult: (v: any) => void;
    textInput: string;
    setTextInput: (v: string) => void;
    file: File | null;
    setFile: (v: File | null) => void;
    selectedVoice: string;
    setSelectedVoice: (v: string) => void;
}

export default function WorkspacePanel({ activeTab, session, userState, setUserState, result, setResult, textInput, setTextInput, file, setFile, selectedVoice, setSelectedVoice }: WorkspaceProps) {
    const [loading, setLoading] = useState(false);
    const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav'>('mp3');
    const [showVoiceList, setShowVoiceList] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const voiceMenuRef = useRef<HTMLDivElement>(null);

    const isLimitReached = userState.limit !== Infinity && userState.usage >= userState.limit;
    const selectedVoiceObj = VOICES.find(v => v.id === selectedVoice) || VOICES[0];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (voiceMenuRef.current && !voiceMenuRef.current.contains(e.target as Node)) setShowVoiceList(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (files) => { if (files[0] && files[0].type.startsWith('audio/')) setFile(files[0]); },
        accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'] },
        maxFiles: 1, maxSize: userState.maxFileMB * 1024 * 1024,
    });

    const handleProcess = async () => {
        if (!session?.user || isLimitReached) return;
        const cleanText = textInput.trim();
        if (activeTab === 'tts' && cleanText.length > userState.maxChars) { alert("Text too long!"); return; }

        setLoading(true); setResult(null);
        let requestBody: any = { format: outputFormat };
        let endpoint = activeTab === 'tts' ? 'text-to-speech' : activeTab === 'stt' ? 'speech-to-text' : 'voice-changer';

        try {
            if (activeTab === 'tts') { requestBody.text = cleanText; requestBody.voiceId = selectedVoice; }
            else {
                if (!file) throw new Error("File missing");
                const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                const blob = await upload(safeName, file, { access: 'public', handleUploadUrl: '/api/upload' });
                requestBody.fileUrl = blob.url; requestBody.fileName = file.name;
                if (activeTab === 'changer') requestBody.targetVoice = selectedVoice;
            }

            const res = await fetch(`/api/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });
            if (!res.ok) throw new Error(await res.text());

            setUserState((prev: any) => ({ ...prev, usage: parseInt(res.headers.get('X-User-Usage') || String(prev.usage + 1)) }));

            if (activeTab === 'stt') {
                const data = await res.json(); setResult({ type: 'text', content: data.text });
            } else {
                const url = URL.createObjectURL(await res.blob()); setResult({ type: 'audio', content: url });
            }
        } catch (err: any) { alert(err.message); } finally { setLoading(false); }
    };

    const handleCopy = () => {
        if (result?.content) { navigator.clipboard.writeText(result.content); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }
    };

    return (
        <div className="flex-1 p-4 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 relative z-10 min-h-0 overflow-y-auto custom-scrollbar">
            {/* Input */}
            <div className="flex-1 lg:max-w-2xl flex flex-col min-h-0">
                <div className="glass border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col h-full min-h-[450px] lg:min-h-0 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                        <Settings2 className="w-32 h-32 text-white rotate-12" />
                    </div>

                    <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-6 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                        Intelligence Input Matrix
                    </h2>

                    <div className="flex-1 flex flex-col gap-6 relative z-10">
                        {activeTab === 'tts' && (
                            <div className="flex-1 flex flex-col group/textarea">
                                <textarea 
                                    value={textInput} 
                                    onChange={(e) => setTextInput(e.target.value)} 
                                    placeholder="Enter your script for neural synthesis..." 
                                    className="flex-1 w-full min-h-[150px] bg-black/40 border border-white/5 rounded-xl p-5 text-white font-sans text-sm md:text-base leading-relaxed resize-none outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-zinc-700 custom-scrollbar shadow-inner" 
                                />
                                <div className="flex justify-between mt-2 px-1">
                                    <span className="text-[9px] font-mono uppercase text-zinc-600">Max Chars: {userState.maxChars}</span>
                                    <span className={cn("text-[9px] font-mono uppercase", textInput.length > userState.maxChars ? "text-red-500" : "text-zinc-600")}>
                                        {textInput.length} / {userState.maxChars}
                                    </span>
                                </div>
                            </div>
                        )}

                        {(activeTab === 'stt' || activeTab === 'changer' || activeTab === 'clean') && (
                            <div {...getRootProps()} className={cn(
                                "relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden group/drop",
                                isDragActive ? "border-blue-500 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.1)]" : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
                            )}>
                                <input {...getInputProps()} />
                                {file ? (
                                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <p className="text-sm font-bold text-white truncate max-w-[250px]">{file.name}</p>
                                        <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • READY</p>
                                    </motion.div>
                                ) : (
                                    <div className="text-center z-10 transition-transform group-hover/drop:scale-105 duration-500">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover/drop:border-blue-500/30 transition-colors">
                                            <UploadCloud className="w-8 h-8 text-zinc-500 group-hover/drop:text-blue-400 transition-colors" />
                                        </div>
                                        <p className="text-xs font-bold text-white uppercase tracking-widest">Transmit Audio Signal</p>
                                        <p className="text-[9px] font-mono text-zinc-500 uppercase mt-2">MP3, WAV, M4A • MAX {userState.maxFileMB}MB</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover/drop:opacity-100 transition-opacity" />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {(activeTab === 'tts' || activeTab === 'changer') && (
                                    <div className="flex-1 relative" ref={voiceMenuRef}>
                                        <button
                                            onClick={() => setShowVoiceList(!showVoiceList)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-black/40 border border-white/5 hover:border-white/20 rounded-xl text-left transition-all h-14 group/voice"
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className={cn("w-8 h-8 shrink-0 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg border border-white/20 group-hover/voice:scale-110 transition-transform", selectedVoiceObj.gradient)}>
                                                    <span className="text-xs font-bold text-white drop-shadow-md">{selectedVoiceObj.name[0]}</span>
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-bold text-white uppercase text-[11px] tracking-wider">{selectedVoiceObj.name}</span>
                                                    <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-tighter truncate">
                                                        {selectedVoiceObj.gender} • {selectedVoiceObj.tone}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronDown className={cn("w-4 h-4 shrink-0 transition-all ml-2 text-zinc-600", showVoiceList && "rotate-180 text-blue-400")} />
                                        </button>

                                        <AnimatePresence>
                                            {showVoiceList && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                    className="absolute z-50 bottom-[calc(100%+8px)] w-full glass border border-white/10 rounded-2xl shadow-2xl max-h-64 overflow-y-auto py-2 custom-scrollbar"
                                                >
                                                    {VOICES.map((voice) => (
                                                        <button
                                                            key={voice.id}
                                                            onClick={() => { setSelectedVoice(voice.id); setShowVoiceList(false); }}
                                                            className={cn(
                                                                "w-full px-4 py-3 flex items-center gap-4 hover:bg-white/[0.03] text-left transition-colors relative",
                                                                selectedVoice === voice.id && "bg-blue-500/5"
                                                            )}
                                                        >
                                                            {selectedVoice === voice.id && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-full" />}
                                                            <div className={cn("w-7 h-7 shrink-0 rounded-lg bg-gradient-to-br border border-white/10 opacity-80", voice.gradient)} />
                                                            <div className="flex-1 min-w-0">
                                                                <span className={cn("font-bold uppercase text-[10px] tracking-widest block", selectedVoice === voice.id ? "text-blue-400" : "text-white")}>
                                                                    {voice.name}
                                                                </span>
                                                                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-tighter truncate block mt-0.5">
                                                                    {voice.gender} • {voice.tone}
                                                                </span>
                                                            </div>
                                                            {selectedVoice === voice.id && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                {activeTab !== 'stt' && (
                                    <button 
                                        onClick={() => setOutputFormat(f => f === 'mp3' ? 'wav' : 'mp3')} 
                                        className="w-full sm:w-24 shrink-0 h-14 px-4 bg-black/40 border border-white/5 hover:border-white/20 rounded-xl font-mono text-[11px] uppercase transition-all text-blue-400 font-bold tracking-widest active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <AudioLines className="w-4 h-4" />
                                        {outputFormat}
                                    </button>
                                )}
                            </div>

                            <button 
                                onClick={handleProcess} 
                                disabled={loading || isLimitReached || (activeTab === 'tts' ? !textInput.trim() : !file && !result)} 
                                className={cn(
                                    "w-full h-14 font-bold uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group/btn", 
                                    isLimitReached ? "bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed" : "accent-gradient text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:grayscale"
                                )}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing Matrix</>
                                ) : (
                                    <><Zap className="w-5 h-5 group-hover:scale-125 transition-transform" /> Initialize Synthesis</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Output */}
            <div className="flex-none lg:flex-1 flex flex-col min-h-[250px] lg:min-h-0">
                <div className="glass border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden relative">
                    <div className="h-12 border-b border-white/5 px-6 flex items-center justify-between bg-white/[0.02]">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> System Output
                        </span>
                        {result && (
                             <button onClick={handleCopy} className="text-[9px] font-mono uppercase text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors">
                                {isCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Data</>}
                             </button>
                        )}
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-black/20 overflow-y-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {!result && !loading && (
                                <motion.div 
                                    key="idle"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="w-16 h-16 rounded-full border-2 border-white/5 flex items-center justify-center mx-auto opacity-20">
                                        <Zap className="w-8 h-8 text-white" />
                                    </div>
                                    <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.3em]">Awaiting Instruction</p>
                                </motion.div>
                            )}

                            {loading && (
                                <motion.div 
                                    key="loading"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-8"
                                >
                                    <div className="flex items-center gap-1 h-12">
                                        {[...Array(12)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ 
                                                    height: [10, 40, 15, 30, 10],
                                                    opacity: [0.3, 1, 0.3, 0.7, 0.3]
                                                }}
                                                transition={{ 
                                                    repeat: Infinity, 
                                                    duration: 1 + Math.random(),
                                                    ease: "easeInOut"
                                                }}
                                                className="w-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                            />
                                        ))}
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold tracking-widest uppercase text-xs animate-pulse">Processing Neural Nodes</p>
                                        <p className="text-[9px] font-mono text-zinc-500 uppercase mt-2">Applying custom voice parameters...</p>
                                    </div>
                                </motion.div>
                            )}

                            {result?.type === 'text' && (
                                <motion.div 
                                    key="text"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className="w-full h-full p-6 bg-black/40 rounded-xl border border-white/5 text-zinc-300 font-sans text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto relative shadow-inner group/text"
                                >
                                    {result.content}
                                </motion.div>
                            )}

                            {result?.type === 'audio' && (
                                <motion.div 
                                    key="audio"
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="w-full max-w-md space-y-8"
                                >
                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 shadow-2xl">
                                        <audio controls src={result.content} className="w-full h-10 accent-blue-500" />
                                    </div>
                                    <a 
                                        href={result.content} 
                                        download={result.content.startsWith('http') ? `ipulse_output_${Date.now()}.${result.content.split('.').pop()}` : `ipulse_output.${outputFormat}`} 
                                        className="flex items-center justify-center gap-3 w-full py-4 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-200 transition-all active:scale-95 shadow-lg"
                                    >
                                        <UploadCloud className="w-4 h-4 rotate-180" />
                                        Download Mastered Audio
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-pulse" />
                </div>
            </div>
        </div>
    );
}