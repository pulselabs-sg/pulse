import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use local IP for physical devices or Android emulator, localhost for iOS simulator
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://c5d6-2402-800-63a8-dc07-7c3b-f169-3116-48db.ngrok-free.app';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const sessionToken = await SecureStore.getItemAsync('sessionToken');
    if (sessionToken && sessionToken !== 'cookie-auth') {
      // For development, cookie name might be 'next-auth.session-token'
      // For production, it's '__Secure-next-auth.session-token'
      // Let's attach it. Next.js might expect it as a Cookie header.
      config.headers.Cookie = `next-auth.session-token=${sessionToken}; __Secure-next-auth.session-token=${sessionToken}`;
    }
  } catch (error) {
    console.error('Error fetching session token from secure store', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token is invalid/expired
      await SecureStore.deleteItemAsync('sessionToken');
      // Can't easily use expo-router outside components, but the next fetchSession will catch it
    }
    return Promise.reject(error);
  }
);

export const uploadFile = async (uri: string, name: string, type: string) => {
  const formData = new FormData();
  // Prepare file details for native upload
  formData.append('file', {
    uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
    name,
    type,
  } as any);

  const response = await api.post('/api/upload/mobile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: (data) => data, // Keep raw FormData object in Axios RN
  });

  return response.data;
};

export default api;

