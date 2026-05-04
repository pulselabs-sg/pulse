import { useState, useEffect } from 'react';
import { History, Loader2, PlaySquare, FileText, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function HistoryPanel({ onLoadRecord }: { onLoadRecord: (item: any) => void }) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/history')
            .then(r => r.json())
            .then(data => { setHistory(data); setLoading(false); })
            .catch(e => { console.error(e); setLoading(false); });
    }, []);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-10 w-full custom-scrollbar">
            <div className="w-full max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                            <History className="w-6 h-6 text-blue-400" /> Transformation Log
                        </h2>
                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">Archived neural synthesis cycles</p>
                    </div>
                    {history.length > 0 && (
                        <div className="text-[10px] font-mono text-zinc-600 uppercase bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            Total Records: <span className="text-white">{history.length}</span>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Accessing secure archives...</p>
                    </div>
                ) : history.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center p-20 glass border border-white/10 rounded-2xl">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <History className="w-8 h-8 text-zinc-700" />
                        </div>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No neural history detected in the current matrix.</p>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                            {history.map((item, index) => (
                                <motion.div 
                                    key={item.id} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass border border-white/5 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-blue-500/30 hover:bg-white/[0.02] transition-all group cursor-default"
                                >
                                    <div className="shrink-0 flex items-center gap-3 w-32">
                                        <div className={cn(
                                            "p-2 rounded-xl border transition-colors",
                                            item.type?.toLowerCase() === 'stt' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                        )}>
                                            {item.type?.toLowerCase() === 'stt' ? <FileText className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {item.type}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-mono text-zinc-600 uppercase">Input Stream</span>
                                            <div className="h-[1px] flex-1 bg-white/5" />
                                        </div>
                                        <p className="text-sm text-zinc-300 truncate font-medium">
                                            {item.input || 'Audio File Uploaded'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3 mb-1">
                                            <span className="text-[9px] font-mono text-zinc-600 uppercase">Neural Result</span>
                                            <div className="h-[1px] flex-1 bg-white/5" />
                                        </div>
                                        <p className={cn(
                                            "text-xs text-zinc-500 leading-relaxed",
                                            item.type?.toLowerCase() === 'stt' ? "line-clamp-2" : "italic"
                                        )}>
                                            {
                                                item.type?.toLowerCase() === 'stt'
                                                    ? item.output
                                                    : item.output?.startsWith('http') ? 'Encoded Audio Sequence Stored' : 'Audio Signal Processed'
                                            }
                                        </p>
                                    </div>

                                    <div className="shrink-0 flex flex-col items-end gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                                        <div className="text-right">
                                            <p className="text-[10px] font-mono text-zinc-500 font-bold">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-[9px] font-mono text-zinc-600 uppercase">
                                                {new Date(item.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onLoadRecord(item)}
                                            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2.5 bg-white/5 hover:bg-white text-zinc-400 hover:text-black rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 group/btn"
                                        >
                                            <PlaySquare className="w-3.5 h-3.5 group-hover/btn:scale-125 transition-transform" /> Restore
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}