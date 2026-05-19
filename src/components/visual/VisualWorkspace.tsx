import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Settings, Image as ImageIcon, Video, Send,
  X, Sparkles, Wand2, Upload, AlertCircle, Loader2, PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GROK_FEATURES, GrokFeature, ASPECT_RATIOS, QUALITY_OPTIONS, VIDEO_DURATION_OPTIONS, FLOW_DURATION_OPTIONS } from '@/lib/visual-constants';
import RevealAnimation from './RevealAnimation';
import { useRouter } from 'next/navigation';

const getCleanPath = (path: string) => {
  if (typeof window !== 'undefined') {
    const isSubdomain = window.location.hostname.startsWith('visual.') || window.location.hostname.startsWith('audio.');
    if (isSubdomain) {
      return path.replace(/^\/(visual|audio)/, '') || '/';
    }
  }
  return path;
};

interface VisualWorkspaceProps {
  onShowPlanModal: () => void;
  userState: any;
  projectId?: string;
  selectedHistoryItem?: any;
  clearSelectedHistory?: () => void;
  updateSession?: () => void;
}

export default function VisualWorkspace({
  onShowPlanModal,
  userState,
  projectId,
  selectedHistoryItem,
  clearSelectedHistory,
  updateSession
}: VisualWorkspaceProps) {
  const router = useRouter();

  // Projects State
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // In-Project Generations History
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Input State
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<File | null>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [mainMode, setMainMode] = useState<'image' | 'video' | 'flow'>('image');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>(ASPECT_RATIOS[0].id);
  const [selectedQuality, setSelectedQuality] = useState<string>(QUALITY_OPTIONS[0].id);
  const [selectedVideoDuration, setSelectedVideoDuration] = useState<number>(VIDEO_DURATION_OPTIONS[0].id);
  const [selectedFlowDuration, setSelectedFlowDuration] = useState<number>(FLOW_DURATION_OPTIONS[2].id);
  const [flowPrompt, setFlowPrompt] = useState('');

  // Gallery Sidebar open/close state (default open on PC, closed on mobile)
  const [isGalleryOpen, setIsGalleryOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsGalleryOpen(false);
    }
  }, []);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerError = (message: string) => {
    console.log("Triggering synthesis error toast UI:", message);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setSynthesisError(message);
    errorTimeoutRef.current = setTimeout(() => {
      setSynthesisError(null);
      errorTimeoutRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Flow State
  interface FlowStep {
    id: string;
    url: string;
    duration: number;
    isLocal?: boolean;
    prompt?: string;
  }
  const [flowSequence, setFlowSequence] = useState<FlowStep[]>([]);
  const [originalVideoDuration, setOriginalVideoDuration] = useState<number>(0);
  const [activeFlowVideo, setActiveFlowVideo] = useState<string | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (referenceImage) {
      const url = URL.createObjectURL(referenceImage);
      setReferenceImageUrl(url);
      
      if (mainMode === 'flow' && referenceImage.type.includes('video')) {
        const tempVideo = document.createElement('video');
        tempVideo.src = url;
        tempVideo.onloadedmetadata = () => {
          const duration = Math.round(tempVideo.duration) || 15;
          setOriginalVideoDuration(duration);
          setFlowSequence([
            { id: 'original', url, duration, isLocal: true }
          ]);
          setActiveFlowVideo(url);
        };
        tempVideo.onerror = () => {
          setOriginalVideoDuration(15);
          setFlowSequence([
            { id: 'original', url, duration: 15, isLocal: true }
          ]);
          setActiveFlowVideo(url);
        };
      }
      return () => URL.revokeObjectURL(url);
    } else {
      setReferenceImageUrl(null);
      setOriginalVideoDuration(0);
      setFlowSequence([]);
      setActiveFlowVideo(null);
    }
  }, [referenceImage, mainMode]);

  useEffect(() => {
    if (mainMode === 'flow') {
      if (flowSequence.length === 0) {
        if (referenceImageUrl) {
          const tempVideo = document.createElement('video');
          tempVideo.src = referenceImageUrl;
          tempVideo.onloadedmetadata = () => {
            const duration = Math.round(tempVideo.duration) || 15;
            setOriginalVideoDuration(duration);
            setFlowSequence([
              { id: 'original', url: referenceImageUrl, duration, isLocal: true }
            ]);
            setActiveFlowVideo(referenceImageUrl);
          };
          tempVideo.onerror = () => {
            setOriginalVideoDuration(15);
            setFlowSequence([
              { id: 'original', url: referenceImageUrl, duration: 15, isLocal: true }
            ]);
            setActiveFlowVideo(referenceImageUrl);
          };
        } else if (result?.url && result.type === 'video') {
          const tempVideo = document.createElement('video');
          tempVideo.src = result.url;
          tempVideo.onloadedmetadata = () => {
            const duration = Math.round(tempVideo.duration) || 15;
            setFlowSequence([
              { id: 'original', url: result.url, duration }
            ]);
            setActiveFlowVideo(result.url);
          };
          tempVideo.onerror = () => {
            setFlowSequence([
              { id: 'original', url: result.url, duration: 15 }
            ]);
            setActiveFlowVideo(result.url);
          };
        }
      }
    }
  }, [mainMode, referenceImageUrl, result]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Projects if in landing mode
  useEffect(() => {
    if (!projectId) {
      fetchProjects();
    }
  }, [projectId]);

  // Fetch project-specific generations history if inside a project
  useEffect(() => {
    if (projectId) {
      fetchHistory();
    }
  }, [projectId]);

  // Handle selected history items
  useEffect(() => {
    if (selectedHistoryItem) {
      try {
        const output = JSON.parse(selectedHistoryItem.output);
        setResult({ type: output.type, url: output.url });
        setPrompt(selectedHistoryItem.input || '');

        if (mainMode === 'flow' && output.type === 'video') {
          const tempVideo = document.createElement('video');
          tempVideo.src = output.url;
          tempVideo.onloadedmetadata = () => {
            const duration = Math.round(tempVideo.duration) || 15;
            setFlowSequence([
              { id: 'original', url: output.url, duration }
            ]);
            setActiveFlowVideo(output.url);
          };
          tempVideo.onerror = () => {
            setFlowSequence([
              { id: 'original', url: output.url, duration: 15 }
            ]);
            setActiveFlowVideo(output.url);
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [selectedHistoryItem, mainMode]);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await fetch('/api/visual/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchHistory = async () => {
    if (!projectId) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/history?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.filter((h: any) => h.type === 'visual'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCreateProject = async () => {
    const name = window.prompt('Enter project name:', 'New Visual Project');
    if (!name) return;

    try {
      const res = await fetch('/api/visual/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const project = await res.json();
        router.push(getCleanPath(`/visual/${project.id}`));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/visual/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteHistory = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this generation?')) return;
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(h => h.id !== id));
        if (result?.url && history.find(h => h.id === id)?.output.includes(result.url)) {
          setResult(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectHistoryItem = (item: any) => {
    try {
      const output = JSON.parse(item.output);
      setResult({ type: output.type, url: output.url });
      setPrompt(item.input || '');
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReferenceImage(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getLastVideoDuration = (): number => {
    if (flowSequence.length === 0) return 0;
    return flowSequence[flowSequence.length - 1].duration;
  };

  const getLastVideoUrl = (): string => {
    if (flowSequence.length === 0) return '';
    return flowSequence[flowSequence.length - 1].url;
  };

  const handleGenerate = async () => {
    const isVideo = mainMode === 'video' || mainMode === 'flow';

    if (mainMode === 'flow') {
      if (flowSequence.length === 0) {
        alert("Please upload or select an original video to start.");
        return;
      }
      const currentDuration = getLastVideoDuration();
      if (currentDuration >= 30) {
        alert("Maximum video duration of 30 seconds has been reached.");
        return;
      }
      if (30 - currentDuration < 2) {
        alert("Cannot extend further as it would exceed the 30-second limit.");
        return;
      }
    } else {
      if (!prompt && !referenceImage) return;
    }

    let durSec = selectedVideoDuration;
    if (mainMode === 'flow') {
      const currentDuration = getLastVideoDuration();
      durSec = Math.min(selectedFlowDuration, 30 - currentDuration);
    }

    const isHD = selectedQuality === '720p' || selectedQuality === '1080p' || selectedQuality === '2k';
    const cost = isVideo ? (durSec * (isHD ? 1500 : 1200)) : 1500;

    const remainingPulses = userState.limit - userState.usage;
    if (cost > remainingPulses) {
      alert("Pulse quota exceeded. Please upgrade your plan.");
      onShowPlanModal();
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      let referenceImageBase64 = '';
      if (mainMode === 'flow') {
        const lastStep = flowSequence[flowSequence.length - 1];
        if (lastStep.isLocal && referenceImage) {
          referenceImageBase64 = await fileToBase64(referenceImage);
        } else {
          referenceImageBase64 = lastStep.url;
        }
      } else if (referenceImage) {
        referenceImageBase64 = await fileToBase64(referenceImage);
      }

      if (isVideo) {
        const res = await fetch('/api/visual/generate-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: mainMode === 'flow' ? (flowPrompt || prompt) : prompt,
            duration: durSec,
            referenceImageBase64,
            mode: mainMode,
            quality: selectedQuality
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.details?.error || data.error || 'Failed to start video generation');
        }

        // Deduct pulse immediately on UI side
        updateSession?.();

        const requestId = data.request_id;

        // Polling logic
        const intervalId = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/visual/video-status?request_id=${requestId}&duration=${durSec}&quality=${selectedQuality}`);
            const statusData = await statusRes.json();

            if (!statusRes.ok) {
              clearInterval(intervalId);
              setIsGenerating(false);
              const errMsg = statusData.details?.error || statusData.error || 'Failed to check video status';
              triggerError(`Video Synthesis Rejected: ${errMsg}`);
              return;
            }

            if (statusData.status === 'done') {
              clearInterval(intervalId);

              // Minimum display delay for premium feeling
              await new Promise(resolve => setTimeout(resolve, 3000));

              setIsGenerating(false);
              setResult({ type: 'video', url: statusData.video.url });
              updateSession?.();

              // Add generated video to the flow sequence if in flow mode
              if (mainMode === 'flow') {
                const currentDuration = getLastVideoDuration();
                const newDuration = Math.min(30, currentDuration + durSec);
                const nextStepIndex = flowSequence.length;
                setFlowSequence(prev => [
                  ...prev,
                  {
                    id: `gen-${nextStepIndex}`,
                    url: statusData.video.url,
                    duration: newDuration,
                    prompt: flowPrompt || prompt
                  }
                ]);
                setActiveFlowVideo(statusData.video.url);
              }

              // Save to history and prepend local history state
              const hRes = await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'visual',
                  input: mainMode === 'flow' ? (flowPrompt || prompt) : (prompt || 'Video Generation'),
                  output: JSON.stringify({ type: 'video', url: statusData.video.url }),
                  projectId
                })
              });
              if (hRes.ok) {
                const newHItem = await hRes.json();
                setHistory(prev => [newHItem, ...prev]);
              }
            } else if (statusData.status === 'failed' || statusData.status === 'expired') {
              clearInterval(intervalId);
              setIsGenerating(false);
              triggerError(`Video generation ${statusData.status}`);
            }
          } catch (err) {
            console.error('Polling error', err);
          }
        }, 5000);

      } else {
        // Minimum visual loading time (e.g. 6 seconds) for high-end aesthetic
        const [res] = await Promise.all([
          fetch('/api/visual/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              feature: 'basic-image',
              referenceImageBase64
            })
          }),
          new Promise(resolve => setTimeout(resolve, 6000))
        ]);

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.details?.error || data.error || 'Failed to generate image');
        }

        setIsGenerating(false);
        setResult({ type: 'image', url: data.url });
        updateSession?.();

        // Save to history and prepend local history state
        const hRes = await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'visual',
            input: prompt || 'Image Generation',
            output: JSON.stringify({ type: 'image', url: data.url }),
            projectId
          })
        });
        if (hRes.ok) {
          const newHItem = await hRes.json();
          setHistory(prev => [newHItem, ...prev]);
        }
      }
    } catch (err: any) {
      console.error(err);
      triggerError(err.message);
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (!result?.url) return;
    navigator.clipboard.writeText(result.url);
    alert('URL copied to clipboard!');
  };

  // Immediate asset download via local proxy
  const handleDownload = () => {
    if (!result?.url) return;
    window.location.href = `/api/visual/download?url=${encodeURIComponent(result.url)}`;
  };

  /* ─────────────────────────────────────────────────────────
     1. LANDING VIEW (No projectId selected)
     ───────────────────────────────────────────────────────── */
  if (!projectId) {
    return (
      <div className="flex-1 flex flex-col items-center p-8 gap-8 relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
        {/* Header Hero Area */}
        <div className="text-center w-full max-w-2xl mt-12 mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-mono font-bold tracking-[0.25em] text-white uppercase text-glow-white mb-4"
          >
            iPulse Vision
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm font-mono text-zinc-300 tracking-wider leading-relaxed max-w-xl mx-auto mb-10"
          >
            Harness advanced visual synthesis models to generate, animate, and extend visual reality with surgical precision.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreateProject}
            className="px-10 py-4 bg-white text-black font-bold font-mono text-xs uppercase tracking-[0.25em] rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_35px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.35)]"
          >
            Create New Canvas
          </motion.button>
        </div>

        {/* Recent Projects Section */}
        <div className="w-full max-w-5xl mt-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
            <h3 className="text-[10px] font-mono text-zinc-300 font-bold uppercase tracking-[0.3em]">
              Active Projects Matrix
            </h3>
            <span className="text-[9px] font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              {projects.length} Total Canvases
            </span>
          </div>

          {isLoadingProjects ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 border border-white/5 border-dashed rounded-3xl bg-white/[0.01]">
              <ImageIcon className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">No visual canvases initialized yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-16">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => router.push(getCleanPath(`/visual/${project.id}`))}
                  className="glass border border-white/10 rounded-3xl p-6 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300 cursor-pointer relative group flex flex-col justify-between h-44 overflow-hidden shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div>
                    <div className="flex items-center gap-2 mb-3 text-zinc-400 group-hover:text-white transition-colors duration-300">
                      <Wand2 className="w-4 h-4" />
                      <span className="text-[9px] font-mono tracking-widest uppercase">Visual Workspace</span>
                    </div>
                    <h3 className="text-sm font-mono text-white tracking-wider font-bold uppercase truncate pr-8">
                      {project.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-auto z-10">
                    <span className="text-[9px] font-mono text-zinc-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] font-mono tracking-widest font-bold text-white bg-white/10 px-3 py-1.5 rounded-full group-hover:bg-white group-hover:text-black transition-all">
                      OPEN CANVAS
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     2. WORKSPACE ACTIVE VIEW (projectId selected)
     ───────────────────────────────────────────────────────── */
  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full relative z-10 w-full overflow-hidden">

      {/* ─────────────────────────────────────────────────────
         A. Left Workspace & Generation Frame
         ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full p-4 md:p-6 overflow-hidden min-w-0">

        {/* Workspace Subheader */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button
            onClick={() => router.push(getCleanPath('/visual'))}
            className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-white/5 border border-white/5 hover:border-white/15"
          >
            <X className="w-3 h-3" /> Close Project
          </button>

          <button
            onClick={() => setIsGalleryOpen(!isGalleryOpen)}
            className={cn(
              "text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-white/5 border border-white/5 hover:border-white/15 ml-auto",
              isGalleryOpen && "lg:hidden"
            )}
          >
            {isGalleryOpen ? 'Hide History' : `History (${history.length})`}
          </button>
        </div>

        {/* Settings Popover Background Overlay */}
        {showSettings && (
          <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
        )}

        {/* Interactive Synthesis Display Screen */}
        <div className="flex-1 glass border border-white/10 rounded-4xl mb-5 relative overflow-hidden flex shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          {mainMode === 'flow' ? (
            <div className="flex w-full h-full">
              {/* Left 20% */}
              <div className="w-2/6 md:w-[20%] border-r border-white/10 bg-black/20 p-3 md:p-4 flex flex-col items-center overflow-y-auto custom-scrollbar relative z-10 gap-1">
                <p className="text-[8px] md:text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-4 shrink-0 text-center">Sequence</p>

                {flowSequence.map((item, index) => {
                  const isOriginal = index === 0;
                  const isActive = activeFlowVideo === item.url;
                  
                  return (
                    <div key={item.id || index} className="w-full flex flex-col items-center shrink-0">
                      {index > 0 && (
                        /* Arrow */
                        <div className="w-px h-4 bg-gradient-to-b from-white/60 to-white/20 my-2 relative shrink-0">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-solid border-t-white/20 border-t-4 border-x-transparent border-x-[3px] border-b-0" />
                        </div>
                      )}

                      {/* Video Box */}
                      <div className="w-full flex flex-col gap-1 shrink-0">
                        <div
                          className={cn(
                            "w-full aspect-[9/16] max-h-24 md:max-h-32 rounded-xl border overflow-hidden relative group cursor-pointer transition-all duration-300",
                            isActive ? "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "border-white/10 hover:border-white/30"
                          )}
                          onClick={() => setActiveFlowVideo(item.url)}
                        >
                          <video src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          
                          {isOriginal && (
                            /* Clear Button for Original */
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReferenceImage(null);
                                setFlowSequence([]);
                                setActiveFlowVideo(null);
                              }}
                              className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg z-20"
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                          )}

                          <div className="absolute top-1.5 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[6px] font-mono text-white uppercase tracking-wider hidden md:block">
                            {isOriginal ? 'Source' : `Gen ${index}`}
                          </div>

                          <div className="absolute bottom-1.5 right-2 bg-black/60 px-1.5 py-0.5 rounded text-[6px] font-mono text-white tracking-wider">
                            {item.duration}s
                          </div>
                        </div>

                        {/* Display URL and make it copyable/visible */}
                        {!isOriginal && (
                          <div className="w-full px-1 text-center">
                            <span 
                              title={item.url}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(item.url);
                                alert("URL copied to clipboard!");
                              }}
                              className="block text-[7.5px] font-mono text-zinc-500 truncate hover:text-cyan-400 cursor-pointer transition-colors max-w-full"
                            >
                              {item.url}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* If sequence is empty, show empty Original Upload Box */}
                {flowSequence.length === 0 && (
                  <div
                    className="w-full aspect-[9/16] max-h-24 md:max-h-32 rounded-xl border border-white/10 overflow-hidden relative group cursor-pointer transition-all duration-300 shrink-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
                      <Plus className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors mb-1 opacity-0 group-hover:opacity-100" />
                      <span className="text-[8px] font-mono text-zinc-600 uppercase group-hover:text-zinc-400">Original</span>
                    </div>
                  </div>
                )}

                {/* Arrow and Blank prompt/limit indicator box at the end of the sequence */}
                {flowSequence.length > 0 && (
                  <>
                    <div className="w-px h-4 bg-gradient-to-b from-white/60 to-white/20 my-2 relative shrink-0">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-solid border-t-white/20 border-t-4 border-x-transparent border-x-[3px] border-b-0" />
                    </div>

                    <div className="w-full aspect-[9/16] max-h-24 md:max-h-32 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center p-2 text-center bg-white/[0.02] shrink-0 relative">
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-zinc-500 mb-2" />
                      ) : (
                        <span className="text-[9px] md:text-[10px] font-mono text-zinc-400 tracking-widest leading-tight">
                          {getLastVideoDuration() >= 30 
                            ? "30s Limit Reached" 
                            : "Describe what happens next by typing the text below."
                          }
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right 80% */}
              <div className="w-4/5 md:w-[80%] p-4 flex items-center justify-center relative bg-black/40">
                {isGenerating ? (
                  <RevealAnimation isVideo={true} />
                ) : activeFlowVideo ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center relative"
                  >
                    {activeFlowVideo === referenceImageUrl && referenceImage && !referenceImage.type.includes('video') ? (
                      <img
                        src={activeFlowVideo}
                        className="w-full h-full object-contain rounded-2xl shadow-2xl"
                      />
                    ) : (
                      <video
                        src={activeFlowVideo}
                        key={activeFlowVideo}
                        controls
                        autoPlay
                        loop
                        className="w-full h-full object-contain rounded-2xl shadow-2xl"
                      />
                    )}

                    {/* Floating Action Overlay */}
                    {activeFlowVideo === result?.url && (
                      <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                        <button
                          onClick={handleShare}
                          title="Copy URL"
                          className="glass p-3 rounded-full border border-white/20 hover:bg-white hover:text-black text-white transition-all shadow-lg active:scale-95 group"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleDownload}
                          title="Download File"
                          className="glass p-3 rounded-full border border-white/20 hover:bg-white hover:text-black text-white transition-all shadow-lg active:scale-95 group"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-500">
                    <Wand2 className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-[10px] font-mono tracking-[0.2em] uppercase">Flow Sequence Editor</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex w-full h-full items-center justify-center">
              {isGenerating ? (
                <RevealAnimation isVideo={mainMode === 'video'} />
              ) : result ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full p-4 flex flex-col items-center justify-center relative"
                >
                  {result.type === 'video' ? (
                    <video
                      src={result.url}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain rounded-2xl shadow-2xl"
                    />
                  ) : (
                    <img
                      src={result.url}
                      alt="Generated content"
                      className="w-full h-full object-contain rounded-2xl shadow-2xl"
                    />
                  )}

                  {/* Floating Action Overlay */}
                  <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                    <button
                      onClick={handleShare}
                      title="Copy URL"
                      className="glass p-3 rounded-full border border-white/20 hover:bg-white hover:text-black text-white transition-all shadow-lg active:scale-95 group"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDownload}
                      title="Download File"
                      className="glass p-3 rounded-full border border-white/20 hover:bg-white hover:text-black text-white transition-all shadow-lg active:scale-95 group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-500">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-[10px] font-mono tracking-[0.2em]">Asset Synthesis Frame</p>
                </div>
              )}
            </div>
          )}

          {/* Synthesis Error Notification Toast */}
          <AnimatePresence>
            {synthesisError && (
              <div className="absolute top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-full bg-red-950/90 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)] backdrop-blur-md max-w-full text-center"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span className="text-[10px] md:text-[11px] font-mono text-red-200 tracking-wider uppercase font-semibold">
                    {synthesisError}
                  </span>
                  <button 
                    onClick={() => setSynthesisError(null)}
                    className="text-red-400 hover:text-white transition-colors ml-2 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar & Parameters Controls */}
        <div className="shrink-0 relative">

          {/* Generation Settings Popover Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-full left-0 mb-4 w-full glass-dark border border-white/20 rounded-3xl p-3 md:p-6 shadow-[0_15px_60px_rgba(0,0,0,0.9)] z-50 flex flex-col justify-between h-[290px] md:h-[280px]"
              >
                {/* Mode Toggles Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-2.5 shrink-0">
                  <div className="flex items-center gap-1 md:gap-1.5 p-1 bg-white/5 rounded-full border border-white/10 w-fit">
                    {(['image', 'video', 'flow'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setMainMode(mode)}
                        className={cn(
                          "px-3 py-1 md:px-4 md:py-1.5 rounded-full font-mono text-[8px] md:text-[9px] uppercase tracking-widest font-bold transition-all flex items-center gap-1 md:gap-2",
                          mainMode === mode
                            ? "bg-white text-black shadow-lg"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {mode === 'image' && <ImageIcon className="w-2.5 h-2.5 md:w-3 h-3" />}
                        {mode === 'video' && <Video className="w-2.5 h-2.5 md:w-3 h-3" />}
                        {mode === 'flow' && <Wand2 className="w-2.5 h-2.5 md:w-3 h-3" />}
                        {mode}
                      </button>
                    ))}
                  </div>
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300 font-bold hidden md:block">
                    Setting
                  </h3>
                </div>

                {/* Sub Settings Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pt-2 md:pt-3 overflow-y-auto custom-scrollbar">
                  {/* Aspect Ratio */}
                  {mainMode !== 'flow' && (
                    <div>
                      <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-300 mb-2 font-bold opacity-85">Aspect Ratio</p>
                      <div className="grid grid-cols-4 md:grid-cols-2 gap-1 md:gap-2">
                        {ASPECT_RATIOS.map(ratio => {
                          let boxClass = "w-2.5 h-2.5";
                          if (ratio.id === '16:9') boxClass = "w-4 h-2.5";
                          if (ratio.id === '9:16') boxClass = "w-2.5 h-4";
                          if (ratio.id === '4:3') boxClass = "w-3.5 h-2.5";

                          return (
                            <button
                              key={ratio.id}
                              onClick={() => setSelectedAspectRatio(ratio.id)}
                              className={cn(
                                "flex-1 py-1 md:py-1.5 px-1 rounded-lg border flex flex-col items-center justify-center transition-all duration-300",
                                selectedAspectRatio === ratio.id
                                  ? "border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                                  : "border-white/5 hover:border-white/15 text-zinc-400 bg-white/[0.02] hover:text-white"
                              )}
                            >
                              <div className={cn("border-[1px] rounded-[1px] mb-1 opacity-80 transition-colors md:border-[1.5px] md:rounded-[1px] md:mb-1.5", selectedAspectRatio === ratio.id ? "border-white" : "border-zinc-600", boxClass)} />
                              <span className="text-[8px] md:text-[9px] font-mono font-bold tracking-widest">{ratio.id}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Resolution Quality */}
                  {mainMode !== 'flow' && (
                    <div>
                      <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-300 mb-2 font-bold opacity-85">Resolution Quality</p>
                      <div className="grid grid-cols-4 md:grid-cols-2 gap-1 md:gap-2">
                        {QUALITY_OPTIONS.map(quality => (
                          <button
                            key={quality.id}
                            onClick={() => setSelectedQuality(quality.id)}
                            className={cn(
                              "py-1 md:py-1.5 px-1 md:px-2 rounded-lg border flex flex-row md:flex-col items-baseline md:items-center justify-center gap-1 md:gap-0.5 transition-all duration-300",
                              selectedQuality === quality.id
                                ? "border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                                : "border-white/5 hover:border-white/15 text-zinc-400 bg-white/[0.02] hover:text-white"
                            )}
                          >
                            <span className="text-[8px] md:text-[10px] font-mono font-bold">{quality.id}</span>
                            <span className="text-[5.5px] md:text-[7px] font-mono uppercase tracking-wider opacity-60 font-medium">
                              {quality.id === '480p' ? '(SD)' : quality.id === '720p' ? '(HD)' : quality.id === '1080p' ? '(FHD)' : '(UHD)'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Duration Controls */}
                  {mainMode !== 'image' && (
                    <div>
                      <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-300 mb-2 font-bold opacity-85">Temporal Duration</p>
                      <div className="grid grid-cols-3 gap-1 md:gap-2">
                        {(mainMode === 'flow' ? FLOW_DURATION_OPTIONS : VIDEO_DURATION_OPTIONS).map(duration => (
                          <button
                            key={duration.id}
                            onClick={() => mainMode === 'flow' ? setSelectedFlowDuration(duration.id) : setSelectedVideoDuration(duration.id)}
                            className={cn(
                              "py-1 md:py-1.5 px-1 md:px-2 rounded-lg border flex flex-col items-center justify-center transition-all duration-300",
                              (mainMode === 'flow' ? selectedFlowDuration : selectedVideoDuration) === duration.id
                                ? "border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                                : "border-white/5 hover:border-white/15 text-zinc-400 bg-white/[0.02] hover:text-white"
                            )}
                          >
                            <span className="text-[8px] md:text-[10px] font-mono font-bold">{duration.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Popover Action Footer */}
                <div className="flex justify-end pt-3 border-t border-white/5 shrink-0">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-5 py-1.5 md:px-6 md:py-2 bg-white text-black text-[8px] md:text-[9px] font-bold font-mono uppercase tracking-[0.25em] rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    Save
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Synthesis Input Bar Panel */}
          <div className="glass border border-white/10 rounded-full md:rounded-[2.2rem] p-1.5 md:p-2 flex flex-row items-center gap-1.5 md:gap-2 relative z-40 shadow-[0_0_35px_rgba(0,0,0,0.6)]">

            {/* Popover Controls & Reference Upload */}
            <div className="flex items-center gap-1.5 md:gap-2 px-1 md:px-2 shrink-0 border-r border-white/10 pr-2 md:pr-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "p-2 md:p-3.5 rounded-full transition-all border duration-300",
                  showSettings
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "glass text-white hover:bg-white/10 border-transparent hover:border-white/15"
                )}
              >
                {mainMode === 'image' && <ImageIcon className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />}
                {mainMode === 'video' && <Video className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />}
                {mainMode === 'flow' && <Wand2 className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "rounded-full transition-all border duration-300 flex items-center justify-center",
                  referenceImage
                    ? "p-0 bg-transparent border-transparent"
                    : "glass text-white hover:bg-white/10 border-transparent hover:border-white/15 p-2 md:p-3.5"
                )}
              >
                {!referenceImage ? (
                  <Plus className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
                ) : referenceImageUrl ? (
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-md relative group hover:border-white/40 transition-colors">
                    {referenceImage.type.includes('video') ? (
                      <video src={referenceImageUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={referenceImageUrl} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : null}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={mainMode === 'flow' ? 'video/mp4,video/x-m4v,video/*' : 'image/*'}
                onChange={handleImageUpload}
              />

              {referenceImage && (
                <button
                  onClick={() => setReferenceImage(null)}
                  className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4 md:w-4.5 md:h-4.5" />
                </button>
              )}
            </div>

            {/* Prompt Form & Textarea */}
            <div className="flex-1 flex flex-col relative">


              <textarea
                value={mainMode === 'flow' ? flowPrompt : prompt}
                onChange={(e) => mainMode === 'flow' ? setFlowPrompt(e.target.value) : setPrompt(e.target.value)}
                placeholder={mainMode === 'flow' ? "Describe what happens next...." : "Imagine..."}
                className="w-full bg-transparent text-white font-mono text-xs placeholder:text-zinc-600 outline-none resize-none px-2 md:px-4 py-1.5 md:py-3 min-h-[28px] md:min-h-[46px] max-h-32 custom-scrollbar"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>

            {/* Submit Action Button */}
            <div className="shrink-0 flex items-center pr-1 md:pr-1.5">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!prompt && !referenceImage)}
                className="h-8 w-8 md:h-12 md:px-7 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-[10px] font-bold font-mono uppercase tracking-[0.2em] rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 active:scale-95"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Mobile Backdrop Overlay for Gallery */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsGalleryOpen(false)}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: isGalleryOpen ? 320 : 0 }}
        className={cn(
          "glass-dark border-white/10 flex flex-col shrink-0 transition-all duration-500 z-40 lg:relative right-0 shadow-[0_0_50px_rgba(0,0,0,0.8)] lg:shadow-none bg-zinc-950/95 backdrop-blur-md",
          "fixed lg:translate-x-0 border-l top-14 lg:top-0 h-[calc(100dvh-3.5rem)] lg:h-full",
          isGalleryOpen
            ? "translate-x-0 w-full sm:w-80 lg:w-80"
            : "translate-x-full lg:translate-x-0 w-0 border-l-0"
        )}
      >
        {/* Gallery Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-white uppercase flex items-center gap-2">
            History ({history.length})
          </span>
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="p-1.5 hover:bg-white/5 text-zinc-400 hover:text-white rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Gallery Generations Stream */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
          {isLoadingHistory ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
              <ImageIcon className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-[9px] font-mono tracking-[0.18em] leading-relaxed">
                No canvas records.<br />Enter prompt to synthesize.
              </p>
            </div>
          ) : (
            history.map((item) => {
              try {
                const output = JSON.parse(item.output);
                const isVideo = output.type === 'video';
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHistoryItem(item)}
                    className="shrink-0 w-full h-32 rounded-3xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] transition-all duration-300 group/item cursor-pointer relative overflow-hidden flex items-center justify-center shadow-lg"
                  >
                    {output.url && (
                      <div className="absolute inset-0 w-full h-full z-0">
                        {isVideo ? (
                          <video src={output.url} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-90 transition-opacity duration-300" />
                        ) : (
                          <img src={output.url} alt="" className="w-full h-full object-cover opacity-60 group-hover/item:opacity-90 transition-opacity duration-300" />
                        )}
                        <div className="absolute inset-0 bg-black/35 group-hover/item:bg-transparent transition-colors duration-300" />
                      </div>
                    )}

                    {/* Metadata Badge */}
                    <div className="absolute bottom-3 left-3 z-10 text-[8px] font-mono font-bold text-white bg-black/60 px-2 py-0.5 rounded-full truncate max-w-[80%] border border-white/5 group-hover/item:bg-white group-hover/item:text-black transition-colors duration-300 pointer-events-none tracking-widest">
                      {isVideo ? "VIDEO" : "IMAGE"}
                    </div>

                    {/* Floating Delete trigger */}
                    <button
                      onClick={(e) => handleDeleteHistory(e, item.id)}
                      className="absolute top-3 right-3 p-1.5 bg-black/75 text-zinc-400 hover:text-red-400 hover:bg-black/90 rounded-full opacity-0 group-hover/item:opacity-100 transition-all duration-300 z-20 shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              } catch (e) {
                return null;
              }
            })
          )}
        </div>
      </motion.aside>

    </div>
  );
}
