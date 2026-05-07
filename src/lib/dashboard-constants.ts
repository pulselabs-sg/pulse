import { Zap, Mic, Wand2, Type, AudioLines, History, User } from 'lucide-react';

export type Tab = 'tts' | 'stt' | 'clean' | 'changer' | 'clone' | 'profile' | 'history';
export type Tier = 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';

export const VOICES = [
  { id: 'eve', name: 'Eve', gender: 'Female', tone: 'Energetic & Upbeat', gradient: 'from-pink-500 via-rose-400 to-orange-400' },
  { id: 'ara', name: 'Ara', gender: 'Female', tone: 'Warm & Friendly', gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500' },
  { id: 'rex', name: 'Rex', gender: 'Male', tone: 'Confident & Clear', gradient: 'from-cyan-500 via-blue-500 to-indigo-600' },
  { id: 'sal', name: 'Sal', gender: 'Neutral', tone: 'Smooth & Versatile', gradient: 'from-emerald-400 via-teal-500 to-cyan-600' },
  { id: 'leo', name: 'Leo', gender: 'Male', tone: 'Authoritative & Strong', gradient: 'from-orange-500 via-red-500 to-rose-600' },
  { id: 'laura', name: 'Laura', gender: 'Female', tone: 'Professional & Calm', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
  { id: 'michael', name: 'Michael', gender: 'Male', tone: 'Deep & Resonant', gradient: 'from-slate-600 via-gray-600 to-zinc-700' },
  { id: 'nicole', name: 'Nicole', gender: 'Female', tone: 'Conversational & Engaging', gradient: 'from-rose-400 via-red-400 to-orange-500' },
  { id: 'adam', name: 'Adam', gender: 'Male', tone: 'Warm & Trustworthy', gradient: 'from-blue-400 via-sky-500 to-cyan-500' },
  { id: 'glinda', name: 'Glinda', gender: 'Female', tone: 'Expressive & Magical', gradient: 'from-pink-400 via-purple-400 to-indigo-400' },
];

export const TIER_LIMITS = {
  FREE: { pulse: 20000, maxTTSChars: 5000, maxAudioMins: 5, cloneLimit: 0 },
  BASIC: { pulse: 60000, maxTTSChars: 5000, maxAudioMins: 5, cloneLimit: 2 },
  PREMIUM: { pulse: 150000, maxTTSChars: 10000, maxAudioMins: 10, cloneLimit: 5 },
  PRO: { pulse: 800000, maxTTSChars: 15000, maxAudioMins: 15, cloneLimit: 10 },
} as const;

export const PLANS = [
  { id: 'FREE' as Tier, name: 'Free', price: 0, period: '/mo', desc: 'Test the engine', features: ['20,000 Pulse/month', '5,000 characters TTS limit', '5 minutes STT/Audio limit', 'No Voice Cloning'], popular: false },
  { id: 'BASIC' as Tier, name: 'Basic', price: 5.00, period: '/mo', desc: 'For regular creators', features: ['60,000 Pulse/month', '5,000 characters TTS limit', '5 minutes STT/Audio limit', 'Voice Cloning Access (Max 2)'], popular: true },
  { id: 'PREMIUM' as Tier, name: 'Premium', price: 10.00, period: '/mo', desc: 'For serious creators', features: ['150,000 Pulse/month', '10,000 characters TTS limit', '10 minutes STT/Audio limit', 'Voice Cloning Access (Max 5)'], popular: false },
  { id: 'PRO' as Tier, name: 'Pro', price: 50.00, period: '/mo', desc: 'High-volume production', features: ['800,000 Pulse/month', '15,000 characters TTS limit', '15 minutes STT/Audio limit', 'Voice Cloning Access (Max 10)'], popular: false },
];

export const TABS = [
  { id: 'tts', label: 'Text to Speech', icon: Wand2, desc: 'Convert text to natural voice' },
  { id: 'stt', label: 'Speech to Text', icon: Type, desc: 'Transcribe file/live conversations' },
  { id: 'changer', label: 'Voice Changer', icon: AudioLines, desc: 'Transform voice style' },
  { id: 'clone', label: 'Clone Voice', icon: Zap, desc: 'Create a custom voice identity' },
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