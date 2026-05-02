import { useState, useEffect } from 'react';
import { History, Loader2, PlaySquare } from 'lucide-react';
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
        <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
            <div className="w-full max-w-4xl mx-auto">
                <h2 className="text-lg font-mono uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-zinc-500" /> Transformation Log
                </h2>

                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
                ) : history.length === 0 ? (
                    <div className="text-center p-10 bg-black/50 border border-white/5 rounded-sm">
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No history recorded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((item) => (
                            <div key={item.id} className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-sm p-4 flex flex-col md:flex-row gap-4 items-start md:items-center hover:border-white/20 transition-all">
                                <div className="shrink-0 w-24">
                                    <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm text-[9px] font-mono uppercase text-emerald-400">
                                        {item.type}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-mono text-zinc-300 truncate mb-1">
                                        <span className="text-zinc-500">Input:</span> {item.input || 'N/A'}
                                    </p>
                                    <p className={cn(
                                        "text-[10px] font-mono text-zinc-500",
                                        item.type?.toLowerCase() === 'stt' ? "line-clamp-4" : "line-clamp-1"
                                    )}>
                                        <span className="text-zinc-600">Result:</span> {
                                            item.type?.toLowerCase() === 'stt'
                                                ? item.output
                                                : item.output?.startsWith('http') ? 'Audio URL Stored' : 'Audio Rendered'
                                        }
                                    </p>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-2">
                                    <p className="text-[9px] font-mono text-zinc-600 uppercase">
                                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                                    </p>
                                    <button
                                        onClick={() => onLoadRecord(item)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-sm border border-white/10 text-[9px] font-mono uppercase transition-colors"
                                    >
                                        <PlaySquare className="w-3 h-3" /> Load Record
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}