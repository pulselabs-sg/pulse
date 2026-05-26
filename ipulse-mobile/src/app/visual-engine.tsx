/**
 * Visual Engine — Mobile App
 * Layout mirrors web app exactly:
 * - Projects Hub: centered hero + project cards
 * - Workspace: full-screen black canvas + bottom input bar + settings bottom sheet + right history panel
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
  PanResponder,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync, EncodingType, downloadAsync, documentDirectory } from 'expo-file-system/legacy';
import {
  Settings, Image as ImageIcon, Video, LayersPlus, Bot, Zap,
  History, LayoutDashboard, User, Crown, X, ChevronDown, Download, Share, Copy, Lock
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import api, { BASE_URL, uploadFile } from '../services/api';
import { clearSessionToken } from '../services/auth';
import {
  generateVideo,
  checkVideoStatus,
  generateImage,
  checkPrompt,
  fetchProjects,
  createProject,
  deleteProject,
  fetchVisualHistory,
  saveHistoryItem,
  deleteHistoryItem,
  runAgentStream,
  renameProject,
} from '../services/video';
import WaveformLoader from '../components/WaveformLoader';
import RevealAnimation from '../components/RevealAnimation';
import { COLORS, SHADOWS, S } from '../constants/theme';

const { width: SW, height: SH } = Dimensions.get('window');
const HISTORY_WIDTH = Math.min(SW * 0.78, 310);

type MainMode = 'image' | 'video' | 'flow' | 'agent';
interface Project { id: string; name: string; createdAt: string; }
interface HistoryItem { id: string; input: string; output: string; createdAt: string; }

const ASPECT_RATIOS = [
  { id: '16:9', w: 18, h: 11 },
  { id: '9:16', w: 11, h: 18 },
  { id: '1:1', w: 14, h: 14 },
  { id: '4:3', w: 17, h: 13 },
];
const QUALITY_OPTIONS = [
  { id: '480p', label: '(SD)' },
  { id: '720p', label: '(HD)' },
  { id: '1080p', label: '(FHD)' },
  { id: '2k', label: '(UHD)' },
];
const VIDEO_DURATION_OPTIONS = ['5s', '10s', '15s'];
const FLOW_DURATION_OPTIONS = ['2s', '4s', '6s', '8s', '10s'];
const AGENT_DURATION_OPTIONS = ['30s', '40s', '50s'];

const AGENT_CREW = [
  { name: 'Bully', role: 'Gemini 1.5 Flash', accent: '#a855f7', image: 'agent-1.png', tasks: ['Generates video concepts.', 'Defines hook & style.'] },
  { name: 'Raffa', role: 'Gemini 1.5 Flash', accent: '#3b82f6', image: 'agent-2.png', tasks: ['Validates trend data.', 'Enriches concept brief.'] },
  { name: 'Monker', role: 'Gemini 1.5 Flash', accent: '#10b981', image: 'agent-3.png', tasks: ['Writes timed script scenes.', 'Optimizes vertical pacing.'] },
  { name: 'Intruder', role: 'Gemini 1.5 Flash', accent: '#06b6d4', image: 'agent-4.png', tasks: ['Creates detailed scene prompts.', 'Applies cinematic motion.'] },
  { name: 'Tupac', role: 'Grok Aurora', accent: '#f43f5e', image: 'agent-5.png', tasks: ['Generates scene images.', 'Synthesizes video clips.'] },
  { name: 'Sam', role: 'Gemini 1.5 Flash', accent: '#f59e0b', image: 'agent-6.png', tasks: ['Stitches clips with audio.', 'Performs final render review.'] },
];

const HistoryVideoThumb = ({ url, style }: { url: string; style: any }) => {
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(url, { time: 1000 });
        if (mounted) setThumb(uri);
      } catch (e) {
        // Silently fail to fallback
      }
    })();
    return () => { mounted = false; };
  }, [url]);

  if (thumb) return <Image source={{ uri: thumb }} style={style} resizeMode="cover" />;
  return (
    <View style={[style, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' }]}>
      <Video color="rgba(255,255,255,0.3)" size={24} />
    </View>
  );
};

const PromptBar = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Prompt copied to clipboard!');
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(20, 20, 25, 0.85)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setExpanded(!expanded)} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, color: 'rgba(255,255,255,0.9)', fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16, paddingRight: 4 }} numberOfLines={expanded ? undefined : 1}>
          {text}
        </Text>

        {!expanded && (
          <LinearGradient
            colors={['rgba(20,20,25,0)', 'rgba(20,20,25,1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', right: 28, top: 0, bottom: 0, width: 40 }}
            pointerEvents="none"
          />
        )}

        <TouchableOpacity onPress={handleCopy} style={{ padding: 6, marginLeft: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, zIndex: 10 }}>
          <Copy color="#fff" size={12} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

export default function VisualEngineScreen() {
  const insets = useSafeAreaInsets();
  const [userState, setUserState] = useState({ tier: 'FREE', usage: 0, limit: 40000 });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Workspace state
  const [mainMode, setMainMode] = useState<MainMode>('image');
  const [prompt, setPrompt] = useState('');
  const [flowPrompt, setFlowPrompt] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [selectedQuality, setSelectedQuality] = useState('480p');
  const [selectedDuration, setSelectedDuration] = useState('5s');
  const [referenceImage, setReferenceImage] = useState<{ uri: string; name: string; type: string; base64: string } | null>(null);

  // Synchronize duration and quality options when mainMode changes
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

    if (mainMode === 'video') {
      if (!VIDEO_DURATION_OPTIONS.includes(selectedDuration)) {
        setSelectedDuration('5s');
      }
    } else if (mainMode === 'flow') {
      if (!FLOW_DURATION_OPTIONS.includes(selectedDuration)) {
        setSelectedDuration('6s');
      }
    } else if (mainMode === 'agent') {
      if (!AGENT_DURATION_OPTIONS.includes(selectedDuration)) {
        setSelectedDuration('30s');
      }
    }
  }, [mainMode, selectedQuality, userState?.tier]);


  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStage, setGenStage] = useState(0);
  const [genElapsed, setGenElapsed] = useState(0);
  const [result, setResult] = useState<{ type: 'video' | 'image'; url: string } | null>(null);
  const [submittedPrompt, setSubmittedPrompt] = useState('');

  // Agent state
  const [agentStatus, setAgentStatus] = useState<'idle' | 'running' | 'done' | 'failed'>('idle');
  const [agentSteps, setAgentSteps] = useState<any[]>([]);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [finalScript, setFinalScript] = useState<string | null>(null);

  // Flow state
  const [flowSequence, setFlowSequence] = useState<any[]>([]);
  const [activeFlowVideo, setActiveFlowVideo] = useState<string | null>(null);

  // History
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const isHistoryOpen = useRef(false);
  const historyAnim = useRef(new Animated.Value(HISTORY_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [historyVisible, setHistoryVisible] = useState(false);

  // Settings panel — use Modal so it never renders/peeks when closed
  const [showSettings, setShowSettings] = useState(false);
  const settingsAnim = useRef(new Animated.Value(500)).current;

  // Segmented engine switcher animation (Visual = 0, Audio = 1)
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Sidebar drawer
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-280)).current;
  const sidebarOverlay = useRef(new Animated.Value(0)).current;

  // User
  const [sessionUser, setSessionUser] = useState<{ name: string; email: string; image?: string } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeAgentTab, setActiveAgentTab] = useState<'log' | 'script' | 'video'>('log');
  const logScrollRef = useRef<ScrollView>(null);

  // Gesture & Preview states
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<{ type: string; url: string } | null>(null);

  const historyItemsRef = useRef(historyItems);
  useEffect(() => {
    historyItemsRef.current = historyItems;
  }, [historyItems]);

  const resultRef = useRef(result);
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  const swipeAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (resultRef.current && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)) {
          // Allow dragging effect
          swipeAnim.setValue({ x: 0, y: gestureState.dy });
          opacityAnim.setValue(Math.max(0.3, 1 - Math.abs(gestureState.dy) / 400));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { dy, dx } = gestureState;

        const snapBack = () => {
          Animated.parallel([
            Animated.spring(swipeAnim, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
            Animated.spring(opacityAnim, { toValue: 1, useNativeDriver: true })
          ]).start();
        };

        if (Math.abs(dy) < 5 && Math.abs(dx) < 5) {
          // Tap -> Preview
          if (resultRef.current) {
            setPreviewItem(resultRef.current);
            setShowPreviewModal(true);
          }
          snapBack();
          return;
        }

        if (Math.abs(dy) > Math.abs(dx)) {
          if (dy > 60) {
            // Swipe Down -> Clear
            Animated.parallel([
              Animated.timing(swipeAnim, { toValue: { x: 0, y: Dimensions.get('window').height }, duration: 250, useNativeDriver: true }),
              Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true })
            ]).start(() => {
              setResult(null);
              swipeAnim.setValue({ x: 0, y: 0 });
              opacityAnim.setValue(1);
            });
          } else if (dy < -60) {
            // Swipe Up -> Previous (older)
            if (!resultRef.current) { snapBack(); return; }
            const items = historyItemsRef.current;
            const currentIdx = items.findIndex(h => {
              try {
                const out = JSON.parse(h.output);
                return out.url === resultRef.current?.url;
              } catch { return false; }
            });

            let nextItem = null;
            if (currentIdx !== -1 && currentIdx < items.length - 1) {
              nextItem = items[currentIdx + 1];
            } else if (currentIdx === -1 && items.length > 0) {
              nextItem = items[0];
            }

            if (nextItem) {
              Animated.parallel([
                Animated.timing(swipeAnim, { toValue: { x: 0, y: -Dimensions.get('window').height }, duration: 250, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true })
              ]).start(() => {
                try {
                  const out = JSON.parse(nextItem.output);
                  setResult({ type: out.type, url: out.url });
                } catch { }

                // Prepare slide in from bottom
                swipeAnim.setValue({ x: 0, y: Dimensions.get('window').height });

                Animated.parallel([
                  Animated.timing(swipeAnim, { toValue: { x: 0, y: 0 }, duration: 350, useNativeDriver: true }),
                  Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true })
                ]).start();
              });
            } else {
              snapBack();
            }
          } else {
            snapBack();
          }
        } else {
          snapBack();
        }
      },
    })
  ).current;

  const genTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const genStart = useRef(0);

  // Dot pulse
  const dotAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Video players
  const resultVideoPlayer = useVideoPlayer(
    result?.type === 'video' && result.url ? result.url : null,
    p => { p.loop = true; if (result?.type === 'video') p.play(); }
  );
  const agentVideoPlayer = useVideoPlayer(
    finalVideoUrl ? finalVideoUrl : null,
    p => { p.loop = true; if (finalVideoUrl) p.play(); }
  );
  const activeFlowVideoPlayer = useVideoPlayer(
    activeFlowVideo ? activeFlowVideo : null,
    p => { p.loop = true; if (activeFlowVideo) p.play(); }
  );

  useEffect(() => {
    if (result?.type === 'video') {
      resultVideoPlayer.replaceAsync(result.url);
      resultVideoPlayer.play();
    }
  }, [result]);

  useEffect(() => {
    if (finalVideoUrl) {
      agentVideoPlayer.replaceAsync(finalVideoUrl);
      agentVideoPlayer.play();
    }
  }, [finalVideoUrl]);

  useEffect(() => {
    if (activeFlowVideo) {
      activeFlowVideoPlayer.replaceAsync(activeFlowVideo);
      if (mainMode === 'flow') activeFlowVideoPlayer.play();
    }
  }, [activeFlowVideo]);

  // Pause inactive players when switching modes
  useEffect(() => {
    if (mainMode !== 'flow') {
      activeFlowVideoPlayer.pause();
    } else {
      resultVideoPlayer.pause();
      agentVideoPlayer.pause();
    }

    if (mainMode !== 'agent') {
      agentVideoPlayer.pause();
    }

    if (mainMode === 'agent') {
      resultVideoPlayer.pause();
    }
  }, [mainMode]);

  useEffect(() => {
    loadProjects();
    fetchSession();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      setResult(null); setSubmittedPrompt('');
      loadHistory(selectedProjectId);
    }
    else { setHistoryItems([]); setResult(null); setSubmittedPrompt(''); }
  }, [selectedProjectId]);

  const fetchSession = async () => {
    try {
      const res = await api.get('/api/auth/session');
      if (res.data?.user) {
        const u = res.data.user;
        setSessionUser({
          name: u.name || '',
          email: u.email || '',
          image: u.image || undefined,
        });
        setUserState({ tier: u.tier || 'FREE', usage: u.usageCount || 0, limit: u.tier === 'PRO' ? 1500000 : u.tier === 'PREMIUM' ? 300000 : u.tier === 'BASIC' ? 120000 : 40000 });
      }
    } catch { }
  };

  const handleSignOut = async () => {
    try {
      await clearSessionToken();
      router.replace('/login');
    } catch {
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  const handleSwitch = (target: 'visual' | 'audio') => {
    if (target === 'visual') return;
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.replace('/audio-engine');
    });
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const list = await fetchProjects();
      setProjects(list);
      if (list.length > 0) {
        if (!selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      } else {
        const defaultProj = await createProject('Default Project');
        setProjects([defaultProj]);
        setSelectedProjectId(defaultProj.id);
      }
    } catch { }
    finally { setLoadingProjects(false); }
  };

  const loadHistory = async (id: string) => {
    setLoadingHistory(true);
    setHistoryItems([]); // Clear current history before loading new one
    try { const items = await fetchVisualHistory(id); setHistoryItems(items); } catch { }
    finally { setLoadingHistory(false); }
  };

  // ── History panel animations ────────────────────────────────
  const openHistory = () => {
    setHistoryVisible(true);
    isHistoryOpen.current = true;
    Animated.parallel([
      Animated.spring(historyAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const closeHistory = () => {
    isHistoryOpen.current = false;
    Animated.parallel([
      Animated.spring(historyAnim, { toValue: HISTORY_WIDTH, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setHistoryVisible(false));
  };

  // ── Settings panel animations ───────────────────────────────
  const openSettings = () => {
    settingsAnim.setValue(500); // always start from off-screen
    setShowSettings(true);
    Animated.spring(settingsAnim, { toValue: 0, tension: 75, friction: 12, useNativeDriver: true }).start();
  };

  const closeSettings = () => {
    Animated.spring(settingsAnim, { toValue: 500, tension: 75, friction: 12, useNativeDriver: true }).start(() => {
      setShowSettings(false);
    });
  };

  const toggleSettings = () => showSettings ? closeSettings() : openSettings();

  // ── Sidebar drawer animations ───────────────────────────────
  const openSidebar = () => {
    setShowSidebar(true);
    Animated.parallel([
      Animated.spring(sidebarAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(sidebarOverlay, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.spring(sidebarAnim, { toValue: -280, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(sidebarOverlay, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setShowSidebar(false));
  };

  // ── Create project ──────────────────────────────────────────
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) { Alert.alert('Error', 'Please enter a project name.'); return; }
    try {
      const proj = await createProject(newProjectName.trim());
      setNewProjectName(''); setShowCreateModal(false);
      loadProjects(); setSelectedProjectId(proj.id);
    } catch { Alert.alert('Error', 'Failed to create project.'); }
  };

  const handleRenameProject = (id: string, currentName: string) => {
    Alert.prompt(
      'Rename Project',
      'Enter new project name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: async (newName) => {
            if (newName && newName.trim() !== '') {
              try {
                await renameProject(id, newName.trim());
                loadProjects();
              } catch {
                Alert.alert('Error', 'Failed to rename project.');
              }
            }
          },
        },
      ],
      'plain-text',
      currentName
    );
  };

  const handleDownloadPreview = async () => {
    if (!previewItem?.url) return;
    try {
      const ext = previewItem.type === 'video' ? 'mp4' : 'png';
      const fileUri = `${documentDirectory}ipulse-visual-${Date.now()}.${ext}`;
      const downloadRes = await downloadAsync(previewItem.url, fileUri);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(downloadRes.uri);
        Alert.alert('Saved!', 'File saved to your gallery.');
      } else {
        Alert.alert('Error', 'Permission to access gallery denied.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to download file.');
    }
  };

  const handleSharePreview = async () => {
    if (!previewItem?.url) return;
    try {
      const ext = previewItem.type === 'video' ? 'mp4' : 'png';
      const fileUri = `${documentDirectory}ipulse-visual-share.${ext}`;
      const downloadRes = await downloadAsync(previewItem.url, fileUri);
      await Sharing.shareAsync(downloadRes.uri);
    } catch (e) {
      Alert.alert('Error', 'Failed to share file.');
    }
  };

  const handleProjectLongPress = (id: string, currentName: string) => {
    Alert.alert(
      'Project Options',
      `Manage "${currentName}"`,
      [
        { text: 'Rename', onPress: () => handleRenameProject(id, currentName) },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteProject(id) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDeleteProject = (id: string) => {
    Alert.alert('Delete Project', 'Delete this project?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteProject(id);
            const list = await fetchProjects();
            setProjects(list);
            if (selectedProjectId === id) {
              if (list.length > 0) {
                setSelectedProjectId(list[0].id);
              } else {
                const defaultProj = await createProject('Default Project');
                setProjects([defaultProj]);
                setSelectedProjectId(defaultProj.id);
              }
            }
          }
          catch { Alert.alert('Error', 'Failed to delete.'); }
        }
      },
    ]);
  };

  // ── File picker ─────────────────────────────────────────────
  const handlePickReference = async () => {
    try {
      const accept = mainMode === 'flow' ? 'video/*' : 'image/*';
      const res = await DocumentPicker.getDocumentAsync({ type: accept, copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.[0]) {
        const f = res.assets[0];
        const base64 = await readAsStringAsync(f.uri, { encoding: EncodingType.Base64 });
        setReferenceImage({ uri: f.uri, name: f.name, type: f.mimeType || 'image/jpeg', base64: `data:${f.mimeType || 'image/jpeg'};base64,${base64}` });
      }
    } catch { }
  };

  const handleUploadOriginal = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'video/*'] });
      if (res.canceled || !res.assets?.length) return;
      const file = res.assets[0];

      Alert.alert('Uploading', 'Uploading original file...', [{ text: 'OK' }]);
      const data = await uploadFile(file.uri, file.name, file.mimeType || 'video/mp4');

      const newStep = {
        id: Date.now().toString(),
        url: data.url,
        duration: 0,
        prompt: 'Original Upload',
        type: data.url.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image',
      };
      setFlowSequence([newStep]);
      setActiveFlowVideo(data.url);
    } catch (e) {
      Alert.alert('Error', 'Failed to upload original file.');
    }
  };

  // ── Generation ──────────────────────────────────────────────
  const startTimer = () => {
    genStart.current = Date.now();
    setGenStage(0); setGenElapsed(0); setGenProgress(0);
    genTimerRef.current = setInterval(() => {
      const sec = (Date.now() - genStart.current) / 1000;
      setGenElapsed(Math.floor(sec));
      const p = 90 * (1 - Math.exp(-sec / 30));
      setGenProgress(Math.min(p, 90));
      setGenStage(Math.min(Math.floor(p / 22.5), 3));
    }, 300);
  };

  const stopTimer = () => {
    if (genTimerRef.current) clearInterval(genTimerRef.current);
    setGenProgress(100);
  };

  const handleGenerate = async () => {
    if (mainMode === 'agent') { handleRunAgent(); return; }
    const isFree = userState?.tier === 'FREE';
    if (isFree) {
      if (mainMode === 'flow') {
        Alert.alert("Upgrade Required", "Flow Video Extension is only available on paid plans. Please upgrade your plan.");
        setShowPlanModal(true);
        return;
      }
      if (mainMode === 'image' && selectedQuality === '2k') {
        Alert.alert("Upgrade Required", "2K resolution is only available on paid plans. Please upgrade your plan.");
        setShowPlanModal(true);
        return;
      }
      if (mainMode === 'video' && selectedQuality === '720p') {
        Alert.alert("Upgrade Required", "720p HD quality is only available on paid plans. Please upgrade your plan.");
        setShowPlanModal(true);
        return;
      }
    }
    const currentPrompt = mainMode === 'flow' ? flowPrompt : prompt;
    if (!currentPrompt.trim() && !referenceImage && mainMode !== 'flow') {
      Alert.alert('Missing Input', 'Please enter a prompt or select a reference.'); return;
    }

    setIsGenerating(true); setResult(null); startTimer(); setSubmittedPrompt(currentPrompt);
    const isVideo = mainMode === 'video' || mainMode === 'flow';

    try {
      if (isVideo) {
        let referenceImageBase64 = referenceImage?.base64 || '';
        let durationToUse = parseInt(selectedDuration);

        if (mainMode === 'flow') {
          if (flowSequence.length === 0) {
            setIsGenerating(false); stopTimer();
            Alert.alert("Error", "Please upload an original video to start.");
            return;
          }
          const lastStep = flowSequence[flowSequence.length - 1];
          referenceImageBase64 = lastStep.url; // Web API accepts URL directly
          durationToUse = 5; // Default flow extension duration
        }

        const data = await generateVideo({
          prompt: currentPrompt,
          duration: durationToUse,
          referenceImageBase64,
          mode: mainMode,
          quality: selectedQuality,
          aspectRatio: selectedAspectRatio,
        });
        const reqId = data.request_id;
        pollRef.current = setInterval(async () => {
          try {
            const status = await checkVideoStatus(reqId, parseInt(selectedDuration), selectedQuality);
            if (status.status === 'done') {
              clearInterval(pollRef.current!); stopTimer();
              setTimeout(async () => {
                setIsGenerating(false);

                if (mainMode === 'flow') {
                  setFlowSequence(prev => [...prev, {
                    id: Date.now().toString(),
                    url: status.video.url,
                    duration: durationToUse,
                    prompt: currentPrompt,
                    type: 'video'
                  }]);
                  setActiveFlowVideo(status.video.url);
                } else {
                  setResult({ type: 'video', url: status.video.url });
                }

                if (selectedProjectId) {
                  try {
                    const h = await saveHistoryItem({ type: 'visual', input: currentPrompt, output: JSON.stringify({ type: 'video', url: status.video.url }), projectId: selectedProjectId });
                    setHistoryItems(p => [h, ...p]);
                  } catch { }
                }
                fetchSession();
              }, 800);
            } else if (status.status === 'failed' || status.status === 'expired') {
              clearInterval(pollRef.current!); stopTimer();
              setIsGenerating(false); Alert.alert('Failed', `Video synthesis ${status.status}.`);
            }
          } catch { }
        }, 5000);
      } else {
        // Image generation
        const data = await generateImage({ prompt: currentPrompt, feature: 'basic-image', referenceImageBase64: referenceImage?.base64, aspectRatio: selectedAspectRatio, quality: selectedQuality });
        stopTimer();
        setTimeout(async () => {
          setIsGenerating(false);
          setResult({ type: 'image', url: data.url });
          if (selectedProjectId) {
            try {
              const h = await saveHistoryItem({ type: 'visual', input: currentPrompt, output: JSON.stringify({ type: 'image', url: data.url }), projectId: selectedProjectId });
              setHistoryItems(p => [h, ...p]);
            } catch { }
          }
          fetchSession();
        }, 800);
      }
    } catch (e: any) {
      if (pollRef.current) clearInterval(pollRef.current);
      stopTimer(); setIsGenerating(false);
      Alert.alert('Generation Error', e?.response?.data?.details?.error || e.message);
    }
  };

  const handleRunAgent = async () => {
    const isFree = userState?.tier === 'FREE';
    if (isFree) {
      Alert.alert("Upgrade Required", "Autonomous Agent Autopilot is only available on paid plans. Please upgrade your plan.");
      setShowPlanModal(true);
      return;
    }
    if (!prompt.trim()) { Alert.alert('Missing', 'Please enter a director prompt.'); return; }
    setAgentStatus('running'); setAgentSteps([]); setAgentLogs([]); setFinalVideoUrl(null); setFinalScript(null); setSubmittedPrompt(prompt);
    try {
      await runAgentStream(
        { prompt, referenceImageBase64: referenceImage?.base64 || null, intent: null, aspectRatio: selectedAspectRatio, quality: selectedQuality, duration: parseInt(selectedDuration) },
        async (event, data) => {
          if (event === 'agent_status') {
            setAgentSteps(prev => { const idx = prev.findIndex(s => s.agent === data.agent); if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], ...data }; return n; } return [...prev, data]; });
            setAgentLogs(prev => [...prev, `[${data.agent}] ${data.message}`]);
          } else if (event === 'complete') {
            setFinalVideoUrl(data.videoUrl); setFinalScript(data.script); setAgentStatus('done');
          }
        },
        (err) => { setAgentStatus('failed'); Alert.alert('Agent Error', err.message); }
      );
    } catch (e: any) { setAgentStatus('failed'); Alert.alert('Agent Error', e.message); }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    try {
      const out = JSON.parse(item.output);
      setResult({ type: out.type, url: out.url });
      setPrompt(item.input || '');
      setSubmittedPrompt(item.input || '');
      if (out.type === 'video') resultVideoPlayer.replace(out.url);
      closeHistory();
    } catch { }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      setHistoryItems(prev => prev.filter(i => i.id !== id));
    } catch { Alert.alert('Error', 'Failed to delete.'); }
  };

  const GEN_STAGES = ['Initializing Matrix', 'Processing Signal', 'Rendering Frames', 'Finalizing Output'];

  // Projects Hub view is bypassed; workspace is rendered directly.

  // ─────────────────────────────────────────────────────────────
  // WORKSPACE
  // ─────────────────────────────────────────────────────────────
  const isSettingsOpen = showSettings;
  const currentPrompt = mainMode === 'flow' ? flowPrompt : prompt;
  const setCurrentPrompt = mainMode === 'flow' ? setFlowPrompt : setPrompt;

  return (
    <View style={[styles.safe, { backgroundColor: COLORS.bg }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* ── TOP BAR ───────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            {/* ☰ opens sidebar */}
            <TouchableOpacity
              style={styles.topBarMenuBtn}
              onPress={openSidebar}
              activeOpacity={0.7}
            >
              <Text style={styles.topBarMenuIcon}>☰</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switcherContainer}>
            <Animated.View style={[
              styles.switcherActiveBg,
              {
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 78], // 76px distance + padding offset
                  })
                }]
              }
            ]} />
            <TouchableOpacity style={styles.switcherTab} onPress={() => handleSwitch('visual')} activeOpacity={0.8}>
              <Text style={[styles.switcherTabText, styles.switcherTabTextActive]}>Visual</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.switcherTab} onPress={() => handleSwitch('audio')} activeOpacity={0.8}>
              <Text style={styles.switcherTabText}>Audio</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={historyVisible ? closeHistory : openHistory}
            style={styles.topBarHistoryBtn}
            activeOpacity={0.75}
          >
            <History color={COLORS.white} size={22} />
          </TouchableOpacity>
        </View>

        {/* ── CANVAS AREA ───────────────────────────────── */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.canvas}>
            {mainMode === 'flow' ? (
              /* Flow Workspace */
              <View style={styles.flowWorkspaceContainer}>
                <View style={styles.flowSequenceWrapper}>
                  <View style={styles.agentMatrixHeader}>
                    <View style={[styles.agentMatrixHeaderDot, { backgroundColor: COLORS.cyan400 }]} />
                    <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: 'rgba(255,255,255,0.4)', fontSize: 8 }]}>Flow Sequence Editor</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    style={styles.flowSequenceScroll}
                    contentContainerStyle={styles.flowSequenceContainer}
                  >
                    {flowSequence.length === 0 ? (
                      <TouchableOpacity style={styles.flowUploadBox} onPress={handleUploadOriginal} activeOpacity={0.7}>
                        <ImageIcon color={COLORS.zinc500} size={16} />
                        <Text style={styles.flowUploadText}>ORIGINAL</Text>
                      </TouchableOpacity>
                    ) : (
                      flowSequence.map((item, index) => {
                        const isOriginal = index === 0;
                        const isActive = activeFlowVideo === item.url;
                        return (
                          <View key={item.id || index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {index > 0 && (
                              <View style={{ marginHorizontal: 6 }}>
                                <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>→</Text>
                              </View>
                            )}
                            <TouchableOpacity
                              style={[styles.flowBox, isActive && styles.flowBoxActive]}
                              onPress={() => setActiveFlowVideo(item.url)}
                              activeOpacity={0.8}
                            >
                              <Image source={{ uri: item.url }} style={StyleSheet.absoluteFillObject} blurRadius={10} />
                              {item.type === 'video' ? (
                                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }]}>
                                  <Video color="rgba(255,255,255,0.8)" size={16} />
                                </View>
                              ) : (
                                <Image source={{ uri: item.url }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                              )}

                              {isOriginal && (
                                <TouchableOpacity
                                  style={styles.flowClearBtn}
                                  onPress={() => { setFlowSequence([]); setActiveFlowVideo(null); }}
                                >
                                  <X size={10} color="#fff" />
                                </TouchableOpacity>
                              )}

                              <View style={styles.flowBadgeTop}>
                                <Text style={styles.flowBadgeText}>{isOriginal ? 'SOURCE' : `GEN ${index}`}</Text>
                              </View>
                              <View style={styles.flowBadgeBottom}>
                                <Text style={styles.flowBadgeText}>{item.duration}s</Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        )
                      })
                    )}

                    {flowSequence.length > 0 && (
                      <>
                        <View style={{ marginHorizontal: 6 }}>
                          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>→</Text>
                        </View>
                        <View style={[styles.flowUploadBox, { borderStyle: 'dashed', backgroundColor: 'transparent' }]}>
                          {isGenerating ? (
                            <ActivityIndicator color={COLORS.cyan400} size="small" />
                          ) : (
                            <Text style={[styles.flowUploadText, { textAlign: 'center', paddingHorizontal: 4 }]}>Describe what{"\n"}happens next</Text>
                          )}
                        </View>
                      </>
                    )}
                  </ScrollView>
                </View>

                <View style={styles.flowContentArea}>
                  {activeFlowVideo ? (
                    flowSequence.find(f => f.url === activeFlowVideo)?.type === 'video' ? (
                      <VideoView
                        player={activeFlowVideoPlayer}
                        contentFit="contain"
                        style={StyleSheet.absoluteFillObject}
                        allowsFullscreen
                        allowsPictureInPicture
                      />
                    ) : (
                      <Image source={{ uri: activeFlowVideo }} style={StyleSheet.absoluteFillObject} resizeMode="contain" />
                    )
                  ) : (
                    <View style={styles.canvasCenter}>
                      <Image
                        source={require('../../assets/images/logo.webp')}
                        style={{ width: 120, height: 120, resizeMode: 'contain', opacity: 0.5 }}
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : mainMode === 'agent' ? (
              /* Agent Workspace */
              <View style={styles.agentWorkspaceContainer}>
                {/* ── TOP: Horizontal Agent Crew Row ── */}
                <View style={styles.agentMatrixWrapper}>
                  <View style={styles.agentMatrixHeader}>
                    <View style={styles.agentMatrixHeaderDot} />
                    <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: 'rgba(255,255,255,0.4)', fontSize: 8 }]}>Agent Crew Matrix</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    style={styles.agentMatrixScroll}
                    contentContainerStyle={styles.agentMatrixContainer}
                  >
                    {AGENT_CREW.map((agent) => {
                      const step = agentSteps.find((s) => s.agent === agent.name);
                      const status = step?.status || 'idle';
                      const isActive = status === 'working' || status === 'running';
                      const isDone = status === 'success' || status === 'completed' || status === 'done';

                      return (
                        <View
                          key={agent.name}
                          style={[
                            styles.agentMatrixCard,
                            {
                              borderColor: isActive
                                ? `${agent.accent}60`
                                : isDone
                                  ? `${agent.accent}30`
                                  : 'rgba(255,255,255,0.06)',
                              backgroundColor: isActive
                                ? `${agent.accent}12`
                                : isDone
                                  ? `${agent.accent}08`
                                  : 'rgba(255,255,255,0.02)',
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.agentMatrixAvatar,
                              {
                                borderColor: isActive || isDone ? `${agent.accent}50` : 'rgba(255,255,255,0.12)',
                                backgroundColor: `${agent.accent}15`,
                                overflow: 'hidden',
                              },
                            ]}
                          >
                            <Image
                              source={{ uri: `${BASE_URL}/${agent.image}` }}
                              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                            />
                          </View>
                          <View style={styles.agentMatrixInfo}>
                            <Text style={styles.agentMatrixName}>{agent.name}</Text>
                            <View style={styles.agentMatrixStatusRow}>
                              <View
                                style={[
                                  styles.agentMatrixStatusDot,
                                  {
                                    backgroundColor: isActive
                                      ? agent.accent
                                      : isDone
                                        ? '#10b981'
                                        : 'rgba(255,255,255,0.2)',
                                  },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.agentMatrixStatusText,
                                  {
                                    color: isActive
                                      ? '#fff'
                                      : isDone
                                        ? '#10b981'
                                        : 'rgba(255,255,255,0.3)',
                                  },
                                ]}
                              >
                                {isActive ? 'Active' : isDone ? 'Ready' : 'Sleeping'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* ── MIDDLE: Tab switcher ── */}
                {agentStatus !== 'idle' && (
                  <View style={styles.agentTabsRow}>
                    <TouchableOpacity
                      onPress={() => setActiveAgentTab('log')}
                      style={[styles.agentTabButton, activeAgentTab === 'log' && styles.agentTabButtonActive]}
                    >
                      <Text style={[styles.agentTabButtonText, activeAgentTab === 'log' && styles.agentTabButtonTextActive]}>
                        Activity Log
                      </Text>
                    </TouchableOpacity>
                    {finalScript && (
                      <TouchableOpacity
                        onPress={() => setActiveAgentTab('script')}
                        style={[styles.agentTabButton, activeAgentTab === 'script' && styles.agentTabButtonActive]}
                      >
                        <Text style={[styles.agentTabButtonText, activeAgentTab === 'script' && styles.agentTabButtonTextActive]}>
                          Screenplay
                        </Text>
                      </TouchableOpacity>
                    )}
                    {finalVideoUrl && (
                      <TouchableOpacity
                        onPress={() => setActiveAgentTab('video')}
                        style={[styles.agentTabButton, activeAgentTab === 'video' && styles.agentTabButtonActive]}
                      >
                        <Text style={[styles.agentTabButtonText, activeAgentTab === 'video' && styles.agentTabButtonTextActive]}>
                          Video
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {/* ── BOTTOM: Tab Content ── */}
                <View style={styles.agentContentArea}>
                  {activeAgentTab === 'log' && (
                    agentStatus === 'idle' ? (
                      <View style={styles.agentIdleContainer}>
                        <View style={styles.agentIdleIconCircle}>
                          <Zap color="rgba(255,255,255,0.4)" size={24} />
                        </View>
                        <Text style={styles.agentIdleTitle}>iPulse Agent Console</Text>
                        <Text style={styles.agentIdleSubtitle}>
                          Describe a video topic and the crew will brainstorm, research, script, plan, generate and edit — fully autonomously.
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.terminalBox}>
                        <ScrollView
                          ref={logScrollRef}
                          style={{ flex: 1 }}
                          showsVerticalScrollIndicator={false}
                          onContentSizeChange={() => logScrollRef.current?.scrollToEnd({ animated: true })}
                        >
                          {agentLogs.map((log, i) => (
                            <Text key={i} style={styles.terminalLine}>{`> ${log}`}</Text>
                          ))}
                        </ScrollView>
                      </View>
                    )
                  )}

                  {activeAgentTab === 'script' && finalScript && (
                    <ScrollView style={styles.screenplayContainer} showsVerticalScrollIndicator={false}>
                      <Text style={styles.screenplayTitle}>Screenplay Script</Text>
                      <Text style={styles.screenplayText}>{finalScript}</Text>
                    </ScrollView>
                  )}

                  {activeAgentTab === 'video' && finalVideoUrl && (
                    <View style={styles.agentVideoContainer}>
                      <VideoView
                        player={agentVideoPlayer}
                        contentFit="contain"
                        style={styles.agentVideoPlayer}
                        allowsFullscreen
                        allowsPictureInPicture
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : result ? (
              /* Result display */
              <Animated.View
                style={[
                  styles.canvasFill,
                  { opacity: opacityAnim, transform: swipeAnim.getTranslateTransform() }
                ]}
                {...panResponder.panHandlers}
              >
                {result.type === 'video' ? (
                  <VideoView
                    player={resultVideoPlayer}
                    contentFit="contain"
                    style={styles.canvasFill}
                    allowsFullscreen
                    allowsPictureInPicture
                  />
                ) : (
                  <Image source={{ uri: result.url }} style={styles.canvasFill} resizeMode="contain" />
                )}
              </Animated.View>
            ) : (
              /* Idle placeholder */
              <View style={styles.canvasCenter}>
                <Image
                  source={require('../../assets/images/logo.webp')}
                  style={{ width: 120, height: 120, resizeMode: 'contain', opacity: 0.1, tintColor: '#71717a' }}
                />
              </View>
            )}

            {/* Top-Left Overlay: Loading & Prompt */}
            {(isGenerating || result || (mainMode === 'agent' && agentStatus !== 'idle') || (mainMode === 'flow' && activeFlowVideo)) && !!submittedPrompt && (
              <View style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 999, flexDirection: 'row', alignItems: 'flex-start' }} pointerEvents="box-none">
                {isGenerating && (
                  <View style={{ width: 32, height: 32, marginRight: 8, marginTop: 2 }} pointerEvents="none">
                    <RevealAnimation duration={parseInt(selectedDuration || '8') * 1000} />
                  </View>
                )}

                {/* Prompt Bar Component */}
                <PromptBar text={submittedPrompt} />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* ── SETTINGS BOTTOM SHEET — Modal so it never peeks ─ */}
        <Modal
          visible={showSettings}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={closeSettings}
        >
          <View style={StyleSheet.absoluteFillObject}>
            {/* Dimmed overlay */}
            <TouchableOpacity style={styles.settingsOverlay} onPress={closeSettings} activeOpacity={1} />
            {/* Slide-up sheet */}
            <Animated.View style={[styles.settingsSheet, { transform: [{ translateY: settingsAnim }] }]}>
              <LinearGradient
                colors={['#0b0f19', COLORS.bg]}
                style={StyleSheet.absoluteFillObject}
              />
              {/* Mode tabs */}
              <View style={styles.settingsModesRow}>
                <View style={styles.settingsModesPill}>
                  {(['image', 'video', 'flow', 'agent'] as MainMode[]).map(mode => {
                    const isActive = mainMode === mode;
                    const isFree = userState?.tier === 'FREE';
                    const isLocked = isFree && (mode === 'flow' || mode === 'agent');
                    let ModeIcon = mode === 'image' ? ImageIcon : mode === 'video' ? Video : mode === 'flow' ? LayersPlus : Bot;
                    return (
                      <TouchableOpacity
                        key={mode}
                        onPress={() => {
                          if (isLocked) {
                            closeSettings();
                            Alert.alert(
                              "Upgrade Required",
                              `${mode === 'flow' ? 'Flow Video Extension' : 'Autonomous Agent Autopilot'} is only available on paid plans. Please upgrade your plan.`
                            );
                            setShowPlanModal(true);
                            return;
                          }
                          setMainMode(mode);
                        }}
                        style={[
                          styles.settingsModeBtn,
                          isActive && styles.settingsModeBtnActive,
                          isLocked && { opacity: 0.5 }
                        ]}
                        activeOpacity={0.75}
                      >
                        <ModeIcon color={isActive ? '#000' : COLORS.zinc400} size={14} />
                        <Text style={[styles.settingsModeBtnText, isActive && { color: '#000' }]}>
                          {mode.toUpperCase()}
                        </Text>
                        {isLocked && <Lock color={COLORS.zinc400} size={10} style={{ marginLeft: 2 }} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.settingsBody} showsVerticalScrollIndicator={false}>
                {/* Aspect Ratio */}
                <View style={styles.settingsGroup}>
                  <Text style={styles.settingsGroupLabel}>ASPECT RATIO</Text>
                  <View style={styles.settingsOptionsRow}>
                    {ASPECT_RATIOS.map(r => {
                      const isActive = selectedAspectRatio === r.id;
                      return (
                        <TouchableOpacity
                          key={r.id}
                          onPress={() => setSelectedAspectRatio(r.id)}
                          style={[styles.settingsOptionBtn, isActive && styles.settingsOptionBtnActive]}
                          activeOpacity={0.75}
                        >
                          <View style={[styles.ratioIcon, { width: r.w, height: r.h, borderColor: isActive ? COLORS.white : COLORS.zinc600 }]} />
                          <Text style={[styles.settingsOptionText, isActive && { color: COLORS.white }]}>{r.id}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Resolution */}
                <View style={styles.settingsGroup}>
                  <Text style={styles.settingsGroupLabel}>RESOLUTION QUALITY</Text>
                  <View style={styles.settingsOptionsRow}>
                    {(mainMode === 'image' ? QUALITY_OPTIONS.filter(q => ['1080p', '2k'].includes(q.id)) : QUALITY_OPTIONS.filter(q => ['480p', '720p'].includes(q.id))).map(q => {
                      const isActive = selectedQuality === q.id;
                      const isFree = userState?.tier === 'FREE';
                      const isLocked = isFree && (
                        (mainMode === 'image' && q.id === '2k') ||
                        (mainMode !== 'image' && q.id === '720p')
                      );
                      return (
                        <TouchableOpacity
                          key={q.id}
                          onPress={() => {
                            if (isLocked) {
                              closeSettings();
                              Alert.alert(
                                "Upgrade Required",
                                `${q.id === '2k' ? '2K resolution' : '720p HD quality'} is only available on paid plans. Please upgrade your plan.`
                              );
                              setShowPlanModal(true);
                              return;
                            }
                            setSelectedQuality(q.id);
                          }}
                          style={[
                            styles.settingsOptionBtn,
                            isActive && styles.settingsOptionBtnActive,
                            isLocked && { opacity: 0.5 }
                          ]}
                          activeOpacity={0.75}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={[styles.settingsOptionBig, isActive && { color: COLORS.white }]}>{q.id}</Text>
                            {isLocked && <Lock color={COLORS.zinc500} size={12} />}
                          </View>
                          <Text style={[styles.settingsOptionSub, isActive && { color: 'rgba(255,255,255,0.7)' }]}>{q.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Duration (not for image) */}
                {mainMode !== 'image' && (
                  <View style={styles.settingsGroup}>
                    <Text style={styles.settingsGroupLabel}>TARGET DURATION</Text>
                    <View style={styles.settingsOptionsRow}>
                      {(mainMode === 'video'
                        ? VIDEO_DURATION_OPTIONS
                        : mainMode === 'flow'
                          ? FLOW_DURATION_OPTIONS
                          : AGENT_DURATION_OPTIONS).map(d => {
                            const isActive = selectedDuration === d;
                            return (
                              <TouchableOpacity
                                key={d}
                                onPress={() => setSelectedDuration(d)}
                                style={[styles.settingsOptionBtn, isActive && styles.settingsOptionBtnActive]}
                                activeOpacity={0.75}
                              >
                                <Text style={[styles.settingsOptionBig, isActive && { color: COLORS.white }]}>{d}</Text>
                              </TouchableOpacity>
                            );
                          })}
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Save button */}
              <View style={styles.settingsFooter}>
                <TouchableOpacity onPress={closeSettings} style={styles.settingsSaveBtn} activeOpacity={0.85}>
                  <Text style={styles.settingsSaveBtnText}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* ── BOTTOM INPUT BAR — transparent background ─────── */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.inputBar, { paddingBottom: insets.bottom + 10 }]}>
            {/* Settings icon button — shows current mode */}
            <TouchableOpacity
              onPress={toggleSettings}
              style={[styles.inputBarIconBtn, showSettings && styles.inputBarIconBtnActive]}
              activeOpacity={0.75}
            >
              {(() => {
                const iconColor = showSettings ? '#000' : COLORS.white;
                if (showSettings) {
                  return <Settings color={iconColor} size={20} />;
                }
                switch (mainMode) {
                  case 'image':
                    return <ImageIcon color={iconColor} size={20} />;
                  case 'video':
                    return <Video color={iconColor} size={20} />;
                  case 'flow':
                    return <LayersPlus color={iconColor} size={20} />;
                  case 'agent':
                    return <Bot color={iconColor} size={20} />;
                  default:
                    return <Settings color={iconColor} size={20} />;
                }
              })()}
            </TouchableOpacity>

            {/* Reference image / + button */}
            <TouchableOpacity
              onPress={referenceImage ? () => setReferenceImage(null) : handlePickReference}
              style={[styles.inputBarIconBtn, referenceImage && { padding: 0, overflow: 'hidden', borderRadius: 14 }]}
              activeOpacity={0.75}
            >
              {referenceImage ? (
                <Image source={{ uri: referenceImage.uri }} style={styles.refThumb} />
              ) : (
                <Text style={styles.inputBarPlus}>+</Text>
              )}
            </TouchableOpacity>

            {/* Separator */}
            <View style={styles.inputBarSep} />

            {/* Text input */}
            <TextInput
              value={currentPrompt}
              onChangeText={setCurrentPrompt}
              placeholder="Enter your creative ideas."
              placeholderTextColor="rgba(255,255,255,0.25)"
              style={styles.inputBarText}
              multiline={false}
              onSubmitEditing={handleGenerate}
              returnKeyType="send"
            />

            {/* Send / submit button */}
            <TouchableOpacity
              onPress={handleGenerate}
              disabled={isGenerating}
              style={[styles.sendBtn, isGenerating && { opacity: 0.5 }]}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.sendBtnIcon}>→</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── HISTORY PANEL (slides from right) ──────────── */}
      {historyVisible && (
        <Animated.View style={[styles.historyOverlay, { opacity: overlayAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeHistory} activeOpacity={1} />
        </Animated.View>
      )}
      <Animated.View
        style={[styles.historyPanel, { transform: [{ translateX: historyAnim }] }]}
        pointerEvents={historyVisible ? 'auto' : 'none'}
      >
        <LinearGradient colors={['#03050c', COLORS.bg]} style={StyleSheet.absoluteFillObject} />
        {/* Panel header */}
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>
              History ({historyItems.length})
            </Text>
            <TouchableOpacity onPress={closeHistory} style={styles.historyCloseBtn}>
              <Text style={{ color: COLORS.zinc400, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Thumbnails */}
          {loadingHistory ? (
            <ActivityIndicator size="small" color={COLORS.zinc500} style={{ marginTop: 32 }} />
          ) : historyItems.length === 0 ? (
            <View style={styles.historyEmpty}>
              <History color={COLORS.zinc700} size={32} style={{ marginBottom: 10 }} />
              <Text style={[S.monoLabel, { fontFamily: 'Inter_400Regular', color: COLORS.zinc700, textAlign: 'center' }]}>No canvas records.{'\n'}Enter prompt to synthesize.</Text>
            </View>
          ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, gap: 12 }} showsVerticalScrollIndicator={false}>
              {historyItems.map(item => {
                let outUrl = '', outType = 'video';
                try { const out = JSON.parse(item.output); outUrl = out.url; outType = out.type; } catch { }
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelectHistory(item)}
                    style={styles.historyThumb}
                    activeOpacity={0.8}
                  >
                    {/* Thumbnail */}
                    {outUrl ? (
                      outType === 'video' ? (
                        <HistoryVideoThumb url={outUrl} style={styles.historyThumbImg} />
                      ) : (
                        <Image source={{ uri: outUrl }} style={styles.historyThumbImg} resizeMode="cover" />
                      )
                    ) : (
                      <View style={[styles.historyThumbImg, { alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={[S.monoLabel, { fontFamily: 'Inter_400Regular', color: COLORS.zinc700 }]}>No preview</Text>
                      </View>
                    )}
                    {/* Type badge */}
                    <View style={styles.historyThumbBadge}>
                      <Text style={styles.historyThumbBadgeText}>{outType.toUpperCase()}</Text>
                    </View>
                    {/* Delete button */}
                    <TouchableOpacity
                      style={styles.historyThumbDelete}
                      onPress={() => handleDeleteHistory(item.id)}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                    >
                      <Text style={{ color: COLORS.zinc400, fontSize: 11 }}>✕</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </Animated.View>

      {/* ── SIDEBAR DRAWER (slides from left) ──────────── */}
      {showSidebar && (
        <Animated.View style={[styles.sidebarOverlay, { opacity: sidebarOverlay }]} pointerEvents="none" />
      )}
      {showSidebar && (
        <>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeSidebar} activeOpacity={1} />
          <Animated.View style={[styles.sidebarPanel, { transform: [{ translateX: sidebarAnim }] }]}>
            <LinearGradient colors={['#03050c', COLORS.bg]} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
              <View style={styles.sidebarHeader}>
                <TouchableOpacity
                  style={styles.sidebarProfileTrigger}
                  onPress={() => {
                    closeSidebar();
                    setShowProfileModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  {sessionUser?.image ? (
                    <Image source={{ uri: sessionUser.image }} style={styles.sidebarAvatar} />
                  ) : (
                    <View style={styles.sidebarAvatarFallback}>
                      <User color={COLORS.white} size={16} />
                    </View>
                  )}
                  <Text style={styles.sidebarProfileName} numberOfLines={1}>
                    {sessionUser?.name || 'Profile'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeSidebar} style={styles.sidebarCloseBtn}>
                  <X color={COLORS.zinc400} size={16} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, paddingVertical: 24, paddingHorizontal: 12, justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    onPress={() => {
                      closeSidebar();
                      setShowCreateModal(true);
                    }}
                    style={styles.sidebarNewProjectBtn}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.sidebarNewProjectText}>+ NEW PROJECT</Text>
                  </TouchableOpacity>

                  <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: COLORS.zinc500, fontSize: 8, letterSpacing: 2, marginVertical: 12, paddingHorizontal: 4 }]}>CREATED PROJECTS</Text>
                  <ScrollView style={styles.sidebarProjectsList} showsVerticalScrollIndicator={false}>
                    {projects.map(proj => {
                      const isActive = selectedProjectId === proj.id;
                      const createdDate = proj.createdAt ? new Date(proj.createdAt).toLocaleDateString() : '';
                      return (
                        <TouchableOpacity
                          key={proj.id}
                          onPress={() => {
                            setSelectedProjectId(proj.id);
                            closeSidebar();
                          }}
                          onLongPress={() => handleProjectLongPress(proj.id, proj.name)}
                          style={[
                            styles.sidebarProjectCard,
                            !isActive && { backgroundColor: 'transparent', borderWidth: 0, paddingLeft: 8 }
                          ]}
                          activeOpacity={0.75}
                        >
                          {isActive && <View style={styles.sidebarProjectBar} />}
                          <View style={{ flex: 1, paddingLeft: isActive ? 8 : 0 }}>
                            <Text style={[styles.sidebarProjectCardName, isActive && { color: COLORS.white, fontSize: 14 }]} numberOfLines={1}>
                              {proj.name}
                            </Text>
                            {createdDate ? (
                              <Text style={[S.monoLabel, { color: COLORS.zinc600, fontSize: 9, marginTop: 4 }]}>{createdDate}</Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Usage Card */}
                <View style={styles.usageCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Crown color={userState.tier === 'FREE' ? COLORS.zinc600 : COLORS.white} size={14} />
                      <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: COLORS.zinc300, fontSize: 10 }]}>{userState.tier}</Text>
                    </View>
                    <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: COLORS.white, fontWeight: '700' }]}>
                      {userState.usage.toLocaleString()}<Text style={{ color: COLORS.zinc500 }}>/{userState.limit.toLocaleString()}</Text>
                    </Text>
                  </View>
                  <View style={styles.usageProgressBg}>
                    <View style={[styles.usageProgressFill, { width: `${Math.min((userState.usage / userState.limit) * 100, 100)}%` }]} />
                  </View>
                  <TouchableOpacity style={styles.usageManageBtn} onPress={() => { closeSidebar(); setShowPlanModal(true); }}>
                    <Text style={styles.usageManageTxt}>MANAGE PLAN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </Animated.View>
        </>
      )}

      {/* ── PREVIEW MODAL ────────────────────────────────── */}
      <Modal visible={showPreviewModal} animationType="fade" transparent>
        <View style={[styles.modalBackdrop, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
          <SafeAreaView style={{ flex: 1, width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
              <TouchableOpacity onPress={() => setShowPreviewModal(false)} style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 }}>
                <X color={COLORS.white} size={24} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              {previewItem?.type === 'video' ? (
                <VideoView
                  player={resultVideoPlayer}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                  allowsFullscreen
                  allowsPictureInPicture
                />
              ) : (
                <Image source={{ uri: previewItem?.url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 24 }}>
              <TouchableOpacity style={styles.previewActionBtn} onPress={handleDownloadPreview}>
                <Download color={COLORS.white} size={24} />
                <Text style={styles.previewActionTxt}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewActionBtn} onPress={handleSharePreview}>
                <Share color={COLORS.white} size={24} />
                <Text style={styles.previewActionTxt}>Share</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ── CREATE PROJECT MODAL ─────────────────────────── */}
      <Modal visible={showCreateModal} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowCreateModal(false)} activeOpacity={1} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center' }}>
            <View style={[styles.modalSheet, { width: '90%', borderRadius: 24, paddingBottom: 24 }]}>
              <Text style={styles.modalTitle}>Create New Project</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter project name..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={newProjectName}
                onChangeText={setNewProjectName}
                autoFocus
                onSubmitEditing={handleCreateProject}
              />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                <TouchableOpacity onPress={() => setShowCreateModal(false)} style={[styles.modalBtn, { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                  <Text style={[styles.modalBtnText, { color: COLORS.zinc400 }]}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreateProject} style={[styles.modalBtn, { flex: 1, backgroundColor: COLORS.white }]}>
                  <Text style={[styles.modalBtnText, { color: '#000' }]}>CREATE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ── PROFILE MODAL ────────────────────────────────── */}
      <Modal visible={showProfileModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: COLORS.bgCard, borderColor: 'rgba(255,255,255,0.08)' }]}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              {sessionUser?.image ? (
                <Image source={{ uri: sessionUser.image }} style={styles.profileModalAvatar} />
              ) : (
                <View style={styles.profileModalAvatarFallback}>
                  <User color={COLORS.white} size={32} />
                </View>
              )}
              <Text style={styles.profileModalName}>{sessionUser?.name || 'Director'}</Text>
              <Text style={styles.profileModalEmail}>{sessionUser?.email}</Text>
            </View>

            <View style={[styles.usageCard, { marginTop: 0, marginBottom: 24 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Crown color={userState.tier === 'FREE' ? COLORS.zinc600 : COLORS.white} size={14} />
                  <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: COLORS.zinc300, fontSize: 10 }]}>{userState.tier}</Text>
                </View>
                <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: COLORS.white, fontWeight: '700' }]}>
                  {userState.usage.toLocaleString()}<Text style={{ color: COLORS.zinc500 }}>/{userState.limit.toLocaleString()}</Text>
                </Text>
              </View>
              <View style={styles.usageProgressBg}>
                <View style={[styles.usageProgressFill, { width: `${Math.min((userState.usage / userState.limit) * 100, 100)}%` }]} />
              </View>
            </View>

            <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.8}>
              <Text style={styles.signOutBtnText}>SIGN OUT</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.closeModalBtn} activeOpacity={0.8}>
              <Text style={styles.closeModalBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── PLAN MODAL ───────────────────────────────────── */}
      <Modal visible={showPlanModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowPlanModal(false)} activeOpacity={1} />
          <View style={[styles.modalSheet, { backgroundColor: COLORS.bgCard, borderColor: 'rgba(255,255,255,0.08)', paddingBottom: insets.bottom + 20, maxHeight: '92%' }]}>
            <Text style={styles.planModalTitle}>Pricing</Text>

            {/* Monthly/Yearly toggle */}
            <View style={styles.billingToggleContainer}>
              <TouchableOpacity
                onPress={() => setBillingCycle('monthly')}
                style={[styles.billingToggleBtn, billingCycle === 'monthly' && styles.billingToggleBtnActive]}
              >
                <Text style={[styles.billingToggleText, billingCycle === 'monthly' && { color: '#000' }]}>Monthly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBillingCycle('yearly')}
                style={[styles.billingToggleBtn, billingCycle === 'yearly' && styles.billingToggleBtnActive]}
              >
                <Text style={[styles.billingToggleText, billingCycle === 'yearly' && { color: '#000' }]}>Yearly (-20%)</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 8 }}>
              {[
                {
                  tier: 'FREE',
                  price: '$0',
                  desc: 'Test the engine',
                  limit: '40,000 pulses / month',
                  sections: [
                    {
                      title: 'Visual Production',
                      items: [
                        { checked: true, text: 'Video Gen & Edit (480p)' },
                        { checked: true, text: 'Image Gen & Edit (1K)' },
                        { checked: false, text: 'No Flow Video Extension' },
                        { checked: false, text: 'Agent Autopilot' }
                      ]
                    },
                    {
                      title: 'Voice & Audio',
                      items: [
                        { checked: true, text: '5,000 Char TTS' },
                        { checked: true, text: '5 min STT Limit' }
                      ]
                    }
                  ]
                },
                {
                  tier: 'BASIC',
                  price: billingCycle === 'monthly' ? '$10 / month' : '$8 / month',
                  desc: 'For regular creators',
                  limit: '120,000 pulses / month',
                  sections: [
                    {
                      title: 'Visual Production',
                      items: [
                        { checked: true, text: 'Video / Flow / Agent (720p HD)' },
                        { checked: true, text: 'Image Gen & Edit (2K Quality)' },
                        { checked: true, text: 'Flow Video Extension' },
                        { checked: true, text: 'Agent Autopilot' }
                      ]
                    },
                    {
                      title: 'Voice & Audio',
                      items: [
                        { checked: true, text: '5,000 Char TTS' },
                        { checked: true, text: '5 min STT Limit' }
                      ]
                    }
                  ]
                },
                {
                  tier: 'PREMIUM',
                  price: billingCycle === 'monthly' ? '$20 / month' : '$16 / month',
                  desc: 'For serious creators',
                  limit: '300,000 pulses / month',
                  sections: [
                    {
                      title: 'Visual Production',
                      items: [
                        { checked: true, text: 'Video / Flow / Agent (720p HD)' },
                        { checked: true, text: 'Image Gen & Edit (2K Quality)' },
                        { checked: true, text: 'Flow Video Extension' },
                        { checked: true, text: 'Agent Autopilot' }
                      ]
                    },
                    {
                      title: 'Voice & Audio',
                      items: [
                        { checked: true, text: '10,000 Char TTS' },
                        { checked: true, text: '10 min STT Limit' }
                      ]
                    }
                  ]
                },
                {
                  tier: 'PRO',
                  price: billingCycle === 'monthly' ? '$100 / month' : '$80 / month',
                  desc: 'High-volume production',
                  limit: '1,500,000 pulses / month',
                  sections: [
                    {
                      title: 'Visual Production',
                      items: [
                        { checked: true, text: 'Video / Flow / Agent (720p HD)' },
                        { checked: true, text: 'Image Gen & Edit (2K Quality)' },
                        { checked: true, text: 'Flow Video Extension' },
                        { checked: true, text: 'Agent Autopilot' }
                      ]
                    },
                    {
                      title: 'Voice & Audio',
                      items: [
                        { checked: true, text: '15,000 Char TTS' },
                        { checked: true, text: '15 min STT Limit' }
                      ]
                    }
                  ]
                },
              ].map((plan) => (
                <TouchableOpacity
                  key={plan.tier}
                  onPress={() => {
                    setShowPlanModal(false);
                    Linking.openURL(`${BASE_URL}/visual?tab=profile`);
                  }}
                  style={[styles.planCard, { minHeight: 400, width: 235 }]}
                  activeOpacity={0.8}
                >
                  <View style={{ width: '100%' }}>
                    <Text style={styles.planCardTier}>{plan.tier}</Text>
                    <Text style={styles.planCardPrice}>{plan.price}</Text>
                    <Text style={styles.planCardLimit}>{plan.limit}</Text>
                    <Text style={styles.planCardDesc}>{plan.desc}</Text>

                    {plan.sections.map((section, sIdx) => (
                      <View key={sIdx} style={{ marginTop: 12 }}>
                        <Text style={[S.monoLabel, { color: COLORS.zinc600, fontSize: 8, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }]}>
                          {section.title}
                        </Text>
                        {section.items.map((item, iIdx) => (
                          <Text key={iIdx} style={[S.monoLabel, { color: item.checked ? COLORS.zinc300 : COLORS.zinc600, fontSize: 9, marginBottom: 4, textTransform: 'none' }]}>
                            {item.checked ? '✓ ' : '— '}
                            <Text style={!item.checked && { textDecorationLine: 'line-through' }}>{item.text}</Text>
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                  <View style={[styles.planCardBtn, { marginTop: 16 }]}>
                    <Text style={styles.planCardBtnText}>SELECT PLAN</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setShowPlanModal(false)} style={styles.closeModalBtn} activeOpacity={0.8}>
              <Text style={styles.closeModalBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // ── Hub ──────────────────────────────────────────────────────
  hubScroll: { flexGrow: 1, paddingBottom: 48 },
  hubHero: {
    alignItems: 'center', paddingTop: 60, paddingHorizontal: 28, paddingBottom: 40,
  },
  hubLogo: {
    color: COLORS.white,
    fontSize: 40, fontWeight: '700',
    letterSpacing: 14,
    fontFamily: 'Inter_700Bold',
    marginBottom: 20,
  },
  hubTagline: {
    color: COLORS.zinc400, fontSize: 13, textAlign: 'center',
    lineHeight: 22, maxWidth: 320, marginBottom: 40,
  },
  createBtn: {
    backgroundColor: COLORS.white, borderRadius: 100,
    paddingHorizontal: 40, paddingVertical: 18,
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 24,
    elevation: 8,
  },
  createBtnText: {
    color: '#000', fontFamily: 'Inter_700Bold',
    fontSize: 11, fontWeight: '800', letterSpacing: 3,
  },
  hubProjectsSection: { paddingHorizontal: 20, paddingTop: 16 },
  hubProjectsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  hubCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  hubDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 16 },
  hubEmptyState: {
    borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 24, padding: 40, alignItems: 'center',
  },
  projectCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, padding: 20, marginBottom: 12,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    minHeight: 100,
    ...SHADOWS.cardShadow,
  },
  projectCardName: { color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 14, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  projectCardActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  openBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 100,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  openBadgeText: { color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  deleteIconBtn: { padding: 6 },

  // ── Top bar ──────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarMenuBtn: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarMenuIcon: { color: COLORS.white, fontSize: 28 },
  topBarCloseBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8,
  },
  topBarCloseTxt: {
    color: COLORS.white, fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '700', letterSpacing: 2,
  },
  topBarHistoryBtn: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarHistoryTxt: {
    color: COLORS.white, fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '800', letterSpacing: 2,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 16,
    height: 32,
    width: 156,
    position: 'relative',
    padding: 2,
  },
  switcherActiveBg: {
    position: 'absolute',
    top: 2,
    width: 74,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  switcherTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  switcherTabText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'Inter_700Bold',
  },
  switcherTabTextActive: {
    color: '#ffffff',
  },

  // ── Canvas ───────────────────────────────────────────────────
  canvas: { flex: 1, backgroundColor: COLORS.bg, position: 'relative' },
  canvasCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  canvasFill: { ...StyleSheet.absoluteFillObject },

  // Placeholder icon
  placeholderIcon: {
    width: 52, height: 44,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative',
    overflow: 'hidden',
  },
  placeholderIconInner: { position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.02)' },
  placeholderIconLine: {
    position: 'absolute', width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
    top: 8, left: 8,
  },
  placeholderIconMountain: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 18,
    borderTopWidth: 2, borderTopColor: 'rgba(255,255,255,0.15)',
  },
  placeholderLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 4, textTransform: 'uppercase',
  },

  // Result actions overlay
  resultActions: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
  },
  resultActionBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  resultActionTxt: { color: COLORS.white, fontSize: 14, fontWeight: '600' },

  // Agent terminal
  agentTerminalWrap: { flex: 1, padding: 16 },
  agentChipsRow: { marginBottom: 12, maxHeight: 44 },
  agentChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginRight: 8,
  },
  agentDot: { width: 6, height: 6, borderRadius: 3 },
  terminalBox: {
    flex: 1, backgroundColor: '#000', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  terminalLine: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 16, marginBottom: 2,
  },

  // ── Settings sheet ───────────────────────────────────────────
  // settingsOverlay is inside Modal — use flex:1 as full-screen backdrop
  settingsOverlay: { flex: 1 },
  settingsSheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: 480,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.14)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -20 }, shadowOpacity: 0.95, shadowRadius: 50, elevation: 40,
  },
  settingsModesRow: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 14, borderBottomWidth: 0 },
  settingsModesPill: {
    flexDirection: 'row', backgroundColor: 'transparent',
    borderRadius: 100, borderWidth: 0, padding: 3,
  },
  settingsModeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 8, borderRadius: 100,
  },
  settingsModeBtnActive: { backgroundColor: COLORS.white },
  settingsModeBtnIcon: { fontSize: 12 },
  settingsModeBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '800', color: COLORS.zinc400, letterSpacing: 1.5, textTransform: 'uppercase',
  },
  settingsBody: { paddingHorizontal: 16, paddingTop: 14, gap: 16, paddingBottom: 4 },
  settingsGroup: { gap: 8 },
  settingsGroupLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8, fontWeight: '800', color: COLORS.zinc400, letterSpacing: 3, textTransform: 'uppercase',
  },
  settingsOptionsRow: { flexDirection: 'row', gap: 8 },
  settingsOptionBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.02)', gap: 4,
  },
  settingsOptionBtnActive: {
    borderColor: COLORS.white, backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.08, shadowRadius: 12,
  },
  ratioIcon: { borderWidth: 2, borderRadius: 2 },
  settingsOptionText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8, fontWeight: '700', color: COLORS.zinc500, letterSpacing: 1.5,
  },
  settingsOptionBig: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11, fontWeight: '700', color: COLORS.zinc400,
  },
  settingsOptionSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 8, color: COLORS.zinc600, letterSpacing: 1,
  },
  settingsFooter: {
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'flex-end', marginTop: 8,
  },
  settingsSaveBtn: {
    backgroundColor: COLORS.white, borderRadius: 100, paddingHorizontal: 28, paddingVertical: 10,
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 16,
  },
  settingsSaveBtnText: {
    color: '#000', fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '800', letterSpacing: 3,
  },

  // Bottom input bar ─────────────────────────────────────────
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    backgroundColor: 'transparent',
  },
  inputBarIconBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  inputBarIconBtnActive: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  inputBarModeIcon: { fontSize: 18, color: COLORS.white },
  inputBarPlus: { color: COLORS.white, fontSize: 22, fontWeight: '300', lineHeight: 26 },
  inputBarSep: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.15)' },
  inputBarText: {
    flex: 1, color: COLORS.white, fontSize: 13,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.18, shadowRadius: 18,
    elevation: 8,
  },
  sendBtnIcon: { color: '#000', fontSize: 20, fontWeight: '700' },
  refThumb: { width: 44, height: 44, borderRadius: 14 },

  // ── History panel ────────────────────────────────────────────
  historyOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 39,
  },
  historyPanel: {
    position: 'absolute', top: 0, right: 0, bottom: 0,
    width: HISTORY_WIDTH, zIndex: 40,
    borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: -10, height: 0 }, shadowOpacity: 0.8, shadowRadius: 40, elevation: 30,
  },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  historyTitle: {
    color: COLORS.white, fontFamily: 'Inter_700Bold',
    fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase',
  },
  historyCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  historyEmpty: { alignItems: 'center', justifyContent: 'center', flex: 1, padding: 24 },
  historyThumb: {
    height: 120, borderRadius: 20, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 12, position: 'relative',
  },
  historyThumbImg: { width: '100%', height: '100%', opacity: 0.65 },
  historyThumbBadge: {
    position: 'absolute', bottom: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 100,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  historyThumbBadgeText: {
    color: COLORS.white, fontFamily: 'Inter_700Bold',
    fontSize: 7, fontWeight: '800', letterSpacing: 2,
  },
  historyThumbDelete: {
    position: 'absolute', top: 8, right: 8,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.75)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800', marginBottom: 20 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, color: COLORS.white, fontSize: 14, padding: 14,
    fontFamily: 'Inter_400Regular', marginBottom: 16,
  },
  modalBtn: {
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: 100, alignItems: 'center',
  },
  modalBtnText: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },

  // ── Sidebar panel ──────────────────────────────────────────────
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 49,
  },
  sidebarPanel: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: 270, zIndex: 50,
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 10, height: 0 }, shadowOpacity: 0.8, shadowRadius: 40, elevation: 30,
  },
  sidebarHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sidebarTitle: {
    color: COLORS.white, fontFamily: 'Inter_700Bold',
    fontSize: 10, fontWeight: '800', letterSpacing: 4,
  },
  sidebarCloseBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  sidebarProjectItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, padding: 14, overflow: 'hidden', position: 'relative',
  },
  sidebarProjectItemActive: { backgroundColor: 'rgba(6,182,212,0.07)', borderColor: 'rgba(6,182,212,0.2)' },
  sidebarProjectBar: {
    position: 'absolute', left: 0, top: 10, bottom: 10, width: 3,
    backgroundColor: COLORS.cyan, borderRadius: 2,
    shadowColor: COLORS.cyan, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6,
  },
  sidebarProjectName: {
    color: COLORS.zinc400, fontFamily: 'Inter_700Bold',
    fontSize: 12, fontWeight: '700', letterSpacing: 0.5,
  },
  sidebarNewBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, paddingVertical: 13, alignItems: 'center',
  },
  sidebarNewBtnText: {
    color: COLORS.zinc300, fontFamily: 'Inter_700Bold',
    fontSize: 11, letterSpacing: 1.5,
  },
  usageCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24, padding: 20, marginTop: 'auto',
  },
  usageProgressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  usageProgressFill: { height: '100%', backgroundColor: COLORS.white, borderRadius: 3, shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  usageManageBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'
  },
  usageManageTxt: { color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2 },

  // Sidebar profiles
  sidebarProfileTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1,
  },
  sidebarAvatar: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sidebarAvatarFallback: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sidebarProfileName: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 13, flex: 1,
  },

  // Sidebar project items
  sidebarNewProjectBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 16,
  },
  sidebarNewProjectText: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5,
  },
  sidebarProjectsList: {
    flex: 1,
  },
  sidebarProjectCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, padding: 12, marginBottom: 8, position: 'relative', overflow: 'hidden',
  },
  sidebarProjectCardName: {
    color: COLORS.zinc400, fontFamily: 'Inter_700Bold', fontSize: 12,
  },
  sidebarProjectDeleteBtn: {
    padding: 4,
  },

  // Agent Workspace styles
  agentWorkspaceContainer: {
    flex: 1,
    width: '100%',
  },
  agentMatrixWrapper: {
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  agentMatrixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  agentMatrixHeaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  agentMatrixScroll: {
    maxHeight: 58,
    width: '100%',
  },
  agentMatrixContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  agentMatrixCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 110,
  },
  agentMatrixAvatar: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentMatrixAvatarText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
  },
  agentMatrixInfo: {
    flexDirection: 'column',
  },
  agentMatrixName: {
    color: COLORS.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  agentMatrixStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agentMatrixStatusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  agentMatrixStatusText: {
    fontSize: 7.5,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },

  // Agent Tabs styles
  agentTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    height: 40,
  },
  agentTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  agentTabButtonActive: {
    borderBottomColor: COLORS.white,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  agentTabButtonText: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Inter_700Bold',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  agentTabButtonTextActive: {
    color: COLORS.white,
  },

  // Agent Content styles
  agentContentArea: {
    flex: 1,
    padding: 16,
  },
  agentIdleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  agentIdleIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  agentIdleTitle: {
    color: COLORS.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  agentIdleSubtitle: {
    color: COLORS.zinc500,
    fontFamily: 'Inter_400Regular',
    fontSize: 9.5,
    textAlign: 'center',
    lineHeight: 16,
  },
  screenplayContainer: {
    flex: 1,
  },
  screenplayTitle: {
    color: COLORS.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: 8,
  },
  screenplayText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 18,
  },
  agentVideoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  agentVideoPlayer: {
    width: '100%',
    height: '100%',
  },

  // Profile Modal styles
  profileModalAvatar: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: COLORS.white, marginBottom: 12,
  },
  profileModalAvatarFallback: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white, marginBottom: 12,
  },
  profileModalName: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 18, marginBottom: 4,
  },
  profileModalEmail: {
    color: COLORS.zinc500, fontFamily: 'Inter_400Regular', fontSize: 12,
  },
  signOutBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 100, paddingVertical: 14, alignItems: 'center', marginBottom: 12,
  },
  signOutBtnText: {
    color: COLORS.red, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2,
  },
  closeModalBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100, paddingVertical: 14, alignItems: 'center',
  },
  closeModalBtnText: {
    color: COLORS.zinc400, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2,
  },

  // Plan Modal styles
  planModalTitle: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 18, textAlign: 'center', marginBottom: 20,
  },
  billingToggleContainer: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: 3, marginBottom: 20,
  },
  billingToggleBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100,
  },
  billingToggleBtnActive: {
    backgroundColor: COLORS.white,
  },
  billingToggleText: {
    color: COLORS.zinc400, fontFamily: 'Inter_700Bold', fontSize: 11,
  },
  planCard: {
    width: 140, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, padding: 16, alignItems: 'center', justifyContent: 'space-between', minHeight: 180,
  },
  planCardTier: {
    color: COLORS.zinc400, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
  },
  planCardPrice: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 20, marginBottom: 8,
  },
  planCardLimit: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 9.5, textTransform: 'none', letterSpacing: 0.5, marginBottom: 8,
  },
  planCardDesc: {
    color: COLORS.zinc500, fontFamily: 'Inter_400Regular', fontSize: 8.5, textAlign: 'center', lineHeight: 12, marginBottom: 12, textTransform: 'uppercase',
  },
  planCardBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingVertical: 6, width: '100%', alignItems: 'center',
  },
  planCardBtnText: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1,
  },
  previewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  previewActionTxt: {
    color: COLORS.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },

  // Flow Workspace Styles
  flowWorkspaceContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  flowSequenceWrapper: {
    height: 140,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 8,
  },
  flowSequenceScroll: {
    flex: 1,
  },
  flowSequenceContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  flowUploadBox: {
    width: 64,
    height: 96,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  flowUploadText: {
    color: COLORS.zinc500,
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    letterSpacing: 1,
  },
  flowBox: {
    width: 64,
    height: 96,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  flowBoxActive: {
    borderColor: COLORS.cyan400,
    shadowColor: COLORS.cyan400,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  flowClearBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
  },
  flowBadgeTop: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flowBadgeBottom: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  flowBadgeText: {
    color: COLORS.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 7,
    letterSpacing: 0.5,
  },
  flowContentArea: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
