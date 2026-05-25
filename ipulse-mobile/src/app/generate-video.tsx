import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { generateVideo } from '@/services/video';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const STYLES = ['Cinematic 3D', 'Anime Dream', 'Cyberpunk Neon', 'Classical Oil'];
const RATIOS = ['16:9', '9:16', '1:1', '4:3'];

export default function GenerateVideoScreen() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(STYLES[0]);
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Wait at 95% for actual API to finish
        return prev + 5;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResult(null);

    try {
      const response = await generateVideo({
        prompt: `${prompt}, ${style} style`,
        duration: 5,
        aspectRatio: ratio,
      });
      setProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setResult(response);
      }, 500);
    } catch (error: any) {
      console.error(error);
      setIsGenerating(false);
      Alert.alert('Generation Failed', error?.response?.data?.error || error.message || 'Unknown error occurred');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="bg-zinc-900 w-10 h-10 rounded-full items-center justify-center border border-white/5"
            >
              <Text className="text-white text-lg">←</Text>
            </TouchableOpacity>
            <View className="items-center">
              <Text className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">iPulse Studio</Text>
              <Text className="text-white font-bold tracking-tight text-base mt-0.5">Prompt to Video</Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-zinc-900/50 px-2.5 py-1.5 rounded-full border border-white/5">
              <View className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
              <Text className="text-[10px] font-mono text-zinc-400">{isGenerating ? 'RENDERING' : 'READY'}</Text>
            </View>
          </View>

          <View className="p-6">
            {/* Prompt Input */}
            <View className="mb-6">
              <Text className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3 ml-1">Prompt Input</Text>
              <TextInput
                className="bg-black/50 border border-white/10 text-white rounded-2xl p-4 min-h-[100px] text-sm leading-relaxed"
                placeholder="A cinematic landscape of glowing crystal forests, highly detailed..."
                placeholderTextColor="#52525b"
                multiline
                textAlignVertical="top"
                value={prompt}
                onChangeText={setPrompt}
                style={{ fontFamily: 'GoogleSans-Regular' }}
              />
            </View>

            {/* Style Selection */}
            <View className="mb-6">
              <Text className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3 ml-1">Creative Style</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {STYLES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStyle(s)}
                    className={`mr-3 px-4 py-2.5 rounded-xl border ${style === s ? 'bg-white/10 border-white/30' : 'bg-black/40 border-white/5'}`}
                  >
                    <Text className={`text-xs font-mono ${style === s ? 'text-white font-bold' : 'text-zinc-500'}`}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Aspect Ratio Selection */}
            <View className="mb-8">
              <Text className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3 ml-1">Aspect Ratio</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {RATIOS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRatio(r)}
                    className={`mr-3 px-4 py-2.5 rounded-xl border ${ratio === r ? 'bg-white/10 border-white/30' : 'bg-black/40 border-white/5'}`}
                  >
                    <Text className={`text-xs font-mono ${ratio === r ? 'text-white font-bold' : 'text-zinc-500'}`}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Generate Button */}
            <TouchableOpacity 
              className={`py-4 rounded-2xl items-center flex-row justify-center shadow-lg mb-8 ${isGenerating ? 'bg-zinc-800' : 'bg-white active:bg-zinc-200'}`}
              onPress={handleGenerate}
              disabled={isGenerating}
            >
              <Text className="text-xl mr-2">✨</Text>
              <Text className={`font-mono font-bold tracking-widest uppercase text-xs ${isGenerating ? 'text-zinc-500' : 'text-black'}`}>
                {isGenerating ? `GENERATING (${progress}%)` : 'GENERATE VIDEO'}
              </Text>
            </TouchableOpacity>

            {/* Preview Panel */}
            <View className="mb-2">
              <Text className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-3 ml-1">Generated Preview</Text>
              <View className="bg-black/60 border border-white/10 rounded-3xl p-6 min-h-[220px] items-center justify-center overflow-hidden relative">
                
                {isGenerating && (
                  <View className="absolute inset-0 items-center justify-center z-20 bg-black/80">
                    <ActivityIndicator size="large" color="#22d3ee" className="mb-4" />
                    <Text className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-1">Rendering Matrix</Text>
                    <Text className="text-lg font-mono text-cyan-400 font-bold">{progress}%</Text>
                  </View>
                )}

                {!isGenerating && !result && (
                  <View className="items-center opacity-40">
                    <Text className="text-5xl mb-4">🎬</Text>
                    <Text className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Waiting for prompt</Text>
                  </View>
                )}

                {!isGenerating && result && (
                  <View className="items-center w-full">
                    <View className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-4">
                      <Text className="text-2xl">✅</Text>
                    </View>
                    <Text className="text-xs font-mono text-zinc-300 uppercase tracking-widest mb-2 text-center">Rendering Complete</Text>
                    <Text className="text-xs font-mono text-zinc-500 text-center italic mb-4" numberOfLines={2}>
                      "{prompt || 'Generated video'}"
                    </Text>
                    <View className="w-full bg-white/5 rounded-xl p-3 border border-white/5">
                      <Text className="text-[10px] font-mono text-zinc-400 mb-1">REQ ID: <Text className="text-white">{result.request_id || 'N/A'}</Text></Text>
                      <Text className="text-[10px] font-mono text-zinc-400">COST: <Text className="text-cyan-400">{result.cost || 0} Pulse</Text></Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
