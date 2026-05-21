import { ImagePlus, History, User, Film, Image as ImageIcon, Video, Layers, FastForward } from 'lucide-react';
import { Tab, Tier } from './dashboard-constants'; // We can reuse Tier and maybe Tab if we extend it

// We'll define VisualTab to be distinct from the audio Tabs
export type VisualTab = 'imagine' | 'history' | 'profile';

export const VISUAL_TABS = [
  { id: 'imagine', label: 'Imagine', icon: ImagePlus, desc: 'Create images & videos with Grok' },
  { id: 'history', label: 'History', icon: History, desc: 'Your visual generation records' },
  { id: 'profile', label: 'Profile', icon: User, desc: 'Account & Billing' },
] as const;

export type GrokFeature = 'basic-image' | 'basic-video' | 'image-to-video' | 'reference-to-video' | 'video-extension';

export const GROK_FEATURES = [
  { id: 'basic-image', label: 'Image Generation', icon: ImageIcon, desc: 'Generate high-quality images from text descriptions.' },
  { id: 'basic-video', label: 'Video Generation', icon: Film, desc: 'Create dynamic videos from text prompts.' },
  { id: 'image-to-video', label: 'Image-to-Video', icon: Video, desc: 'Animate an existing uploaded image.' },
  { id: 'reference-to-video', label: 'Reference-to-Video', icon: Layers, desc: 'Create a video maintaining the subject from a reference image.' },
  { id: 'video-extension', label: 'Video Extension', icon: FastForward, desc: 'Extend the duration of an existing video.' },
] as const;

export const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9', desc: 'Widescreen (Landscape)' },
  { id: '9:16', label: '9:16', desc: 'Vertical (Portrait)' },
  { id: '1:1', label: '1:1', desc: 'Square' },
  { id: '4:3', label: '4:3', desc: 'Standard' },
] as const;

export const QUALITY_OPTIONS = [
  { id: '480p', label: '480p', desc: 'Standard' },
  { id: '720p', label: '720p', desc: 'High' },
  { id: '1080p', label: '1080p', desc: 'Full HD' },
  { id: '2k', label: '2k', desc: 'Ultra HD' },
] as const;

export const VIDEO_DURATION_OPTIONS = [
  { id: 5, label: '5s', desc: 'Short' },
  { id: 10, label: '10s', desc: 'Medium' },
  { id: 15, label: '15s', desc: 'Long' },
] as const;

export const FLOW_DURATION_OPTIONS = [
  { id: 2, label: '2s', desc: 'Quick' },
  { id: 4, label: '4s', desc: 'Short' },
  { id: 6, label: '6s', desc: 'Default' },
  { id: 8, label: '8s', desc: 'Medium' },
  { id: 10, label: '10s', desc: 'Long' },
] as const;

export const AGENT_DURATION_OPTIONS = [
  { id: 30, label: '30s', desc: 'Short' },
  { id: 40, label: '40s', desc: 'Medium' },
  { id: 50, label: '50s', desc: 'Long' },
] as const;
