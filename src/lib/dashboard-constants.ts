import { Zap, Mic, Wand2, Type, AudioLines, History, User } from 'lucide-react';

export type Tab = 'tts' | 'stt' | 'clean' | 'changer' | 'profile' | 'history';
export type Tier = 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';

export const VOICES = [
  { id: 'eve', name: 'Eve', gender: 'Female', tone: 'Energetic & Upbeat', gradient: 'from-pink-500 via-rose-400 to-orange-400' },
  { id: 'ara', name: 'Ara', gender: 'Female', tone: 'Warm & Friendly', gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500' },
  { id: 'rex', name: 'Rex', gender: 'Male', tone: 'Confident & Clear', gradient: 'from-cyan-500 via-blue-500 to-indigo-600' },
  { id: 'sal', name: 'Sal', gender: 'Neutral', tone: 'Smooth & Versatile', gradient: 'from-emerald-400 via-teal-500 to-cyan-600' },
  { id: 'leo', name: 'Leo', gender: 'Male', tone: 'Authoritative & Strong', gradient: 'from-orange-500 via-red-500 to-rose-600' },
  { id: 'una', name: 'Una', gender: 'Female', tone: 'Gentle & Natural', gradient: 'from-violet-400 via-purple-400 to-fuchsia-400' },
];

export const TIER_LIMITS = {
  FREE: { generations: 5, maxFileMB: 50, maxChars: 5000 },
  BASIC: { generations: 20, maxFileMB: 300, maxChars: 10000 },
  PREMIUM: { generations: 100, maxFileMB: 500, maxChars: 15000 },
  PRO: { generations: 300, maxFileMB: 500, maxChars: 15000 },
} as const;

export const PLANS = [
  { id: 'FREE' as Tier, name: 'Free', price: 0, period: '/mo', desc: 'Test the engine', features: ['5 generations/month', '50 MB files', '5,000 characters TTS'], popular: false },
  { id: 'BASIC' as Tier, name: 'Basic', price: 5.00, period: '/mo', desc: 'For regular creators', features: ['20 generations/month', '300 MB files', '10,000 characters TTS', 'Commercial license'], popular: true },
  { id: 'PREMIUM' as Tier, name: 'Premium', price: 10.00, period: '/mo', desc: 'For serious creators', features: ['100 generations/month', '500 MB files', '15,000 characters TTS', 'Priority support'], popular: false },
  { id: 'PRO' as Tier, name: 'Pro', price: 50.00, period: '/mo', desc: 'High-volume production', features: ['300 generations/month', '500 MB files', '15,000 characters TTS', 'Enterprise ready'], popular: false },
];

export const TABS = [
  { id: 'tts', label: 'Text to Speech', icon: Wand2, desc: 'Convert text to natural voice' },
  { id: 'stt', label: 'Speech to Text', icon: Type, desc: 'Transcribe audio to text' },
  { id: 'changer', label: 'Voice Changer', icon: AudioLines, desc: 'Transform voice style' },
  { id: 'clean', label: 'Audio Cleaner', icon: Mic, desc: 'Remove noise & enhance' },
  { id: 'history', label: 'History Log', icon: History, desc: 'Your generation records' },
  { id: 'profile', label: 'Profile', icon: User, desc: 'Account & Billing' },
] as const;

export const formatSTTText = (text: string) => {
  if (!text) return '';
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  const formattedSentences = sentences.map(s => {
    let trimmed = s.trim();
    if (!trimmed) return '';
    trimmed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (!/[.!?]$/.test(trimmed)) trimmed += '.';
    return trimmed;
  }).filter(Boolean);

  const paragraphs = [];
  for (let i = 0; i < formattedSentences.length; i += 3) {
    paragraphs.push(formattedSentences.slice(i, i + 3).join(' '));
  }
  return paragraphs.join('\n\n');
};