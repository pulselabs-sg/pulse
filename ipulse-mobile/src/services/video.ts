import api, { BASE_URL } from './api';
import * as SecureStore from 'expo-secure-store';

export interface GenerateVideoPayload {
  prompt: string;
  duration?: number;
  referenceImageBase64?: string;
  mode?: 'flow' | 'generation' | 'video';
  quality?: string;
  aspectRatio?: string;
}

export interface GenerateImagePayload {
  prompt: string;
  feature?: string;
  referenceImageBase64?: string;
  aspectRatio?: string;
  quality?: string;
}

// 1. Video Generation
export const generateVideo = async (payload: GenerateVideoPayload) => {
  const response = await api.post('/api/visual/generate-video', payload);
  return response.data;
};

// 2. Video Generation Status Polling
export const checkVideoStatus = async (requestId: string, duration: number, quality: string) => {
  const response = await api.get(`/api/visual/video-status?request_id=${requestId}&duration=${duration}&quality=${quality}`);
  return response.data;
};

// 3. Image Generation
export const generateImage = async (payload: GenerateImagePayload) => {
  const response = await api.post('/api/visual/generate-image', payload);
  return response.data;
};

// 4. Prompt Check/Validation
export const checkPrompt = async (prompt: string, hasImage: boolean) => {
  const response = await api.post('/api/visual/prompt-check', { prompt, hasImage });
  return response.data;
};

// 5. Project Management
export const fetchProjects = async () => {
  const response = await api.get('/api/visual/projects');
  return response.data;
};

export const createProject = async (name: string) => {
  const response = await api.post('/api/visual/projects', { name });
  return response.data;
};

export const deleteProject = async (id: string) => {
  const response = await api.delete(`/api/visual/projects/${id}`);
  return response.data;
};

export const renameProject = async (id: string, name: string) => {
  const response = await api.put(`/api/visual/projects/${id}`, { name });
  return response.data;
};

// 6. Visual History Management
export const fetchVisualHistory = async (projectId: string) => {
  const response = await api.get(`/api/history?projectId=${projectId}`);
  return response.data.filter((h: any) => h.type === 'visual');
};

export const saveHistoryItem = async (payload: { type: 'visual'; input: string; output: string; projectId: string }) => {
  const response = await api.post('/api/history', payload);
  return response.data;
};

export const deleteHistoryItem = async (id: string) => {
  const response = await api.delete(`/api/history?id=${id}`);
  return response.data;
};

// 7. Live Autonomous Agent Crew (SSE stream helper)
export interface AgentPayload {
  prompt: string;
  referenceImageBase64: string | null;
  intent: string | null;
  aspectRatio: string;
  quality: string;
  duration: number;
}

export const runAgentStream = async (
  payload: AgentPayload,
  onEvent: (event: string, data: any) => void,
  onError: (err: any) => void
) => {
  const sessionToken = await SecureStore.getItemAsync('sessionToken');

  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${BASE_URL}/api/visual/agent`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  if (sessionToken && sessionToken !== 'cookie-auth') {
    xhr.setRequestHeader('Cookie', `next-auth.session-token=${sessionToken}; __Secure-next-auth.session-token=${sessionToken}`);
  }

  let offset = 0;
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 3 || xhr.readyState === 4) {
      const responseText = xhr.responseText;
      const chunk = responseText.slice(offset);
      offset = responseText.length;

      // Split SSE events separated by \n\n or \n
      const parts = chunk.split('\n\n');
      for (const part of parts) {
        if (!part.trim()) continue;
        const lines = part.split('\n');
        let event = '';
        let dataStr = '';
        for (const line of lines) {
          if (line.startsWith('event:')) {
            event = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            dataStr = line.replace('data:', '').trim();
          }
        }
        if (event && dataStr) {
          try {
            const data = JSON.parse(dataStr);
            onEvent(event, data);
          } catch (e) {
            console.warn('Failed to parse SSE event data', e);
          }
        }
      }
    }

    if (xhr.readyState === 4) {
      if (xhr.status !== 200) {
        onError(new Error(`Agent stream failed with status ${xhr.status}`));
      }
    }
  };

  xhr.onerror = (err) => {
    onError(err);
  };

  xhr.send(JSON.stringify(payload));
  return xhr;
};

