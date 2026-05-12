import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomAudioPlayerProps {
    src: string;
    blob?: Blob;
}

export function CustomAudioPlayer({ src, blob }: CustomAudioPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        let isMounted = true;

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: 'rgba(34, 211, 238, 0.3)',
            progressColor: 'rgba(34, 211, 238, 1)',
            cursorColor: 'rgba(255, 255, 255, 0.8)',
            barWidth: 2,
            barGap: 3,
            barRadius: 3,
            height: 60,
            normalize: true,
            // LOẠI BỎ backend: 'WebAudio'. Bằng cách nạp Peaks thủ công,
            // chúng ta vẫn vẽ được sóng, vẫn sửa được lỗi MP3 duration,
            // và quan trọng nhất: Ép WaveSurfer sử dụng thẻ <audio> để stream mà KHÔNG dùng fetch()!
        });

        const initAudio = async () => {
            try {
                if (blob) {
                    // 1. Chuyển Blob thành ArrayBuffer trực tiếp trên RAM (Không qua network)
                    const arrayBuffer = await blob.arrayBuffer();

                    // 2. Giải mã âm thanh bằng AudioContext của trình duyệt 
                    // => Sửa triệt để lỗi sai thời lượng MP3 gốc
                    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                    const audioContext = new AudioContextClass();
                    const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);

                    if (!isMounted) return;

                    // 3. Tự động nội suy điểm sóng (Downsample) để đưa cho WaveSurfer
                    // Lấy ra 3000 điểm ảnh sóng đại diện để trình duyệt vẽ mượt mà mà không đơ lag
                    const channelData = decodedBuffer.getChannelData(0);
                    const sampleCount = 3000;
                    const blockSize = Math.max(1, Math.floor(channelData.length / sampleCount));
                    const peaks = new Float32Array(sampleCount);

                    for (let i = 0; i < sampleCount; i++) {
                        let max = 0;
                        const start = i * blockSize;
                        const end = Math.min(start + blockSize, channelData.length);
                        for (let j = start; j < end; j++) {
                            const val = Math.abs(channelData[j]);
                            if (val > max) max = val;
                        }
                        peaks[i] = max;
                    }

                    // 4. Load Audio kèm theo Peaks và Thời lượng chính xác
                    // KIẾN TRÚC NÀY CHẶN WAVESURFER GỌI fetch() VÀ BYPASS HOÀN TOÀN LỖI CỦA NEXT.JS
                    const objectUrl = URL.createObjectURL(blob);

                    // ws.load(url, peaks, duration)
                    await ws.load(objectUrl, [peaks as any], decodedBuffer.duration);

                    if (isMounted) {
                        setDuration(decodedBuffer.duration);
                        setIsReady(true);
                    }
                } else {
                    // Xử lý mặc định nếu chỉ truyền vào src (các bản preview mp3 đã có sẵn)
                    await ws.load(src);
                }
            } catch (error) {
                console.error('Audio initialization failed:', error);
            }
        };

        initAudio();

        ws.on('ready', () => {
            // Chỉ cập nhật nếu không dùng blob (vì blob đã được tính toán thời lượng tuyệt đối từ phía trên)
            if (!blob && isMounted) {
                setDuration(ws.getDuration());
                setIsReady(true);
            }
        });

        ws.on('timeupdate', (time) => {
            if (isMounted) setCurrentTime(time);
        });

        ws.on('play', () => isMounted && setIsPlaying(true));
        ws.on('pause', () => isMounted && setIsPlaying(false));
        ws.on('finish', () => isMounted && setIsPlaying(false));

        wavesurferRef.current = ws;

        return () => {
            isMounted = false;
            ws.destroy();
        };
    }, [src, blob]);

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        wavesurferRef.current?.playPause();
    };

    const handleMute = () => {
        const ws = wavesurferRef.current;
        if (ws) {
            ws.setMuted(!isMuted);
            setIsMuted(!isMuted);
        }
    };

    return (
        <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm relative group transition-all hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]">
            {/* Control Header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handlePlayPause}
                        disabled={!isReady}
                        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-400 hover:text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                    >
                        {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" /> : <Play className="w-4 h-4 md:w-5 md:h-5 fill-current ml-1" />}
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] font-mono uppercase tracking-[0.2em] mb-0.5 text-zinc-500">
                            {isReady ? 'Neural Audio Output' : 'Decoding Waveform...'}
                        </span>
                        <div className="text-xs md:text-sm font-bold font-mono flex items-center gap-2">
                            <span className="text-cyan-400 text-glow-cyan">{formatTime(currentTime)}</span>
                            <span className="text-zinc-600">/</span>
                            <span className="text-zinc-400">{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button
                        onClick={handleMute}
                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
                    >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Waveform Container */}
            <div className="w-full relative rounded-xl overflow-hidden bg-black/40 p-2 md:p-3 border border-white/5 shadow-inner">
                <div ref={containerRef} className="w-full relative z-10" />

                {/* Loader Overlay */}
                {!isReady && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}