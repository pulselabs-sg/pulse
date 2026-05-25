import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from '@/services/authContext';
import { router } from 'expo-router';
import { BASE_URL } from '@/services/api';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const webviewRef = useRef<WebView>(null);

  const INJECTED_JAVASCRIPT = `
    (function() {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.getElementsByTagName('head')[0].appendChild(meta);

      if (window.location.pathname === '/visual' || window.location.pathname === '/audio' || window.location.pathname === '/') {
        fetch('/api/auth/mobile-token')
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.token) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOGIN_SUCCESS', payload: data.token }));
            } else {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOGIN_SUCCESS', payload: 'cookie-auth' }));
            }
          })
          .catch(function(err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'LOGIN_SUCCESS', payload: 'cookie-auth' }));
          });
      }
    })();
    true;
  `;

  const onMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOGIN_SUCCESS' || data.type === 'TOKEN') {
        await signIn(data.payload || 'cookie-auth');
        router.replace('/');
      }
    } catch (e) {
      console.error('Error parsing webview message', e);
    }
  };

  const customUserAgent = Platform.OS === 'android' 
    ? 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

  return (
    <View className="flex-1 bg-black" style={{ flex: 1, backgroundColor: 'black' }}>
      <WebView
        ref={webviewRef}
        source={{ uri: `${BASE_URL}/login` }}
        injectedJavaScript={INJECTED_JAVASCRIPT}
        onMessage={onMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-black">
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        javaScriptEnabled={true}
        sharedCookiesEnabled={true}
        userAgent={customUserAgent}
      />
    </View>
  );
}
