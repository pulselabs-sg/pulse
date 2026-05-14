import { Zap, Mic, Wand2, Type, AudioLines, History, User, Globe } from 'lucide-react';

export type Tab = 'tts' | 'stt' | 'clean' | 'changer' | 'clone' | 'translate' | 'profile' | 'history';
export type Tier = 'FREE' | 'BASIC' | 'PREMIUM' | 'PRO';

export const VOICES = [
  { id: 'eve', name: 'Eve', gender: 'Female', tone: 'Energetic & Upbeat', gradient: 'from-pink-500 via-rose-400 to-orange-400' },
  { id: 'ara', name: 'Ara', gender: 'Female', tone: 'Warm & Friendly', gradient: 'from-fuchsia-500 via-purple-500 to-indigo-500' },
  { id: 'rex', name: 'Rex', gender: 'Male', tone: 'Confident & Clear', gradient: 'from-cyan-500 via-blue-500 to-indigo-600' },
  { id: 'sal', name: 'Sal', gender: 'Neutral', tone: 'Smooth & Versatile', gradient: 'from-emerald-400 via-teal-500 to-cyan-600' },
  { id: 'leo', name: 'Leo', gender: 'Male', tone: 'Authoritative & Strong', gradient: 'from-orange-500 via-red-500 to-rose-600' },
];

export const TIER_LIMITS = {
  FREE: { pulse: 20000, maxTTSChars: 5000, maxAudioMins: 5, cloneLimit: 0 },
  BASIC: { pulse: 60000, maxTTSChars: 5000, maxAudioMins: 5, cloneLimit: 2 },
  PREMIUM: { pulse: 150000, maxTTSChars: 10000, maxAudioMins: 10, cloneLimit: 5 },
  PRO: { pulse: 800000, maxTTSChars: 15000, maxAudioMins: 15, cloneLimit: 10 },
} as const;

export const PLANS = [
  { id: 'FREE' as Tier, name: 'Free', priceMonthly: 0, priceYearly: 0, desc: 'Test the engine', features: ['20,000 Pulse/month', '5,000 characters TTS limit', '5 minutes STT/Audio limit', 'No Voice Cloning'], popular: false },
  { id: 'BASIC' as Tier, name: 'Basic', priceMonthly: 5, priceYearly: 50, desc: 'For regular creators', features: ['60,000 Pulse/month', '5,000 characters TTS limit', '5 minutes STT/Audio limit', 'Voice Cloning Access (Max 2)'], popular: true },
  { id: 'PREMIUM' as Tier, name: 'Premium', priceMonthly: 10, priceYearly: 100, desc: 'For serious creators', features: ['150,000 Pulse/month', '10,000 characters TTS limit', '10 minutes STT/Audio limit', 'Voice Cloning Access (Max 5)'], popular: false },
  { id: 'PRO' as Tier, name: 'Pro', priceMonthly: 50, priceYearly: 500, desc: 'High-volume production', features: ['800,000 Pulse/month', '15,000 characters TTS limit', '15 minutes STT/Audio limit', 'Voice Cloning Access (Max 10)'], popular: false },
];

export const TABS = [
  { id: 'tts', label: 'Text to Speech', icon: Wand2, desc: 'Convert text to natural voice' },
  { id: 'stt', label: 'Speech to Text', icon: Type, desc: 'Transcribe file/live conversations' },
  { id: 'translate', label: 'Translation', icon: Globe, desc: 'Translate audio to another language' },
  { id: 'changer', label: 'Voice Changer', icon: AudioLines, desc: 'Transform voice style' },
  { id: 'clone', label: 'Clone Voice', icon: Zap, desc: 'Create a custom voice identity' },
  { id: 'clean', label: 'Audio Cleaner', icon: Mic, desc: 'Remove noise & enhance' },
  { id: 'history', label: 'History', icon: History, desc: 'Your generation records' },
  { id: 'profile', label: 'Profile', icon: User, desc: 'Account & Billing' },
] as const;

export const TRANSLATION_LANGUAGES = [
  { id: 'English', name: 'English', flag: '🇺🇸' },
  { id: 'Spanish', name: 'Spanish', flag: '🇪🇸' },
  { id: 'French', name: 'French', flag: '🇫🇷' },
  { id: 'German', name: 'German', flag: '🇩🇪' },
  { id: 'Italian', name: 'Italian', flag: '🇮🇹' },
  { id: 'Portuguese', name: 'Portuguese', flag: '🇵🇹' },
  { id: 'Japanese', name: 'Japanese', flag: '🇯🇵' },
  { id: 'Korean', name: 'Korean', flag: '🇰🇷' },
  { id: 'Chinese (Simplified)', name: 'Chinese (Simp)', flag: '🇨🇳' },
  { id: 'Russian', name: 'Russian', flag: '🇷🇺' },
  { id: 'Arabic', name: 'Arabic', flag: '🇸🇦' },
  { id: 'Hindi', name: 'Hindi', flag: '🇮🇳' },
  { id: 'Vietnamese', name: 'Vietnamese', flag: '🇻🇳' },
];

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