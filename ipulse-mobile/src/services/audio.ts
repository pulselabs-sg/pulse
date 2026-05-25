import { cacheDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import api, { uploadFile } from './api';

export interface TTSPayload {
  text: string;
  voiceId: string;
  format: 'mp3' | 'wav' | 'pcm' | 'ulaw';
}

export interface VoiceChangerPayload {
  fileUrl: string;
  fileName: string;
  targetVoice: string;
  format: 'mp3' | 'wav' | 'pcm' | 'ulaw';
}

export interface TranslatePayload {
  fileUrl: string;
  fileName: string;
  targetLanguage: string;
  targetVoice: string;
  format: 'mp3' | 'wav' | 'pcm' | 'ulaw';
}

// Pure JS ArrayBuffer to Base64 converter
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i;
  const l = bytes.length;
  for (i = 2; i < l; i += 3) {
    result += chars[bytes[i - 2] >> 2];
    result += chars[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
    result += chars[((bytes[i - 1] & 0x0f) << 2) | (bytes[i] >> 6)];
    result += chars[bytes[i] & 0x3f];
  }
  if (i === l + 1) {
    result += chars[bytes[i - 2] >> 2];
    result += chars[(bytes[i - 2] & 0x03) << 4];
    result += '==';
  } else if (i === l) {
    result += chars[bytes[i - 2] >> 2];
    result += chars[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
    result += chars[(bytes[i - 1] & 0x0f) << 2];
    result += '=';
  }
  return result;
};

// 1. Text-To-Speech (POST returns binary stream, download to cache)
export const generateTTS = async (payload: TTSPayload): Promise<string> => {
  const localUri = `${cacheDirectory || ''}tts-${Date.now()}.${payload.format}`;
  
  const response = await api.post('/api/text-to-speech', payload, {
    responseType: 'arraybuffer',
  });

  const base64Content = arrayBufferToBase64(response.data);
  await writeAsStringAsync(localUri, base64Content, { encoding: EncodingType.Base64 });

  return localUri;
};

// 2. Speech-To-Text (upload audio, then transcribe)
export const transcribeSTT = async (fileUri: string, name: string, type: string) => {
  // First upload the file
  const uploadRes = await uploadFile(fileUri, name, type);
  const fileUrl = uploadRes.url;

  // Then call transcription endpoint
  const response = await api.post('/api/speech-to-text', {
    fileUrl,
    fileName: name,
  });

  return response.data;
};

// 3. Voice Changer (upload audio, then post changer, returns binary stream)
export const changeVoice = async (fileUri: string, name: string, type: string, targetVoice: string, format: 'mp3' | 'wav' | 'pcm' | 'ulaw'): Promise<string> => {
  // Upload
  const uploadRes = await uploadFile(fileUri, name, type);
  const fileUrl = uploadRes.url;

  // Post Voice Changer
  const localUri = `${cacheDirectory || ''}changer-${Date.now()}.${format}`;
  
  const payload: VoiceChangerPayload = {
    fileUrl,
    fileName: name,
    targetVoice,
    format,
  };

  const response = await api.post('/api/voice-changer', payload, {
    responseType: 'arraybuffer',
  });

  const base64Content = arrayBufferToBase64(response.data);
  await writeAsStringAsync(localUri, base64Content, { encoding: EncodingType.Base64 });

  return localUri;
};

// 4. Clean Audio (upload audio, then post clean, returns binary stream)
export const cleanAudio = async (fileUri: string, name: string, type: string): Promise<string> => {
  // Upload
  const uploadRes = await uploadFile(fileUri, name, type);
  const fileUrl = uploadRes.url;

  const localUri = `${cacheDirectory || ''}clean-${Date.now()}.mp3`;

  const response = await api.post('/api/clean-audio', { fileUrl, fileName: name }, {
    responseType: 'arraybuffer',
  });

  const base64Content = arrayBufferToBase64(response.data);
  await writeAsStringAsync(localUri, base64Content, { encoding: EncodingType.Base64 });

  return localUri;
};

// 5. Translate (upload audio, then translate, returns binary stream)
export const translateAudio = async (
  fileUri: string, 
  name: string, 
  type: string, 
  targetLanguage: string, 
  targetVoice: string, 
  format: 'mp3' | 'wav' | 'pcm' | 'ulaw'
): Promise<string> => {
  // Upload
  const uploadRes = await uploadFile(fileUri, name, type);
  const fileUrl = uploadRes.url;

  const localUri = `${cacheDirectory || ''}translate-${Date.now()}.${format}`;

  const payload: TranslatePayload = {
    fileUrl,
    fileName: name,
    targetLanguage,
    targetVoice,
    format,
  };

  const response = await api.post('/api/translate', payload, {
    responseType: 'arraybuffer',
  });

  const base64Content = arrayBufferToBase64(response.data);
  await writeAsStringAsync(localUri, base64Content, { encoding: EncodingType.Base64 });

  return localUri;
};

// 6. Voice Cloning (upload audio, then create cloned voice profile)
export const cloneVoice = async (fileUri: string, name: string, type: string) => {
  // Upload sample
  const uploadRes = await uploadFile(fileUri, name, type);
  const fileUrl = uploadRes.url;

  // Save voice identity
  const response = await api.post('/api/clone-voice', {
    fileUrl,
    fileName: name,
  });

  return response.data;
};

// 7. Custom Voices Management
export const fetchCustomVoices = async () => {
  const response = await api.get('/api/custom-voices');
  return response.data.voices || [];
};

export const renameCustomVoice = async (id: string, name: string) => {
  const response = await api.patch(`/api/custom-voices/${id}`, { name });
  return response.data.voice;
};

export const deleteCustomVoice = async (id: string) => {
  const response = await api.delete(`/api/custom-voices/${id}`);
  return response.data;
};

// 8. Fetch User's Audio Generation History
export const fetchAudioHistory = async () => {
  const response = await api.get('/api/history');
  return response.data.filter((h: any) => h.type !== 'visual');
};

export const deleteHistoryItem = async (id: string) => {
  const response = await api.delete(`/api/history?id=${id}`);
  return response.data;
};
