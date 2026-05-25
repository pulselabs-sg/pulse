import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import '../global.css';

import { Stack } from 'expo-router';
import { AuthProvider } from '@/services/authContext';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    'Inter_400Regular': require('../../assets/fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf'),
    'Inter_500Medium': require('../../assets/fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf'),
    'Inter_700Bold': require('../../assets/fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf'),
    'GoogleSans-Regular': require('../../assets/fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf'),
    'GoogleSans-Medium': require('../../assets/fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf'),
    'GoogleSans-Bold': require('../../assets/fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf'),
  });

  const [showIntro, setShowIntro] = useState(true);
  const introSource = require('../../assets/images/intro-transparent.mov');
  const player = useVideoPlayer(introSource, player => {
    player.loop = false;
    player.muted = true;
    player.play();
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      setTimeout(() => setShowIntro(false), 4000);
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="generate-video" />
            <Stack.Screen name="audio-engine" />
            <Stack.Screen name="visual-engine" />
          </Stack>
        </ThemeProvider>
      </AuthProvider>

      {showIntro && (loaded || error) && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000000ff', zIndex: 999, justifyContent: 'center', alignItems: 'center' }]}>
          <VideoView
            player={player}
            style={{ width: 120, height: 120 }}
            contentFit="contain"
            nativeControls={false}
          />
        </View>
      )}
    </View>
  );
}
