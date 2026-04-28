import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Zap, Mic, UploadCloud, CheckCircle2, ChevronDown, Check, Loader2, AudioLines, Copy, Settings2 } from 'lucide-react';
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
        <div className="flex-1 p-4 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6 relative z-10 min-h-0 overflow-y-auto lg:overflow-hidden">
            {/* Input */}
            <div className="flex-1 lg:max-w-xl flex flex-col min-h-0">
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 md:p-5 flex flex-col h-full">
                    <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                        <Settings2 className="w-4 h-4 text-white" /> Input Parameters
                    </h2>
                    <div className="flex-1 flex flex-col gap-4">
                        {activeTab === 'tts' && (
                            <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="Type your text..." className="flex-1 w-full min-h-[120px] bg-[#050505] border border-white/10 rounded-sm p-3 text-zinc-300 font-mono text-sm resize-none outline-none focus:border-white/40" />
                        )}
                        {(activeTab === 'stt' || activeTab === 'changer' || activeTab === 'clean') && (
                            <div {...getRootProps()} className={cn("h-36 border border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer", isDragActive ? "border-emerald-400 bg-emerald-400/5" : "border-white/20 bg-[#050505]")}>
                                <input {...getInputProps()} />
                                {file ? <div className="text-center"><CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" /><p className="text-xs text-white truncate max-w-[200px]">{file.name}</p></div> : <div className="text-center"><UploadCloud className="w-6 h-6 text-zinc-500 mx-auto mb-2" /><p className="text-[10px] uppercase text-zinc-500 font-mono">Drop audio here</p></div>}
                            </div>
                        )}

                        {(activeTab !== 'stt') && (
                            <div className="flex gap-2">
                                {(activeTab === 'tts' || activeTab === 'changer') && (
                                    <div className="flex-1 relative" ref={voiceMenuRef}>
                                        <button
                                            onClick={() => setShowVoiceList(!showVoiceList)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 bg-[#050505] border border-white/10 hover:border-white/30 rounded-sm text-left transition-all h-[46px]"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={cn("w-6 h-6 shrink-0 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg shadow-black/50 border border-white/20", selectedVoiceObj.gradient)}>
                                                    <span className="text-[10px] font-mono font-bold text-white drop-shadow-md">{selectedVoiceObj.name[0]}</span>
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <span className="font-mono font-bold text-white uppercase text-xs">{selectedVoiceObj.name}</span>
                                                    <span className="text-[10px] text-zinc-400 ml-2 font-mono hidden sm:inline-block">
                                                        - {selectedVoiceObj.gender}, {selectedVoiceObj.tone}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform ml-2 text-zinc-500", showVoiceList && "rotate-180")} />
                                        </button>

                                        <AnimatePresence>
                                            {showVoiceList && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                                                    className="absolute z-50 bottom-[calc(100%+4px)] w-full bg-[#050505] border border-white/10 rounded-sm shadow-2xl max-h-52 overflow-y-auto py-1 custom-scrollbar"
                                                >
                                                    {VOICES.map((voice) => (
                                                        <button
                                                            key={voice.id}
                                                            onClick={() => { setSelectedVoice(voice.id); setShowVoiceList(false); }}
                                                            className={cn(
                                                                "w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/5 text-left transition-colors",
                                                                selectedVoice === voice.id && "bg-emerald-400/5"
                                                            )}
                                                        >
                                                            <div className={cn("w-5 h-5 shrink-0 rounded-full bg-gradient-to-br border border-white/10 opacity-80", voice.gradient)} />
                                                            <div className="flex-1 truncate">
                                                                <span className={cn("font-mono font-bold uppercase text-xs", selectedVoice === voice.id ? "text-emerald-400" : "text-white")}>
                                                                    {voice.name}
                                                                </span>
                                                                <span className="text-[10px] text-zinc-500 ml-2 font-mono hidden sm:inline-block">
                                                                    - {voice.gender}, {voice.tone}
                                                                </span>
                                                            </div>
                                                            {selectedVoice === voice.id && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                                <button onClick={() => setOutputFormat(f => f === 'mp3' ? 'wav' : 'mp3')} className="w-[70px] shrink-0 h-[46px] px-4 bg-[#050505] border border-white/10 hover:border-white/30 rounded-sm font-mono text-[11px] uppercase transition-colors text-cyan-400 font-bold">{outputFormat}</button>
                            </div>
                        )}

                        <button onClick={handleProcess} disabled={loading || isLimitReached || (activeTab === 'tts' ? !textInput.trim() : !file && !result)} className={cn("w-full h-12 mt-auto font-mono text-xs font-bold uppercase rounded-sm flex items-center justify-center gap-2", isLimitReached ? "bg-red-500/10 text-red-400" : "bg-white text-black hover:bg-zinc-200 disabled:opacity-50")}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing</> : <><Zap className="w-4 h-4" /> Generate Now</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Output */}
            <div className="flex-1 bg-black/50 border border-white/10 rounded-sm flex flex-col min-h-[220px]">
                <div className="h-10 border-b border-white/10 px-4 flex items-center bg-black"><span className="text-[10px] font-mono text-zinc-500 uppercase">Output</span></div>
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[#050505] overflow-y-auto">
                    {!result && !loading && <div className="text-zinc-700 font-mono text-xs uppercase">Waiting for output...</div>}
                    {loading && <div className="animate-pulse"><AudioLines className="w-8 h-8 text-zinc-400 mx-auto" /></div>}

                    {result?.type === 'text' && (
                        <div className="w-full h-full bg-black p-5 border border-white/10 text-zinc-300 font-mono text-xs whitespace-pre-wrap overflow-y-auto relative">
                            {result.content}
                            <button onClick={handleCopy} className="absolute top-2 right-2 p-2 bg-black hover:bg-white/10 text-zinc-400 rounded-sm">{isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</button>
                        </div>
                    )}

                    {result?.type === 'audio' && (
                        <div className="w-full max-w-md space-y-4">
                            <audio controls src={result.content} className="w-full" />
                            <a href={result.content} download={`output.${outputFormat}`} className="block text-center py-3 bg-white text-black font-mono text-[10px] uppercase font-bold rounded-sm">Download {outputFormat.toUpperCase()}</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}