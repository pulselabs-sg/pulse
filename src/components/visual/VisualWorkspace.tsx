import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Settings, Image as ImageIcon, Video, Send, PanelRight,
  X, Sparkles, Wand2, Upload, AlertCircle, Loader2, PlayCircle, Menu, Bot, Terminal, CheckCircle2, Cpu, FileText, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GROK_FEATURES, GrokFeature, ASPECT_RATIOS, QUALITY_OPTIONS, VIDEO_DURATION_OPTIONS, FLOW_DURATION_OPTIONS, AGENT_DURATION_OPTIONS } from '@/lib/visual-constants';
import RevealAnimation from './RevealAnimation';
import { useRouter } from 'next/navigation';

// ── TypewriterText: streams text character-by-character ─────────────────────
function TypewriterText({ text, speed = 18, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    idx.current = 0;
    setDisplayed('');
    setDone(false);
    const timer = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) {
        clearInterval(timer);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[1em] bg-white/70 align-middle animate-pulse ml-[1px]" />}
    </span>
  );
}

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
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (v: boolean) => void;
}

export default function VisualWorkspace({
  onShowPlanModal,
  userState,
  projectId,
  selectedHistoryItem,
  clearSelectedHistory,
  updateSession,
  isSidebarOpen,
  setIsSidebarOpen
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
  const [mainMode, setMainMode] = useState<'image' | 'video' | 'flow' | 'agent'>('image');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>(ASPECT_RATIOS[0].id);
  const [selectedQuality, setSelectedQuality] = useState<string>(QUALITY_OPTIONS[0].id);
  const [selectedVideoDuration, setSelectedVideoDuration] = useState<number>(VIDEO_DURATION_OPTIONS[0].id);
  const [selectedFlowDuration, setSelectedFlowDuration] = useState<number>(FLOW_DURATION_OPTIONS[2].id);
  const [selectedAgentDuration, setSelectedAgentDuration] = useState<number>(AGENT_DURATION_OPTIONS[0].id);
  const [flowPrompt, setFlowPrompt] = useState('');

  // Gallery Sidebar open/close state (default open on PC, closed on mobile)
  const [isGalleryOpen, setIsGalleryOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsGalleryOpen(false);
    }
  }, []);

  useEffect(() => {
    const isFree = userState?.tier === 'FREE';
    if (mainMode === 'image') {
      if (selectedQuality === '480p' || selectedQuality === '720p') {
        setSelectedQuality('1080p');
      } else if (isFree && selectedQuality === '2k') {
        setSelectedQuality('1080p');
      }
    } else {
      if (selectedQuality === '1080p' || selectedQuality === '2k') {
        setSelectedQuality(isFree ? '480p' : '720p');
      } else if (isFree && selectedQuality === '720p') {
        setSelectedQuality('480p');
      }
    }
  }, [mainMode, selectedQuality, userState?.tier]);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [promptIntent, setPromptIntent] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const promptErrTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerError = (message: string) => {
    console.log("Triggering synthesis error toast UI:", message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    setSynthesisError(message);
    errorTimeoutRef.current = setTimeout(() => {
      setSynthesisError(null);
      errorTimeoutRef.current = null;
    }, 5000);
  };

  const triggerPromptError = (message: string) => {
    if (promptErrTimeoutRef.current) clearTimeout(promptErrTimeoutRef.current);
    setPromptError(message);
    promptErrTimeoutRef.current = setTimeout(() => {
      setPromptError(null);
      promptErrTimeoutRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (promptErrTimeoutRef.current) clearTimeout(promptErrTimeoutRef.current);
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

  // Agent State
  interface AgentStep {
    agent: string;
    status: 'idle' | 'working' | 'success' | 'failed';
    message: string;
    reasoning?: string;
  }
  const [agentStatus, setAgentStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [activityLogs, setActivityLogs] = useState<AgentStep[]>([]);
  const [activeMobileTab, setActiveMobileTab] = useState<'log' | 'script' | 'video'>('log');
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [finalScript, setFinalScript] = useState<string | null>(null);
  const [finalPrompts, setFinalPrompts] = useState<string[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the live log terminal to bottom whenever new steps arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activityLogs]);

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
    const isFree = userState?.tier === 'FREE';
    if (isFree) {
      if (mainMode === 'agent') {
        alert("Autonomous Agent Autopilot is only available on paid plans. Please upgrade your plan.");
        onShowPlanModal();
        return;
      }
      if (mainMode === 'flow') {
        alert("Flow Video Extension is only available on paid plans. Please upgrade your plan.");
        onShowPlanModal();
        return;
      }
      if (mainMode === 'image' && selectedQuality === '2k') {
        alert("2K resolution is only available on paid plans. Please upgrade your plan.");
        onShowPlanModal();
        return;
      }
      if (mainMode === 'video' && selectedQuality === '720p') {
        alert("720p HD quality is only available on paid plans. Please upgrade your plan.");
        onShowPlanModal();
        return;
      }
    }

    if (mainMode === 'agent') {
      if (!prompt) return;

      // ── Client-side prompt validation ──────────────────────────────────────
      try {
        const checkRes = await fetch('/api/visual/prompt-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, hasImage: !!referenceImage }),
        });
        const checkData = await checkRes.json();
        if (!checkData.ok) {
          triggerPromptError(checkData.message || 'Prompt validation failed.');
          return;
        }
        // Store detected intent for display and routing hint
        setPromptIntent(checkData.intent || null);
      } catch (checkErr) {
        console.warn('Prompt check failed, proceeding anyway:', checkErr);
      }

      setAgentStatus('running');
      setAgentSteps([
        { agent: 'Bully', status: 'idle', message: 'Waiting to start...' },
        { agent: 'Raffa', status: 'idle', message: 'Waiting to start...' },
        { agent: 'Monker', status: 'idle', message: 'Waiting to start...' },
        { agent: 'Intruder', status: 'idle', message: 'Waiting to start...' },
        { agent: 'Tupac', status: 'idle', message: 'Waiting to start...' },
        { agent: 'Sam', status: 'idle', message: 'Waiting to start...' },
      ]);
      setActivityLogs([]);
      setActiveMobileTab('log');
      setFinalVideoUrl(null);
      setFinalScript(null);
      setFinalPrompts([]);
      setIsDemoMode(false);

      // ── Convert reference image to base64 for agent mode ───────────────────
      let agentReferenceImageBase64: string | null = null;
      if (referenceImage) {
        try {
          agentReferenceImageBase64 = await fileToBase64(referenceImage);
        } catch (encErr) {
          console.warn('Failed to encode reference image for agent:', encErr);
        }
      }

      try {
        const response = await fetch('/api/visual/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            referenceImageBase64: agentReferenceImageBase64,
            intent: promptIntent,
            aspectRatio: selectedAspectRatio,
            quality: selectedQuality,
            duration: selectedAgentDuration,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to run autonomous agent crew');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (part.startsWith('event: ')) {
              const lines = part.split('\n');
              const eventLine = lines[0];
              const dataLine = lines[1];

              if (eventLine && dataLine) {
                const event = eventLine.replace('event: ', '').trim();
                const dataStr = dataLine.replace('data: ', '').trim();
                try {
                  const data = JSON.parse(dataStr);
                  if (event === 'agent_status') {
                    // Early demo mode detection from log content
                    if (data.reasoning && (
                      data.reasoning.includes('DEMO pipeline') ||
                      data.reasoning.includes('Grok API unavailable') ||
                      data.reasoning.includes('Grok API rate limit') ||
                      data.reasoning.includes('DEMO mode')
                    )) {
                      setIsDemoMode(true);
                    }
                    setAgentSteps(prev => {
                      const idx = prev.findIndex(s => s.agent === data.agent);
                      if (idx >= 0) {
                        const newSteps = [...prev];
                        newSteps[idx] = data;
                        return newSteps;
                      } else {
                        return [...prev, data];
                      }
                    });
                    setActivityLogs(prev => [...prev, data]);
                  } else if (event === 'complete') {
                    setFinalVideoUrl(data.videoUrl);
                    setFinalScript(data.script);
                    setFinalPrompts(data.prompts || []);
                    setIsDemoMode(!!data.demoMode);
                    setAgentStatus('completed');
                    setActiveMobileTab('video');

                    // Save to history and update state
                    const hRes = await fetch('/api/history', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        type: 'visual',
                        input: `[iPulse Agent] ${prompt}`,
                        output: JSON.stringify({ type: 'video', url: data.videoUrl }),
                        projectId
                      })
                    });
                    if (hRes.ok) {
                      const newHItem = await hRes.json();
                      setHistory(prev => [newHItem, ...prev]);
                    }
                  }
                } catch (err) {
                  console.error("Error parsing event:", err);
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        setAgentStatus('failed');
        triggerError(err.message || 'Agent pipeline execution failed.');
      }
      return;
    }

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

    // ── Client-side prompt validation (image/video modes) ──────────────────────
    if (prompt) {
      try {
        const checkRes = await fetch('/api/visual/prompt-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, hasImage: !!referenceImage }),
        });
        const checkData = await checkRes.json();
        if (!checkData.ok) {
          triggerPromptError(checkData.message || 'Prompt validation failed.');
          return;
        }
      } catch (checkErr) {
        console.warn('Prompt check failed, proceeding anyway:', checkErr);
      }
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
            quality: selectedQuality,
            aspectRatio: selectedAspectRatio
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
              referenceImageBase64,
              quality: selectedQuality,
              aspectRatio: selectedAspectRatio
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
  if (!projectId) {
    return (
      <div className="flex-1 flex flex-col items-center p-2 gap-2 relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
        {/* Header Hero Area with Video Background */}
        <div className="relative w-full max-w-5xl rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] h-[50vh] md:h-[60vh] flex flex-col justify-end p-8 md:p-16 shrink-0 mt-8">
          {/* Background Video */}
          <video
            src="https://cdn.ipulselabs.net/videos/0526(1).mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Dark Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-0" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-start text-left max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-mono font-bold tracking-[0.25em] text-white text-glow-white mb-4"
            >
              iPulse
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs md:text-sm font-mono text-zinc-300 tracking-wider leading-relaxed mb-8"
            >
              Harness advanced visual synthesis models to generate, animate, and extend visual reality with surgical precision.
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateProject}
              className="px-8 py-3.5 bg-white text-black font-bold font-mono text-xs uppercase tracking-[0.25em] rounded-full hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Create New Project
            </motion.button>
          </div>
        </div>

        <div className="w-full max-w-5xl mt-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
            <h3 className="text-[10px] font-mono text-zinc-500 font-bold tracking-[0.3em] uppercase">
              Active Projects Matrix
            </h3>
            <span className="text-[9px] font-mono text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              {projects.length} Total Projects
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-16">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => router.push(getCleanPath(`/visual/${project.id}`))}
                  className="border border-white/20 rounded-3xl p-6 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-300 cursor-pointer relative group flex flex-col justify-between h-44 overflow-hidden shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div>
                    {/* <div className="flex items-center gap-2 mb-3 text-zinc-400 group-hover:text-white transition-colors duration-300">
                      <Wand2 className="w-4 h-4" />
                      <span className="text-[9px] font-mono tracking-widest uppercase">Visual Workspace</span>
                    </div> */}
                    <h3 className="text-sm font-mono text-white tracking-wider font-bold uppercase truncate pr-8">
                      {project.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between mt-auto z-10">
                    <span className="text-[9px] font-mono text-zinc-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] font-mono tracking-widest font-bold text-white bg-white/10 px-3 py-1.5 rounded-full group-hover:bg-white group-hover:text-black transition-all">
                      OPEN
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
          <div className="flex items-center gap-2">
            {!isSidebarOpen && setIsSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-1.5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-colors"
              >
                <PanelRight className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => router.push(getCleanPath('/visual'))}
              className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-white/10 border border-white/5 hover:border-white/15"
            >
              <X className="w-3 h-3" /> Close Project
            </button>
          </div>

          <button
            onClick={() => setIsGalleryOpen(!isGalleryOpen)}
            className={cn(
              "text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 py-1.5 px-4 rounded-full bg-white/15 border border-white/5 hover:border-white/15 ml-auto",
              isGalleryOpen && "lg:hidden"
            )}
          >
            {isGalleryOpen ? 'Hide History' : `History`}
          </button>
        </div>

        {/* Settings Popover Background Overlay */}
        {showSettings && (
          <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
        )}

        {/* Interactive Synthesis Display Screen */}
        <div className="flex-1 rounded-4xl mb-5 relative overflow-hidden flex">
          {mainMode === 'flow' ? (
            <div className="flex w-full h-full">
              {/* Left 20% */}
              <div className="w-2/6 md:w-[20%] border-r border-white/20 p-3 md:p-4 flex flex-col items-center overflow-y-auto custom-scrollbar relative z-10 gap-1">
                <p className="text-[8px] md:text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-4 shrink-0 text-center">Sequence</p>

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
                      <span className="text-[8px] font-mono text-zinc-500 uppercase group-hover:text-zinc-400">Original</span>
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
              <div className="w-4/5 md:w-[80%] p-4 flex items-center justify-center relative">
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
                    <p className="text-[10px] font-mono tracking-[0.2em]">Flow Sequence Editor</p>
                  </div>
                )}
              </div>
            </div>
          ) : mainMode === 'agent' ? (
            <div className="flex flex-col w-full h-full overflow-hidden relative z-10">

              {/* ── TOP: Horizontal Agent Crew Row ──────────────────────── */}
              <div className="shrink-0 px-5 pt-4 pb-3 border-b border-white/[0.06] relative z-30 overflow-visible">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <span className="text-[9px] font-mono tracking-[0.28em] text-white/40 uppercase select-none">Agent Crew Matrix</span>
                </div>
                <div className="grid grid-cols-3 md:flex md:items-center gap-1.5 md:gap-3 overflow-visible pb-1 md:flex-nowrap">
                  {[
                    {
                      name: 'Bully',
                      fullName: 'Bully',
                      role: 'Gemini 1.5 Flash',
                      image: '/agent-1.png',
                      accent: '#a855f7',
                      tasks: ['Receives the user topic and generates 3–5 unique video concept angles.', 'Selects the most viral-friendly hook and defines tone, audience & style.', 'Outputs a structured concept brief passed to the Research Agent.'],
                    },
                    {
                      name: 'Raffa',
                      fullName: 'Raffa',
                      role: 'Gemini 1.5 Flash',
                      image: '/agent-2.png',
                      accent: '#3b82f6',
                      tasks: ['Queries current trends, statistics and social proof for the chosen concept.', 'Validates accuracy of facts and suggests credible data points.', 'Enriches the concept brief before handing off to the Script Writer.'],
                    },
                    {
                      name: 'Monker',
                      fullName: 'Monker',
                      role: 'Gemini 1.5 Flash',
                      image: '/agent-3.png',
                      accent: '#10b981',
                      tasks: ['Writes a full narration script divided into timed scenes.', 'Optimises pacing for vertical short-form video (15–60 s).', 'Generates voiceover cue text and passes scene breakdown to the Visual Planner.'],
                    },
                    {
                      name: 'Intruder',
                      fullName: 'Intruder',
                      role: 'Gemini 1.5 Flash',
                      image: '/agent-4.png',
                      accent: '#06b6d4',
                      tasks: ['Translates each script scene into a detailed visual prompt.', 'Applies cinematic language: lighting, mood, camera angle and motion.', 'Outputs an ordered list of scene prompts ready for the Media Generator.'],
                    },
                    {
                      name: 'Tupac',
                      fullName: 'Tupac',
                      role: 'Grok Aurora',
                      image: '/agent-5.png',
                      accent: '#f43f5e',
                      tasks: ['Sends each visual prompt to the Grok Aurora image model.', 'Extends each scene into a short video clip via Grok Video API.', 'Handles retries and quality checks before passing assets to the Editor.'],
                    },
                    {
                      name: 'Sam',
                      fullName: 'Sam',
                      role: 'Gemini 1.5 Flash',
                      image: '/agent-6.png',
                      accent: '#f59e0b',
                      tasks: ['Stitches all video clips into a seamless sequence using FFmpeg.', 'Overlays AI-generated voiceover audio aligned to scene timing.', 'Applies final quality review and outputs the completed video file.'],
                    },
                  ].map((agentItem) => {
                    const step = agentSteps.find(s => s.agent === agentItem.fullName);
                    const status = step?.status || 'idle';
                    return (
                      <div key={agentItem.name} className="relative group md:shrink-0 z-30">
                        {/* Horizontal Card */}
                        <motion.div
                          animate={status === 'working' ? { boxShadow: [`0 0 0px ${agentItem.accent}00`, `0 0 10px ${agentItem.accent}33`, `0 0 0px ${agentItem.accent}00`] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 px-1 md:px-3 py-1.5 rounded-xl border cursor-default select-none transition-all duration-300"
                          style={{
                            background: status === 'working' ? `${agentItem.accent}0f` : status === 'success' ? `${agentItem.accent}07` : 'rgba(255,255,255,0.02)',
                            borderColor: status === 'working' ? `${agentItem.accent}60` : status === 'success' ? `${agentItem.accent}30` : 'rgba(255,255,255,0.06)',
                          }}
                        >
                          {/* PFP image */}
                          <div className="w-5 h-5 md:w-7 md:h-7 rounded-md md:rounded-lg border overflow-hidden flex items-center justify-center shrink-0 relative"
                            style={{ borderColor: status !== 'idle' ? `${agentItem.accent}50` : 'rgba(255,255,255,0.12)', background: `${agentItem.accent}15` }}>
                            {agentItem.image ? (
                              <img src={agentItem.image} alt={agentItem.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-mono font-bold" style={{ color: agentItem.accent }}>{agentItem.name.charAt(0)}</span>
                            )}
                            {status === 'working' && (
                              <span className="absolute inset-0 rounded-full border animate-spin"
                                style={{ borderColor: `${agentItem.accent}40 transparent transparent transparent` }} />
                            )}
                          </div>

                          {/* Name and Status */}
                          <div className="flex flex-col items-center md:items-start min-w-0 md:pr-1.5 w-full">
                            <span className="text-[7px] md:text-[9.5px] font-mono font-semibold tracking-widest md:tracking-wider text-white/80 truncate w-full text-center md:text-left leading-none mb-0.5">{agentItem.name}</span>
                            <div className="flex items-center justify-center md:justify-start gap-1 w-full">
                              <span className="w-1 h-1 rounded-full shrink-0"
                                style={{
                                  background: status === 'working' ? agentItem.accent : status === 'success' ? '#10b981' : 'rgba(255,255,255,0.2)',
                                  boxShadow: status === 'working' ? `0 0 4px ${agentItem.accent}` : status === 'success' ? '0 0 4px #10b981' : 'none'
                                }}
                              />
                              <span className="text-[6.5px] font-mono tracking-widest leading-none font-bold"
                                style={{
                                  color: status === 'working' ? '#fff' : status === 'success' ? '#10b981' : 'rgba(255,255,255,0.3)',
                                }}>
                                {status === 'working' ? 'Active' : status === 'success' ? 'Ready' : 'Sleeping'}
                              </span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Hover Tooltip */}
                        <div className="absolute rounded-2xl left-1/2 top-full mt-2 -translate-x-1/2 w-52 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 scale-95 group-hover:scale-100">
                          <div className="rounded-2xl border p-4 backdrop-blur-md"
                            style={{ background: 'rgba(8,8,16,0.98)', borderColor: `${agentItem.accent}30` }}>
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.07]">
                              {/* Larger PFP in tooltip */}
                              <div className="w-9 h-9 rounded-lg border overflow-hidden flex items-center justify-center shrink-0"
                                style={{ borderColor: `${agentItem.accent}50`, background: `${agentItem.accent}18` }}>
                                {agentItem.image ? (
                                  <img src={agentItem.image} alt={agentItem.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[11px] font-mono font-bold" style={{ color: agentItem.accent }}>{agentItem.name.charAt(0)}</span>
                                )}
                              </div>
                              <div>
                                <p className="text-[10px] font-mono font-bold text-white tracking-wider leading-none">{agentItem.fullName}</p>
                              </div>
                            </div>
                            <ul className="flex flex-col gap-2">
                              {agentItem.tasks.map((t, i) => (
                                <li key={i} className="flex items-start gap-2 text-[9px] font-mono text-white/50 leading-relaxed">
                                  <span className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: agentItem.accent }} />
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 overflow-hidden">
                            <div className="w-3 h-3 rotate-45 border-l border-t mx-auto -mt-1.5" style={{ background: 'rgba(8,8,16,0.98)', borderColor: `${agentItem.accent}30` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile tabs for results/log */}
              {agentStatus !== 'idle' && (
                <div className="flex lg:hidden border-b border-white/[0.06] bg-black/40 shrink-0 select-none">
                  <button
                    onClick={() => setActiveMobileTab('log')}
                    className={cn(
                      "flex-1 py-3 text-[9px] font-mono tracking-widest uppercase transition-all border-b-2 text-center",
                      activeMobileTab === 'log'
                        ? "border-white text-white font-bold bg-white/[0.02]"
                        : "border-transparent text-white/40"
                    )}
                  >
                    Activity Log
                  </button>
                  {agentStatus === 'completed' && finalVideoUrl && (
                    <>
                      <button
                        onClick={() => setActiveMobileTab('script')}
                        className={cn(
                          "flex-1 py-3 text-[9px] font-mono tracking-widest uppercase transition-all border-b-2 text-center",
                          activeMobileTab === 'script'
                            ? "border-white text-white font-bold bg-white/[0.02]"
                            : "border-transparent text-white/40"
                        )}
                      >
                        Screenplay
                      </button>
                      <button
                        onClick={() => setActiveMobileTab('video')}
                        className={cn(
                          "flex-1 py-3 text-[9px] font-mono tracking-widest uppercase transition-all border-b-2 text-center",
                          activeMobileTab === 'video'
                            ? "border-white text-white font-bold bg-white/[0.02]"
                            : "border-transparent text-white/40"
                        )}
                      >
                        Video
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* ── BOTTOM: Two-pane work area ───────────────────────────── */}
              <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden min-h-0">

                {/* LEFT 40% — Activity Log */}
                <div className={cn("w-full lg:w-[40%] flex-col h-full lg:border-r border-white/[0.06] overflow-hidden min-h-0", activeMobileTab === 'log' ? 'flex' : 'hidden lg:flex')}>
                  {agentStatus === 'idle' ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-5">
                      <motion.div
                        animate={{ scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-14 h-14 rounded-full border border-white/40 flex items-center justify-center bg-white/[0.02]"
                      >
                        <Bot className="w-6 h-6 text-white/60" />
                      </motion.div>
                      <div className="max-w-xs">
                        <h3 className="text-[11px] font-mono font-bold text-white/30 uppercase tracking-[0.3em] mb-2">iPulse Agent Console</h3>
                        <p className="text-[9px] font-mono text-white/30 tracking-wider leading-relaxed">
                          Describe a video topic and the crew will brainstorm, research, script, plan, generate and edit — fully autonomously.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                      {/* Chat header */}
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] shrink-0">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-white/25" />
                          <span className="text-[8px] font-mono tracking-[0.22em] text-white/45 uppercase select-none">Activity Log</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDemoMode && (
                            <span className="text-[6.5px] font-mono font-bold uppercase tracking-widest text-amber-900 bg-amber-400 px-2 py-px rounded-full">Demo</span>
                          )}
                          {agentStatus === 'running' && (
                            <span className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.9)] animate-pulse" />
                              <span className="text-[7.5px] font-mono text-emerald-400/60 tracking-widest uppercase">Live</span>
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col px-4 py-3 gap-0">
                        <AnimatePresence initial={false}>
                          {(() => {
                            const groups: any[] = [];
                            const AGENT_PROFILES = {
                              'Bully': { image: '/agent-1.png', accent: '#a855f7' },
                              'Raffa': { image: '/agent-2.png', accent: '#3b82f6' },
                              'Monker': { image: '/agent-3.png', accent: '#10b981' },
                              'Intruder': { image: '/agent-4.png', accent: '#06b6d4' },
                              'Tupac': { image: '/agent-5.png', accent: '#f43f5e' },
                              'Sam': { image: '/agent-6.png', accent: '#f59e0b' },
                            };

                            const filteredLogs = activityLogs.filter(step => {
                              const bodyText = step.reasoning || step.message || '';
                              if (!bodyText) return false;
                              const t = bodyText.toLowerCase();
                              return !(
                                t.includes('task queued') ||
                                t.includes('polling status') ||
                                t.includes('non-200 polling') ||
                                t.includes('tool execution completed') ||
                                t.includes('tools completed') ||
                                t.startsWith('tool:') ||
                                t.includes('output: error') ||
                                t.includes('[finalize]') ||
                                t.includes('agent final answer') ||
                                t.includes('frame_index:') ||
                                t.includes('moviepy -') ||
                                t === 'working. working' ||
                                t === 'working.' ||
                                t.startsWith('agent:')
                              );
                            });

                            filteredLogs.forEach(step => {
                              const isSystem = step.agent === 'System';
                              const profile = (AGENT_PROFILES as any)[step.agent];
                              const pfpUrl = profile?.image || '';
                              const accent = profile?.accent || (isSystem ? '#fbbf24' : '#9ca3af');

                              if (groups.length > 0 && groups[groups.length - 1].agent === step.agent) {
                                groups[groups.length - 1].messages.push(step);
                              } else {
                                groups.push({
                                  agent: step.agent,
                                  isSystem,
                                  pfpUrl,
                                  accent,
                                  messages: [step]
                                });
                              }
                            });

                            return groups.map((group, groupIdx) => {
                              const initials = group.isSystem ? '!!' : group.agent.split(' ').map((w: string) => w[0]).slice(0, 2).join('');
                              return (
                                <motion.div
                                  key={group.agent + groupIdx}
                                  initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                  className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-b-0"
                                >
                                  {/* PFP Panel */}
                                  <div className={cn(
                                    'w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[9px] font-mono font-bold uppercase border overflow-hidden mt-0.5',
                                    group.isSystem ? 'bg-amber-500/15 border-amber-500/25 text-amber-400' : 'bg-white/[0.04] border-white/10 text-white/35'
                                  )} style={{ borderColor: !group.isSystem ? `${group.accent}40` : undefined }}>
                                    {group.pfpUrl ? (
                                      <img src={group.pfpUrl} alt={group.agent} className="w-full h-full object-cover" />
                                    ) : (
                                      initials
                                    )}
                                  </div>

                                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className={cn('text-[9.5px] font-mono font-bold tracking-wider', group.isSystem ? 'text-amber-400' : 'text-white/80')}
                                        style={{ color: !group.isSystem ? group.accent : undefined }}>
                                        {group.isSystem ? 'System' : group.agent}
                                      </span>
                                    </div>

                                    <div className="flex flex-col gap-2.5 mt-1">
                                      {group.messages.map((step: any, msgIdx: number) => {
                                        const isLastOverall = groupIdx === groups.length - 1 && msgIdx === group.messages.length - 1;
                                        const bodyText = step.reasoning ? step.reasoning : step.message;

                                        let statusBadgeText = step.message;
                                        if (statusBadgeText === 'working' || statusBadgeText === 'working. working') statusBadgeText = 'thinking...';
                                        if (statusBadgeText === 'success') statusBadgeText = 'completed';

                                        let showBadge = false;
                                        if (statusBadgeText && statusBadgeText.toLowerCase() !== bodyText.toLowerCase()) {
                                          if (msgIdx === 0) {
                                            showBadge = true;
                                          } else {
                                            const prevStep = group.messages[msgIdx - 1];
                                            let prevBadgeText = prevStep.message;
                                            if (prevBadgeText === 'working' || prevBadgeText === 'working. working') prevBadgeText = 'thinking...';
                                            if (prevBadgeText === 'success') prevBadgeText = 'completed';
                                            if (statusBadgeText !== prevBadgeText) {
                                              showBadge = true;
                                            }
                                          }
                                        }

                                        return (
                                          <div key={msgIdx} className="flex flex-col gap-1.5">
                                            {showBadge && (
                                              <div className="flex items-center gap-1.5">
                                                <span className={cn(
                                                  'text-[7px] font-mono uppercase tracking-widest px-1.5 py-px rounded-full border',
                                                  step.status === 'working' ? 'text-white/40 border-white/10 bg-white/[0.03]' :
                                                    step.status === 'success' ? 'text-emerald-400/70 border-emerald-500/20 bg-emerald-500/[0.04]' :
                                                      'text-amber-400/70 border-amber-500/20'
                                                )}>
                                                  {statusBadgeText}
                                                </span>
                                              </div>
                                            )}
                                            <p className={cn('text-[10.5px] leading-[1.75] font-sans whitespace-pre-line select-text', group.isSystem ? 'text-amber-200/70' : 'text-white/75')}>
                                              {isLastOverall ? <TypewriterText text={bodyText} speed={10} /> : bodyText}
                                            </p>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            });
                          })()}
                        </AnimatePresence>

                        {agentStatus === 'running' && agentSteps.filter(s => s.status === 'working').length > 0 && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 pl-8 py-2.5">
                            <span className="flex gap-1">
                              {[0, 0.18, 0.36].map((d, i) => (
                                <motion.span key={i} className="w-1 h-1 rounded-full bg-white/20"
                                  animate={{ opacity: [0.2, 0.7, 0.2] }}
                                  transition={{ duration: 1.1, delay: d, repeat: Infinity }} />
                              ))}
                            </span>
                            <span className="text-[8px] font-mono text-white/18 tracking-wider">
                              {agentSteps.find(s => s.status === 'working')?.agent} is thinking…
                            </span>
                          </motion.div>
                        )}

                        <div ref={logEndRef} className="h-2 shrink-0" />
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT 60% — Output: video + screenplay */}
                <div className={cn("flex-1 flex-col h-full overflow-hidden min-h-0", activeMobileTab !== 'log' ? 'flex' : 'hidden lg:flex')}>
                  {(agentStatus === 'idle' || agentStatus === 'running') ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                      {agentStatus === 'running' ? (
                        <motion.div className="flex flex-col items-center gap-4 text-center">
                          <div className="relative w-16 h-16">
                            <motion.div className="absolute inset-0 rounded-full border border-white/8"
                              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }} transition={{ duration: 2.2, repeat: Infinity }} />
                            <motion.div className="absolute inset-0 rounded-full border border-white/8"
                              animate={{ scale: [1, 1.6], opacity: [0.4, 0] }} transition={{ duration: 2.2, delay: 0.7, repeat: Infinity }} />
                            <div className="absolute inset-0 rounded-full border border-white/8 flex items-center justify-center bg-white/[0.02]">
                              <Cpu className="w-5 h-5 text-white/25" />
                            </div>
                          </div>
                          <div>
                            <p className="text-[9.5px] font-mono text-white/35 tracking-[0.25em] uppercase mb-1">Processing…</p>
                            <p className="text-[8px] font-mono text-white/15 tracking-wider">Output will appear here when the pipeline completes</p>
                          </div>
                        </motion.div>
                      ) : (
                        <p className="text-[8.5px] font-mono text-white/40 tracking-[0.28em] uppercase">Script & Video Output</p>
                      )}
                    </div>
                  ) : agentStatus === 'completed' && finalVideoUrl ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full overflow-hidden min-h-0">

                      {isDemoMode && (
                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 border-b border-amber-500/15 px-5 py-3 shrink-0" style={{ background: 'rgba(245,158,11,0.05)' }}>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-px" />
                          <p className="text-[8.5px] font-mono text-amber-300/55 leading-relaxed tracking-wider">
                            Demo Mode — Grok quota exhausted. Video below is a placeholder.
                          </p>
                        </motion.div>
                      )}

                      {/* Screenplay on left, Video on right (side by side on lg) */}
                      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden min-h-0">

                        {/* Screenplay panel */}
                        <div className={cn("w-full lg:w-[50%] flex-col lg:border-r border-white/[0.06] overflow-hidden min-h-0", activeMobileTab === 'script' ? 'flex' : 'hidden lg:flex')}>
                          <div className="px-4 py-2.5 border-b border-white/[0.06] shrink-0">
                            <span className="text-[7.5px] font-mono tracking-[0.25em] text-white/45 uppercase">Screenplay Script</span>
                          </div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 flex flex-col gap-5">
                            {finalScript && (
                              <pre className="text-[10px] font-mono text-white/70 whitespace-pre-line leading-[2] tracking-wide select-all">{finalScript}</pre>
                            )}
                            {finalPrompts.length > 0 && (
                              <div>
                                <p className="text-[7px] font-mono font-bold text-white/40 uppercase tracking-[0.3em] mb-3">Scene Prompts</p>
                                <div className="flex flex-col gap-2">
                                  {finalPrompts.map((p, idx) => (
                                    <div key={idx} className="rounded-xl border border-white/[0.05] p-3" style={{ background: 'rgba(255,255,255,0.015)' }}>
                                      <span className="text-[7px] font-mono font-bold uppercase tracking-widest text-white/40 block mb-1.5">Scene {idx + 1}</span>
                                      <p className="text-[9.5px] font-mono text-white/70 leading-relaxed select-all">"{p}"</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Video panel */}
                        <div className={cn("flex-1 flex-col overflow-hidden min-h-0", activeMobileTab === 'video' ? 'flex' : 'hidden lg:flex')} style={{ background: 'rgba(0,0,0,0.35)' }}>
                          <div className="px-4 py-2.5 border-b border-white/[0.06] shrink-0 flex items-center justify-between">
                            <span className="text-[7.5px] font-mono tracking-[0.25em] text-white/45 uppercase">Video Output</span>
                            <div className="flex gap-1.5">
                              <button onClick={handleShare} title="Copy URL"
                                className="p-1.5 rounded-lg border border-white/20 hover:bg-white/8 text-white/45 hover:text-white/70 transition-all">
                                <Upload className="w-3 h-3" />
                              </button>
                              <button onClick={() => { window.location.href = `/api/visual/download?url=${encodeURIComponent(finalVideoUrl)}`; }}
                                title="Download" className="p-1.5 rounded-lg border border-white/20 hover:bg-white/8 text-white/45 hover:text-white/70 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 flex items-center justify-center p-5 overflow-hidden min-h-0">
                            <video src={finalVideoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" />
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                      <AlertCircle className="w-7 h-7 text-red-500/50" />
                      <h3 className="text-[9.5px] font-mono font-bold text-white/40 uppercase tracking-[0.25em]">Pipeline Failed</h3>
                      <p className="text-[8px] font-mono text-white/20 max-w-xs tracking-wider leading-relaxed">
                        Something went wrong during agent orchestration. Verify API credentials and local setup.
                      </p>
                    </div>
                  )}
                </div>

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

          {/* Prompt Validation Error Toast — shown before API call */}
          <AnimatePresence>
            {promptError && (
              <div className="absolute top-4 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-full bg-amber-950/90 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.25)] backdrop-blur-md max-w-full text-center"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span className="text-[10px] md:text-[11px] font-mono text-amber-200 tracking-wider uppercase font-semibold">
                    {promptError}
                  </span>
                  <button
                    onClick={() => setPromptError(null)}
                    className="text-amber-400 hover:text-white transition-colors ml-2 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

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
                className="absolute bottom-full left-0 mb-4 w-full glass-dark backdrop-blur-sm border border-white/20 rounded-3xl p-3 md:p-6 shadow-[0_15px_60px_rgba(0,0,0,0.9)] z-50 flex flex-col justify-between h-[290px] md:h-[280px]"
              >
                {/* Mode Toggles Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-2.5 shrink-0">
                  <div className="flex items-center gap-1 md:gap-1.5 p-1 bg-white/5 rounded-full border border-white/10 w-fit">
                    {(['image', 'video', 'flow', 'agent'] as const).map(mode => {
                      const isFree = userState?.tier === 'FREE';
                      const isLocked = isFree && (mode === 'flow' || mode === 'agent');
                      return (
                        <button
                          key={mode}
                          onClick={() => {
                            if (isLocked) {
                              alert(`${mode === 'flow' ? 'Flow Video Extension' : 'Autonomous Agent Autopilot'} is only available on paid plans. Please upgrade your plan.`);
                              onShowPlanModal();
                              return;
                            }
                            setMainMode(mode);
                          }}
                          className={cn(
                            "px-3 py-1 md:px-4 md:py-1.5 rounded-full font-mono text-[8px] md:text-[9px] uppercase tracking-widest font-bold transition-all flex items-center gap-1 md:gap-2",
                            mainMode === mode
                              ? "bg-white text-black shadow-lg"
                              : "text-zinc-400 hover:text-white hover:bg-white/5",
                            isLocked && "opacity-60"
                          )}
                        >
                          {mode === 'image' && <ImageIcon className="w-2.5 h-2.5 md:w-3 h-3" />}
                          {mode === 'video' && <Video className="w-2.5 h-2.5 md:w-3 h-3" />}
                          {mode === 'flow' && <Wand2 className="w-2.5 h-2.5 md:w-3 h-3" />}
                          {mode === 'agent' && <Bot className="w-2.5 h-2.5 md:w-3 h-3" />}
                          {mode}
                          {isLocked && <Lock className="w-2.5 h-2.5 ml-1 text-zinc-400" />}
                        </button>
                      );
                    })}
                  </div>
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300 font-bold hidden md:block">
                    Setting
                  </h3>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pt-2 md:pt-3 overflow-y-auto custom-scrollbar">
                  {mainMode === 'agent' ? null : null}
                  <>
                    {/* Aspect Ratio */}
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
                              <div className={cn("border-[2px] rounded-[1px] mb-1 opacity-80 transition-colors md:border-[1.5px] md:rounded-[2px] md:mb-1.5", selectedAspectRatio === ratio.id ? "border-white" : "border-zinc-400", boxClass)} />
                              <span className="text-[8px] md:text-[9px] font-mono font-bold tracking-widest">{ratio.id}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Resolution Quality */}
                    <div>
                      <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-300 mb-2 font-bold opacity-85">Resolution Quality</p>
                      <div className="grid grid-cols-4 md:grid-cols-2 gap-1 md:gap-2">
                        {QUALITY_OPTIONS.filter(q => mainMode === 'image' ? ['1080p', '2k'].includes(q.id) : ['480p', '720p'].includes(q.id)).map(quality => {
                          const isFree = userState?.tier === 'FREE';
                          const isLocked = isFree && (
                            (mainMode === 'image' && quality.id === '2k') ||
                            (mainMode !== 'image' && quality.id === '720p')
                          );
                          return (
                            <button
                              key={quality.id}
                              onClick={() => {
                                if (isLocked) {
                                  alert(`${quality.id === '2k' ? '2K resolution' : '720p HD quality'} is only available on paid plans. Please upgrade your plan.`);
                                  onShowPlanModal();
                                  return;
                                }
                                setSelectedQuality(quality.id);
                              }}
                              className={cn(
                                "py-1 md:py-1.5 px-1 md:px-2 rounded-lg border flex flex-row md:flex-col items-baseline md:items-center justify-center gap-1 md:gap-0.5 transition-all duration-300",
                                selectedQuality === quality.id
                                  ? "border-white bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                                  : "border-white/5 hover:border-white/15 text-zinc-400 bg-white/[0.02] hover:text-white",
                                isLocked && "opacity-60"
                              )}
                            >
                              <span className="text-[8px] md:text-[10px] font-mono font-bold flex items-center justify-center gap-1">
                                {quality.id}
                                {isLocked && <Lock className="w-2.5 h-2.5 text-zinc-400" />}
                              </span>
                              <span className="text-[5.5px] md:text-[7px] font-mono uppercase tracking-wider opacity-60 font-medium">
                                {quality.id === '480p' ? '(SD)' : quality.id === '720p' ? '(HD)' : quality.id === '1080p' ? '(FHD)' : '(UHD)'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {mainMode !== 'image' && (
                      <div>
                        <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.25em] text-zinc-300 mb-2 font-bold opacity-85">Temporal Duration</p>
                        <div className="grid grid-cols-3 gap-1 md:gap-2">
                          {(mainMode === 'agent' ? AGENT_DURATION_OPTIONS : mainMode === 'flow' ? FLOW_DURATION_OPTIONS : VIDEO_DURATION_OPTIONS).map(duration => (
                            <button
                              key={duration.id}
                              onClick={() => {
                                if (mainMode === 'agent') setSelectedAgentDuration(duration.id);
                                else if (mainMode === 'flow') setSelectedFlowDuration(duration.id);
                                else setSelectedVideoDuration(duration.id);
                              }}
                              className={cn(
                                "py-1 md:py-1.5 px-1 md:px-2 rounded-lg border flex flex-col items-center justify-center transition-all duration-300",
                                (mainMode === 'agent' ? selectedAgentDuration : mainMode === 'flow' ? selectedFlowDuration : selectedVideoDuration) === duration.id
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
                  </>
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
          <div className="rounded-full md:rounded-[2.2rem] p-1.5 md:p-2 flex flex-row items-center gap-1.5 md:gap-2 relative z-40">

            {/* Popover Controls & Reference Upload */}
            <div className="flex items-center gap-1.5 md:gap-2 px-1 md:px-2 shrink-0 border-r border-white/30 pr-2 md:pr-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "p-2 md:p-3.5 rounded-xl md:rounded-2xl transition-all border duration-300",
                  showSettings
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    : "text-white hover:bg-white/10 border-white/15 hover:border-white/15"
                )}
              >
                {mainMode === 'image' && <ImageIcon className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />}
                {mainMode === 'video' && <Video className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />}
                {mainMode === 'flow' && <Wand2 className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />}
                {mainMode === 'agent' && <Bot className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "rounded-xl md:rounded-2xl transition-all border duration-300 flex items-center justify-center",
                  referenceImage
                    ? "p-0 bg-transparent border-transparent"
                    : "text-white hover:bg-white/10 border-white/15 hover:border-white/15 p-2 md:p-3.5"
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
                accept={mainMode === 'flow' ? 'video/mp4,video/x-m4v,video/*' : 'image/png,image/jpeg,image/webp,image/gif'}
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
                placeholder={mainMode === 'flow' ? "Describe what happens next...." : "Enter your creative ideas."}
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
                disabled={isGenerating || (mainMode !== 'flow' && !prompt && !referenceImage)}
                className="h-8 w-8 md:h-12 md:w-12 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl md:rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center active:scale-95"
              >
                {isGenerating ? <Loader2 className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 animate-spin" /> : <Send className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />}
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
          "border-white/10 flex flex-col shrink-0 transition-all duration-500 z-40 lg:relative right-0 backdrop-blur-sm",
          "fixed lg:translate-x-0 border-l top-0 h-full",
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
              <p className="text-[10px] font-mono tracking-[0.18em] leading-relaxed">
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
