/**
 * Audio Engine — Mobile App
 * Layout philosophy mirrors web app:
 * - Main area: black/dark canvas showing output or idle state
 * - Bottom input bar: tab icon (settings) | + (file) | text input | send
 * - Settings bottom sheet: TTS/STT/Changer/Clone/Translate tabs + options
 * - Right slide: History panel
 * - Voice modal: full-screen selector with gradient avatars
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Clipboard,
  Modal,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import api, { BASE_URL } from '../services/api';
import { clearSessionToken } from '../services/auth';
import {
  generateTTS, transcribeSTT, changeVoice, translateAudio,
  cloneVoice, fetchCustomVoices, deleteCustomVoice, fetchAudioHistory, deleteHistoryItem,
  cleanAudio
} from '../services/audio';
import WaveformLoader from '../components/WaveformLoader';
import { COLORS, SHADOWS, S } from '../constants/theme';
import {
  TextInitial, Mic, RefreshCw, Dna, Globe, Brush, SquarePlay,
  Settings, History, LayoutDashboard, User, Crown, X, ChevronDown, CheckCircle2, UploadCloud, Play, Pause
} from 'lucide-react-native';

const { width: SW } = Dimensions.get('window');
const HISTORY_WIDTH = Math.min(SW * 0.78, 310);

type TabKey = 'tts' | 'stt' | 'changer' | 'translate' | 'clean';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'tts', label: 'TTS', icon: <TextInitial color={COLORS.zinc400} size={16} /> },
  { key: 'stt', label: 'STT', icon: <Mic color={COLORS.zinc400} size={16} /> },
  { key: 'changer', label: 'Changer', icon: <RefreshCw color={COLORS.zinc400} size={16} /> },
  { key: 'translate', label: 'Translate', icon: <Globe color={COLORS.zinc400} size={16} /> },
  { key: 'clean', label: 'Cleaner', icon: <Brush color={COLORS.zinc400} size={16} /> },
];

const TAB_STAGES: Record<TabKey, string[]> = {
  tts: ['Encoding Text', 'Synthesizing Voice', 'Rendering Audio', 'Finalizing Output'],
  stt: ['Uploading Audio', 'Decoding Signal', 'Transcribing', 'Formatting Text'],
  changer: ['Uploading Audio', 'Analyzing Voice', 'Transforming', 'Mastering Output'],
  translate: ['Uploading Audio', 'Detecting Language', 'Translating', 'Synthesizing Voice'],
  clean: ['Uploading Audio', 'Denoising Signal', 'Deep Filtering', 'Enhancing Quality'],
};

const VOICES_PRESET = [
  { id: 'ara', name: 'Ara', gender: 'Female', country: 'Global', language: 'Multilingual', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'eve', name: 'Eve', gender: 'Female', country: 'Global', language: 'Multilingual', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'leo', name: 'Leo', gender: 'Male', country: 'Global', language: 'Multilingual', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'rex', name: 'Rex', gender: 'Male', country: 'Global', language: 'Multilingual', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'sal', name: 'Sal', gender: 'Male', country: 'Global', language: 'Multilingual', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'jpi39icg', name: 'Jian', gender: 'Male', country: 'China', language: 'Chinese (Simplified)', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'd18jlf6v', name: 'Hao', gender: 'Male', country: 'China', language: 'Chinese (Simplified)', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'oao30dn1', name: 'Yue', gender: 'Female', country: 'China', language: 'Chinese (Simplified)', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '33g9t0jl', name: 'Xia', gender: 'Female', country: 'China', language: 'Chinese (Simplified)', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '26w6ihxi', name: 'Pavel', gender: 'Male', country: 'Russia', language: 'Russian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'dr8gqysu', name: 'Andrei', gender: 'Male', country: 'Russia', language: 'Russian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'wy0m9l5w', name: 'Dmitri', gender: 'Male', country: 'Russia', language: 'Russian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'om17cury', name: 'Irina', gender: 'Female', country: 'Russia', language: 'Russian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'x7avnu1k', name: 'Enzo', gender: 'Male', country: 'Italy', language: 'Italian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'bcs7l2c3', name: 'Matteo', gender: 'Male', country: 'Italy', language: 'Italian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'hqxr4yub', name: 'Luca', gender: 'Male', country: 'Italy', language: 'Italian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'h27ltdnz', name: 'Alessandro', gender: 'Male', country: 'Italy', language: 'Italian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'uupejnl3', name: 'Vikram', gender: 'Male', country: 'India', language: 'Hindi', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '89q2pnko', name: 'Karan', gender: 'Male', country: 'India', language: 'Hindi', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '6visocna', name: 'Arjun', gender: 'Male', country: 'India', language: 'Hindi', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '73xd5dum', name: 'Ananya', gender: 'Female', country: 'India', language: 'Hindi', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '0p0rt7o1', name: 'Remi', gender: 'Male', country: 'France', language: 'French', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'hbxkrnwm', name: 'Hugo', gender: 'Male', country: 'France', language: 'French', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '4v3o4p0r', name: 'Antoine', gender: 'Male', country: 'France', language: 'French', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '69smp8rm', name: 'Camille', gender: 'Female', country: 'France', language: 'French', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'yis75yfp', name: 'Manuel', gender: 'Male', country: 'Spain', language: 'Spanish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'ekhwx401', name: 'Javier', gender: 'Male', country: 'Spain', language: 'Spanish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'jupvcf34', name: 'Diego', gender: 'Male', country: 'Spain', language: 'Spanish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '0hhfxxqq', name: 'Andres', gender: 'Male', country: 'Spain', language: 'Spanish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '0ih5oi34', name: 'Kasper', gender: 'Male', country: 'Denmark', language: 'Danish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'gwnexu6y', name: 'Lars', gender: 'Male', country: 'Denmark', language: 'Danish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'q5n046zm', name: 'Sigrid', gender: 'Female', country: 'Denmark', language: 'Danish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '97zmdc6s', name: 'Ida', gender: 'Female', country: 'Denmark', language: 'Danish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'fc7de6afcf6c', name: 'Duc', gender: 'Male', country: 'Vietnam', language: 'Vietnamese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'fbf753daafd4', name: 'Fah', gender: 'Female', country: 'Thailand', language: 'Thai', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'f8cf5c2c78d4', name: 'Grace', gender: 'Female', country: 'United States', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'e22152e06fd8', name: 'Axel', gender: 'Male', country: 'Sweden', language: 'Swedish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'dfe7b9e7d217', name: 'Valtteri', gender: 'Male', country: 'Finland', language: 'Finnish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'd634b6da3d3b', name: 'Aylin', gender: 'Female', country: 'Turkey', language: 'Turkish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'd0cb9ff07d95', name: 'Sakura', gender: 'Female', country: 'Japan', language: 'Japanese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'c3a2c594479e', name: 'Helmi', gender: 'Female', country: 'Finland', language: 'Finnish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'bf9fe5b5f981', name: 'Jun-seo', gender: 'Male', country: 'South Korea', language: 'Korean', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'b5ae17439907', name: 'Min-jun', gender: 'Male', country: 'South Korea', language: 'Korean', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'b1a7441b97a1', name: 'Ren', gender: 'Male', country: 'Japan', language: 'Japanese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'abfbdf26f115', name: 'Mateus', gender: 'Male', country: 'Brazil', language: 'Portuguese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a13662ba951c', name: 'Thijs', gender: 'Male', country: 'Netherlands', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a0401c9101f8', name: 'Seo-yeon', gender: 'Female', country: 'South Korea', language: 'Korean', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '99c95cc8a177', name: 'Haruto', gender: 'Male', country: 'Japan', language: 'Japanese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '97fabd54445f', name: 'Katarzyna', gender: 'Female', country: 'Poland', language: 'Polish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '96819d0bd28d', name: 'Daniel', gender: 'Male', country: 'United States', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '91a9ffcaaab5', name: 'Hana', gender: 'Female', country: 'Japan', language: 'Japanese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '908c4626660f', name: 'Krit', gender: 'Male', country: 'Thailand', language: 'Thai', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '8a8b3d7dc1e8', name: 'Nadia', gender: 'Female', country: 'Saudi Arabia', language: 'Arabic', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '83c6f4fea98e', name: 'Eero', gender: 'Male', country: 'Finland', language: 'Finnish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '7a9ee820b342', name: 'Minh', gender: 'Male', country: 'Vietnam', language: 'Vietnamese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '79f3a8b96d43', name: 'Claire', gender: 'Female', country: 'United States', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '78a495fdbb39', name: 'James', gender: 'Male', country: 'United States', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '70013edeb8e8', name: 'Khalid', gender: 'Male', country: 'Saudi Arabia', language: 'Arabic', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '6da5baee46d0', name: 'Beatriz', gender: 'Female', country: 'Brazil', language: 'Portuguese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '670a0c3ac005', name: 'Emre', gender: 'Male', country: 'Turkey', language: 'Turkish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '5f523eb2b455', name: 'Lan', gender: 'Female', country: 'Vietnam', language: 'Vietnamese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '58d27475085e', name: 'Femke', gender: 'Female', country: 'Netherlands', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '4ff93971bfdc', name: 'Aroon', gender: 'Male', country: 'Thailand', language: 'Thai', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '490ea3be50b1', name: 'Saga', gender: 'Female', country: 'Sweden', language: 'Swedish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '458705c07139', name: 'Clara', gender: 'Female', country: 'Germany', language: 'German', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '42a9ea5c7190', name: 'Ploy', gender: 'Female', country: 'Thailand', language: 'Thai', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '41321eb41295', name: 'Moritz', gender: 'Male', country: 'Germany', language: 'German', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '40f31906b23d', name: 'Niklas', gender: 'Male', country: 'Germany', language: 'German', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '3d030bc92a87', name: 'Rafael', gender: 'Male', country: 'Brazil', language: 'Portuguese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '3a7889066fa2', name: 'Lena', gender: 'Female', country: 'Germany', language: 'German', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '37329fd8895a', name: 'Mateusz', gender: 'Male', country: 'Poland', language: 'Polish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '35c8d7f60dc8', name: 'Layla', gender: 'Female', country: 'Saudi Arabia', language: 'Arabic', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '34fd4dce1ba3', name: 'Elina', gender: 'Female', country: 'Finland', language: 'Finnish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '2badb5f46b1e', name: 'Jakub', gender: 'Male', country: 'Poland', language: 'Polish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '247783ebdd51', name: 'Noor', gender: 'Female', country: 'Netherlands', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '244e27b39200', name: 'Ruben', gender: 'Male', country: 'Netherlands', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '23be42535a45', name: 'Ji-yeon', gender: 'Female', country: 'South Korea', language: 'Korean', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '23468361b4ef', name: 'Tariq', gender: 'Male', country: 'Saudi Arabia', language: 'Arabic', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '1f046a033914', name: 'Erik', gender: 'Male', country: 'Sweden', language: 'Swedish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '1b12d5daee6b', name: 'Aleksandra', gender: 'Female', country: 'Poland', language: 'Polish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '182a91893636', name: 'Kaan', gender: 'Male', country: 'Turkey', language: 'Turkish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '15985536f5d7', name: 'Isabela', gender: 'Female', country: 'Brazil', language: 'Portuguese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '159744921aa4', name: 'Linnea', gender: 'Female', country: 'Sweden', language: 'Swedish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '0895a5b8ce5c', name: 'Mai', gender: 'Female', country: 'Vietnam', language: 'Vietnamese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '081994dd6edc', name: 'Elif', gender: 'Female', country: 'Turkey', language: 'Turkish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'f702f406', name: 'Olli', gender: 'Male', country: 'Finland', language: 'Finnish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'f4b9d6fc', name: 'Omar', gender: 'Male', country: 'Saudi Arabia', language: 'Arabic', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'f331ee80', name: 'Ahmet', gender: 'Male', country: 'Turkey', language: 'Turkish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'f2f41225', name: 'Maria', gender: 'Female', country: 'Spain', language: 'Spanish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'f15c6a6a', name: 'Henry', gender: 'Male', country: 'United Kingdom', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'ef4ce33e', name: 'Daan', gender: 'Male', country: 'Netherlands', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'eacafe1e', name: 'Vincent', gender: 'Male', country: 'Belgium', language: 'French', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'e5da67a7', name: 'Linh', gender: 'Female', country: 'Vietnam', language: 'Vietnamese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'e5d4f53e', name: 'Pol', gender: 'Male', country: 'Spain', language: 'Catalan', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'e521cc67', name: 'Hui', gender: 'Female', country: 'China', language: 'Chinese (Simplified)', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'e1fc5a89', name: 'Felix', gender: 'Male', country: 'Germany', language: 'German', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'e1b1007e', name: 'Rohan', gender: 'Male', country: 'Bangladesh', language: 'Bengali', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'd74461c6', name: 'Hyun-woo', gender: 'Male', country: 'South Korea', language: 'Korean', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'd2313a0d', name: 'Pablo', gender: 'Male', country: 'Spain', language: 'Spanish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'd11249e6', name: 'Emma', gender: 'Female', country: 'United States', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'cfccf16b', name: 'Mads', gender: 'Male', country: 'Denmark', language: 'Danish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'ce19f825', name: 'Magdalena', gender: 'Female', country: 'Poland', language: 'Polish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'cdb1cec8', name: 'Lieke', gender: 'Female', country: 'Netherlands', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'c630b236', name: 'Jordi', gender: 'Male', country: 'Spain', language: 'Catalan', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'c3cdb7a4', name: 'Bram', gender: 'Male', country: 'Belgium', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'bedd6226', name: 'Olivia', gender: 'Female', country: 'United Kingdom', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'bcf738e4', name: 'Vihaan', gender: 'Male', country: 'India', language: 'Hindi', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'bab9c92f', name: 'Elsa', gender: 'Female', country: 'Sweden', language: 'Swedish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'aedba6b4', name: 'Jeroen', gender: 'Male', country: 'Belgium', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a7b78b05', name: 'Sean', gender: 'Male', country: 'Ireland', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a69bdfe7', name: 'Astrid', gender: 'Female', country: 'Denmark', language: 'Danish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a656d78f', name: 'Budi', gender: 'Male', country: 'Indonesia', language: 'Indonesian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a5341c30', name: 'Nicha', gender: 'Female', country: 'Thailand', language: 'Thai', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a2aa4b79', name: 'Pooja', gender: 'Female', country: 'Bangladesh', language: 'Bengali', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a24f5341', name: 'Mikhail', gender: 'Male', country: 'Russia', language: 'Russian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a0fa45a6', name: 'Pedro', gender: 'Male', country: 'Brazil', language: 'Portuguese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: 'a00ce99a', name: 'Priya', gender: 'Female', country: 'India', language: 'Hindi', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '9efdd836', name: 'Istvan', gender: 'Male', country: 'Hungary', language: 'Hungarian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '9ec6157c', name: 'Aino', gender: 'Female', country: 'Finland', language: 'Finnish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '9ab26871', name: 'Wei', gender: 'Male', country: 'China', language: 'Chinese (Simplified)', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '93bea908', name: 'William', gender: 'Male', country: 'Sweden', language: 'Swedish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '7f989258', name: 'Adi', gender: 'Male', country: 'Indonesia', language: 'Indonesian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '777d3f85', name: 'Catarina', gender: 'Female', country: 'Brazil', language: 'Portuguese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '7160ae2c', name: 'Krisztina', gender: 'Female', country: 'Hungary', language: 'Hungarian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '70071d42', name: 'Tomasz', gender: 'Male', country: 'Poland', language: 'Polish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '6fe32f8a', name: 'Sophie', gender: 'Female', country: 'Netherlands', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '6a41d324', name: 'Liam', gender: 'Male', country: 'United States', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '6997b0ec', name: 'Yang', gender: 'Male', country: 'China', language: 'Chinese (Simplified)', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '681cd005', name: 'Gabor', gender: 'Male', country: 'Hungary', language: 'Hungarian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '6583fcc2', name: 'Eszter', gender: 'Female', country: 'Hungary', language: 'Hungarian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '5f0c2251', name: 'Youssef', gender: 'Male', country: 'Saudi Arabia', language: 'Arabic', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '5e3e2cbe', name: 'Mikko', gender: 'Male', country: 'Finland', language: 'Finnish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '5d695b41', name: 'Marc', gender: 'Male', country: 'South Africa', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '57b26f54', name: 'Anika', gender: 'Female', country: 'Bangladesh', language: 'Bengali', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '57700f39', name: 'Leon', gender: 'Male', country: 'Italy', language: 'Italian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '524f4cb1', name: 'Lucas', gender: 'Male', country: 'Denmark', language: 'Danish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '4e1d5545', name: 'Quang', gender: 'Male', country: 'Vietnam', language: 'Vietnamese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '4d9e4c6f', name: 'Mathieu', gender: 'Male', country: 'Belgium', language: 'French', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '4d3af3e1', name: 'Mireia', gender: 'Female', country: 'Spain', language: 'Catalan', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '4c7f16ff', name: 'Oscar', gender: 'Male', country: 'Sweden', language: 'Swedish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '4b7af2d7', name: 'Somchai', gender: 'Male', country: 'Thailand', language: 'Thai', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '4984accb', name: 'Zofia', gender: 'Female', country: 'Poland', language: 'Polish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '47519c37', name: 'Freja', gender: 'Female', country: 'Denmark', language: 'Danish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '46a802e3', name: 'Lucia', gender: 'Female', country: 'Spain', language: 'Spanish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '45357fd3', name: 'Mathilde', gender: 'Female', country: 'Belgium', language: 'French', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '44c91d64', name: 'Sonja', gender: 'Female', country: 'Germany', language: 'German', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '43423dee', name: 'Giulia', gender: 'Female', country: 'Italy', language: 'Italian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '3b7f37c9', name: 'Anke', gender: 'Female', country: 'Belgium', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '3b312632', name: 'Alice', gender: 'Female', country: 'Sweden', language: 'Swedish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '3a3e080c', name: 'Sofia', gender: 'Female', country: 'Finland', language: 'Finnish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '39e46ca3', name: 'Hoang', gender: 'Male', country: 'Vietnam', language: 'Vietnamese', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '355dca53', name: 'Niamh', gender: 'Female', country: 'Ireland', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '330f1e6d', name: 'Pim', gender: 'Female', country: 'Thailand', language: 'Thai', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '2902bcfd', name: 'Piotr', gender: 'Male', country: 'Poland', language: 'Polish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '20fa3f2e', name: 'Sri', gender: 'Female', country: 'Indonesia', language: 'Indonesian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '1ebfec36', name: 'Marco', gender: 'Male', country: 'Italy', language: 'Italian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '1a59f327', name: 'Carlos', gender: 'Male', country: 'Spain', language: 'Spanish', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '18245f0d', name: 'Bas', gender: 'Male', country: 'Netherlands', language: 'Dutch', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '155d4e9b', name: 'Nuria', gender: 'Female', country: 'Spain', language: 'Catalan', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '135ff7ec', name: 'Thandi', gender: 'Female', country: 'South Africa', language: 'English', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '0d3372eb', name: 'Sergei', gender: 'Male', country: 'Russia', language: 'Russian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '0b875ae2', name: 'Sonia', gender: 'Female', country: 'Russia', language: 'Russian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '0b54c30d', name: 'Tanvir', gender: 'Male', country: 'Bangladesh', language: 'Bengali', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '09b02491', name: 'Mei', gender: 'Female', country: 'China', language: 'Chinese (Simplified)', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '07e283bf', name: 'Aisyah', gender: 'Female', country: 'Indonesia', language: 'Indonesian', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '0735ff93', name: 'Diya', gender: 'Female', country: 'India', language: 'Hindi', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '0463086e', name: 'Thanawat', gender: 'Male', country: 'Thailand', language: 'Thai', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '025a38c5', name: 'Yasmin', gender: 'Female', country: 'Saudi Arabia', language: 'Arabic', gradient: ['#27272a', '#52525b'] as [string, string] },
  { id: '01a7edae', name: 'Chloe', gender: 'Female', country: 'Belgium', language: 'French', gradient: ['#27272a', '#52525b'] as [string, string] },
];

const TRANSLATION_LANGUAGES = [
  { id: 'English', flag: '🇺🇸' }, { id: 'Spanish', flag: '🇪🇸' }, { id: 'French', flag: '🇫🇷' },
  { id: 'German', flag: '🇩🇪' }, { id: 'Japanese', flag: '🇯🇵' }, { id: 'Korean', flag: '🇰🇷' },
  { id: 'Chinese (Simplified)', flag: '🇨🇳' }, { id: 'Vietnamese', flag: '🇻🇳' }, { id: 'Russian', flag: '🇷🇺' },
];

const TTS_TAGS = ['[laugh]', '[pause]', '[sigh]', '<whisper>', '<emphasis>', '<singing>'];

const AnimatedWaveform = ({ color = COLORS.white }: { color?: string }) => {
  const anims = useRef([...Array(16)].map(() => new Animated.Value(0.3))).current;
  useEffect(() => {
    const animations = anims.map((anim) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 400 + Math.random() * 400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 400 + Math.random() * 400, useNativeDriver: true })
        ])
      );
    });
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, [anims]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 60, justifyContent: 'center' }}>
      {anims.map((anim, i) => (
        <Animated.View key={i} style={{
          width: 4, height: 60, backgroundColor: color, borderRadius: 2,
          transform: [{ scaleY: anim }], opacity: anim,
          shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 10, elevation: 5
        }} />
      ))}
    </View>
  );
};

export default function AudioEngineScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('tts');
  const [textInput, setTextInput] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('ara');
  const [selectedFormat, setSelectedFormat] = useState<'mp3' | 'wav' | 'pcm' | 'ulaw'>('mp3');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; size: number; type: string } | null>(null);
  const [cloneVoiceName, setCloneVoiceName] = useState('');

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIdx, setStageIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const genTimer = useRef<NodeJS.Timeout | null>(null);

  const [customVoices, setCustomVoices] = useState<any[]>([]);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [result, setResult] = useState<{ type: 'audio' | 'text'; content: string } | null>(null);

  const [userState, setUserState] = useState({ tier: 'FREE', usage: 0, limit: 40000, maxChars: 5000, maxFileMB: 50 });
  const [sessionUser, setSessionUser] = useState<{ name: string; email: string; image?: string } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Settings sheet state
  const [showSettings, setShowSettings] = useState(false);
  const settingsAnim = useRef(new Animated.Value(500)).current;

  // Segmented engine switcher animation (Visual = 0, Audio = 1)
  const slideAnim = useRef(new Animated.Value(1)).current;

  // History panel state
  const [historyVisible, setHistoryVisible] = useState(false);
  const historyAnim = useRef(new Animated.Value(HISTORY_WIDTH)).current;
  const historyOverlay = useRef(new Animated.Value(0)).current;

  // Sidebar drawer
  const [showSidebar, setShowSidebar] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-280)).current;
  const sidebarOverlayAnim = useRef(new Animated.Value(0)).current;

  // Voice modal
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState('');
  const [voiceGender, setVoiceGender] = useState<'All' | 'Male' | 'Female'>('All');

  // Language modal
  const [showLangModal, setShowLangModal] = useState(false);

  // Audio player
  const [activePlayUrl, setActivePlayUrl] = useState<string | null>(null);
  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);
  const isPlaying = playerStatus.playing;
  const pos = playerStatus.currentTime * 1000;
  const dur = playerStatus.duration * 1000;

  // Dot animation
  const dotAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 0.15, duration: 900, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    fetchSession();
    loadCustomVoices();
    loadHistory();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await api.get('/api/auth/session');
      if (res.data?.user) {
        const u = res.data.user;
        setSessionUser({
          name: u.name || '',
          email: u.email || '',
          image: u.image || undefined,
        });
        setUserState({
          tier: u.tier || 'FREE', usage: u.usageCount || 0,
          limit: u.tier === 'PRO' ? 1500000 : u.tier === 'PREMIUM' ? 300000 : u.tier === 'BASIC' ? 120000 : 40000,
          maxChars: u.tier === 'PRO' ? 15000 : u.tier === 'PREMIUM' ? 10000 : 5000,
          maxFileMB: u.tier === 'FREE' ? 50 : u.tier === 'BASIC' ? 300 : 500,
        });
      }
    } catch { }
  };

  const handleSignOut = async () => {
    try {
      await clearSessionToken();
      router.replace('/login');
    } catch {
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  const handleNewProject = () => {
    setTextInput('');
    setCloneVoiceName('');
    setSelectedFile(null);
    setResult(null);
    closeSidebar();
  };

  const handleSwitch = (target: 'visual' | 'audio') => {
    if (target === 'audio') return;
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.replace('/visual-engine');
    });
  };

  const loadCustomVoices = async () => {
    try { const v = await fetchCustomVoices(); setCustomVoices(v); } catch { }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try { const items = await fetchAudioHistory(); setHistoryItems(items); } catch { }
    finally { setHistoryLoading(false); }
  };

  // ── Settings panel ──────────────────────────────────────────
  const openSettings = () => {
    settingsAnim.setValue(500); // always start from off-screen
    setShowSettings(true);
    Animated.spring(settingsAnim, { toValue: 0, tension: 75, friction: 12, useNativeDriver: true }).start();
  };

  const closeSettings = () => {
    Animated.spring(settingsAnim, { toValue: 500, tension: 75, friction: 12, useNativeDriver: true }).start(() => {
      setShowSettings(false);
    });
  };

  const toggleSettings = () => showSettings ? closeSettings() : openSettings();

  // ── Sidebar drawer ──────────────────────────────────────────
  const openSidebar = () => {
    setShowSidebar(true);
    Animated.parallel([
      Animated.spring(sidebarAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(sidebarOverlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeSidebar = () => {
    Animated.parallel([
      Animated.spring(sidebarAnim, { toValue: -280, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(sidebarOverlayAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setShowSidebar(false));
  };

  // ── History panel ───────────────────────────────────────────
  const openHistory = () => {
    setHistoryVisible(true);
    Animated.parallel([
      Animated.spring(historyAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(historyOverlay, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };
  const closeHistory = () => {
    Animated.parallel([
      Animated.spring(historyAnim, { toValue: HISTORY_WIDTH, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(historyOverlay, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setHistoryVisible(false));
  };

  // ── Generation simulation ───────────────────────────────────
  const startTimer = () => {
    const start = Date.now();
    setProgress(0); setStageIdx(0); setElapsed(0);
    genTimer.current = setInterval(() => {
      const sec = (Date.now() - start) / 1000;
      setElapsed(Math.floor(sec));
      const p = 90 * (1 - Math.exp(-sec / 15));
      setProgress(Math.min(p, 90));
      setStageIdx(Math.min(Math.floor(p / 22.5), 3));
    }, 150);
  };
  const stopTimer = () => {
    if (genTimer.current) clearInterval(genTimer.current);
    setProgress(100);
  };

  // ── File picker ─────────────────────────────────────────────
  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
      if (!res.canceled && res.assets?.[0]) {
        const f = res.assets[0];
        const sizeMB = (f.size || 0) / (1024 * 1024);
        if (sizeMB > userState.maxFileMB) { Alert.alert('File too large', `Max ${userState.maxFileMB}MB`); return; }
        setSelectedFile({ uri: f.uri, name: f.name, size: f.size || 0, type: f.mimeType || 'audio/mpeg' });
      }
    } catch { }
  };

  // ── Audio playback ──────────────────────────────────────────
  const handlePlayPause = async (uri: string) => {
    try {
      if (activePlayUrl === uri) {
        if (isPlaying) player.pause();
        else {
          if (pos >= dur - 100 && dur > 0) player.seekTo(0);
          player.play();
        }
        return;
      }
      setActivePlayUrl(uri); player.replace({ uri }); player.play();
    } catch { Alert.alert('Playback Error', 'Unable to play audio.'); }
  };

  const getTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  // ── Submit handler ──────────────────────────────────────────
  const handleSubmit = async () => {
    setResult(null);
    switch (activeTab) {
      case 'tts': {
        if (!textInput.trim()) { Alert.alert('Empty input', 'Enter your script.'); return; }
        if (textInput.length > userState.maxChars) {
          Alert.alert(
            'Limit Exceeded',
            `Your plan tier allows a maximum of ${userState.maxChars.toLocaleString()} characters per TTS request. Your current input contains ${textInput.length.toLocaleString()} characters. Please reduce the length or upgrade your plan.`
          );
          return;
        }
        setLoading(true); startTimer();
        try {
          const uri = await generateTTS({ text: textInput.trim(), voiceId: selectedVoice, format: selectedFormat });
          stopTimer(); setTimeout(() => { setLoading(false); setResult({ type: 'audio', content: uri }); fetchSession(); loadHistory(); }, 800);
        } catch (e: any) { stopTimer(); setLoading(false); Alert.alert('Error', e.message); }
        break;
      }
      case 'stt': {
        if (!selectedFile) { Alert.alert('No file', 'Select an audio file.'); return; }
        setLoading(true); startTimer();
        try {
          const res = await transcribeSTT(selectedFile.uri, selectedFile.name, selectedFile.type);
          stopTimer(); setTimeout(() => { setLoading(false); setResult({ type: 'text', content: res.text || '' }); setSelectedFile(null); fetchSession(); loadHistory(); }, 800);
        } catch (e: any) { stopTimer(); setLoading(false); Alert.alert('Error', e.message); }
        break;
      }
      case 'changer': {
        if (!selectedFile) { Alert.alert('No file', 'Select an audio file.'); return; }
        setLoading(true); startTimer();
        try {
          const uri = await changeVoice(selectedFile.uri, selectedFile.name, selectedFile.type, selectedVoice, selectedFormat);
          stopTimer(); setTimeout(() => { setLoading(false); setResult({ type: 'audio', content: uri }); setSelectedFile(null); fetchSession(); loadHistory(); }, 800);
        } catch (e: any) { stopTimer(); setLoading(false); Alert.alert('Error', e.message); }
        break;
      }
      case 'clean': {
        if (!selectedFile) { Alert.alert('No file', 'Select an audio file.'); return; }
        setLoading(true); startTimer();
        try {
          const uri = await cleanAudio(selectedFile.uri, selectedFile.name, selectedFile.type);
          stopTimer(); setTimeout(() => { setLoading(false); setResult({ type: 'audio', content: uri }); setSelectedFile(null); fetchSession(); loadHistory(); }, 800);
        } catch (e: any) { stopTimer(); setLoading(false); Alert.alert('Error', e.message); }
        break;
      }
      case 'translate': {
        if (!selectedFile) { Alert.alert('No file', 'Select an audio file.'); return; }
        setLoading(true); startTimer();
        try {
          const uri = await translateAudio(selectedFile.uri, selectedFile.name, selectedFile.type, selectedLanguage, selectedVoice, selectedFormat);
          stopTimer(); setTimeout(() => { setLoading(false); setResult({ type: 'audio', content: uri }); setSelectedFile(null); fetchSession(); loadHistory(); }, 800);
        } catch (e: any) { stopTimer(); setLoading(false); Alert.alert('Error', e.message); }
        break;
      }
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try { await deleteHistoryItem(id); loadHistory(); } catch { Alert.alert('Error', 'Failed to delete.'); }
  };

  const selectedVoiceData = VOICES_PRESET.find(v => v.id === selectedVoice) || VOICES_PRESET[0];
  const filteredVoices = VOICES_PRESET.filter(v => {
    const q = voiceSearch.toLowerCase();
    const match = v.name.toLowerCase().includes(q) || v.country.toLowerCase().includes(q) || v.language.toLowerCase().includes(q);
    const gMatch = voiceGender === 'All' || v.gender === voiceGender;
    return match && gMatch;
  });

  const stages = TAB_STAGES[activeTab];
  const currentStage = stages[Math.min(stageIdx, stages.length - 1)];

  return (
    <View style={[styles.safe, { backgroundColor: COLORS.bg }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>

        {/* ── TOP BAR ───────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <TouchableOpacity onPress={openSidebar} style={styles.topBarMenuBtn} activeOpacity={0.7}>
              <Text style={styles.topBarMenuIcon}>☰</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switcherContainer}>
            <Animated.View style={[
              styles.switcherActiveBg,
              {
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 78], // 76px distance + padding offset
                  })
                }]
              }
            ]} />
            <TouchableOpacity style={styles.switcherTab} onPress={() => handleSwitch('visual')} activeOpacity={0.8}>
              <Text style={styles.switcherTabText}>Visual</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.switcherTab} onPress={() => handleSwitch('audio')} activeOpacity={0.8}>
              <Text style={[styles.switcherTabText, styles.switcherTabTextActive]}>Audio</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={historyVisible ? closeHistory : openHistory}
            style={styles.topBarHistoryBtn}
            activeOpacity={0.75}
          >
            <History color={COLORS.white} size={22} />
          </TouchableOpacity>
        </View>

        {/* ── MAIN CANVAS ───────────────────────────────── */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.canvas}>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* ── INPUT AREA ── */}
                <View style={[styles.workspaceCard, { marginVertical: 0, paddingHorizontal: 20, paddingTop: 16, minHeight: 250, backgroundColor: 'transparent', borderWidth: 0 }]}>
                  <View style={styles.workspaceHeader}>
                    <Text style={styles.workspaceTitle}>INTELLIGENCE INPUT MATRIX</Text>
                  </View>

                  <View style={styles.workspaceBody}>
                    {activeTab === 'tts' ? (
                      <View style={styles.textAreaWrapper}>
                        <View style={{ marginBottom: 12 }}>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {TTS_TAGS.map(tag => (
                              <TouchableOpacity key={tag} onPress={() => setTextInput(prev => prev + tag)} style={{ backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }} activeOpacity={0.7}>
                                <Text style={{ color: COLORS.zinc300, fontSize: 11, fontFamily: 'Inter_700Bold' }}>{tag}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                        <TextInput
                          value={textInput}
                          onChangeText={setTextInput}
                          placeholder="Enter your script for neural synthesis..."
                          placeholderTextColor="rgba(255,255,255,0.2)"
                          style={styles.textArea}
                          multiline
                          textAlignVertical="top"
                        />
                        <View style={styles.charCountRow}>
                          <Text style={styles.charCountText}>Max Chars: {userState.maxChars.toLocaleString()}</Text>
                          <Text style={[styles.charCountText, { color: textInput.length > userState.maxChars ? COLORS.red : COLORS.zinc600 }]}>
                            {textInput.length.toLocaleString()} / {userState.maxChars.toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.uploadZone, selectedFile && styles.uploadZoneActive]}
                        onPress={selectedFile ? () => setSelectedFile(null) : handlePickFile}
                        activeOpacity={0.8}
                      >
                        {selectedFile ? (
                          <View style={{ alignItems: 'center' }}>
                            <View style={styles.uploadIconWrap}>
                              <CheckCircle2 color={COLORS.white} size={28} />
                            </View>
                            <Text style={styles.uploadFileName} numberOfLines={1}>{selectedFile.name}</Text>
                            <Text style={styles.uploadFileSize}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • READY</Text>
                          </View>
                        ) : (
                          <View style={{ alignItems: 'center' }}>
                            <View style={styles.uploadIconWrapIdle}>
                              <UploadCloud color={COLORS.zinc500} size={28} />
                            </View>
                            <Text style={styles.uploadText}>TRANSMIT AUDIO SIGNAL</Text>
                            <Text style={styles.uploadSub}>MP3, WAV, M4A • MAX {userState.maxFileMB}MB</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* ── SEPARATOR ── */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8, paddingHorizontal: 20 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  <Text style={{ marginHorizontal: 12, color: COLORS.zinc500, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2 }}>OUTPUT</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                </View>

                {/* ── OUTPUT AREA ── */}
                <View style={[styles.resultPanel, { marginVertical: 0, paddingHorizontal: 20, minHeight: 180, backgroundColor: 'transparent', borderWidth: 0, justifyContent: 'center' }]}>
                  {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <AnimatedWaveform color={COLORS.white} />
                      <Text style={{ color: COLORS.white, marginTop: 24, fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 2 }}>{currentStage.toUpperCase()}</Text>
                    </View>
                  ) : result ? (
                    <View style={{ flex: 1 }}>
                      {result.type === 'audio' ? (
                        <View style={[styles.audioPlayerWrap, { backgroundColor: 'transparent', padding: 0, borderWidth: 0 }]}>
                          <TouchableOpacity onPress={() => handlePlayPause(result.content)} style={styles.playBtn} activeOpacity={0.8}>
                            {isPlaying ? <Pause color="#000" size={24} /> : <Play color="#000" size={24} style={{ marginLeft: 3 }} />}
                          </TouchableOpacity>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.audioTitle}>Synthesized Audio Output</Text>
                            <Text style={styles.audioTime}>{getTime(pos)} / {getTime(dur)}</Text>
                            <View style={styles.audioProgress}>
                              <View style={[styles.audioProgressFill, { width: `${dur > 0 ? (pos / dur) * 100 : 0}%` as any }]} />
                            </View>
                          </View>
                        </View>
                      ) : (
                        <View style={[styles.transcriptWrap, { backgroundColor: 'transparent', padding: 0 }]}>
                          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            <Text style={styles.transcriptText}>{result.content}</Text>
                          </ScrollView>
                          <TouchableOpacity onPress={() => { Clipboard.setString(result.content); Alert.alert('Copied', 'Transcript copied.'); }} style={[styles.copyBtn, { marginTop: 16 }]}>
                            <Text style={styles.copyBtnText}>COPY TRANSCRIPT</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      <TouchableOpacity onPress={() => setResult(null)} style={[styles.resultCloseBtn, { top: 0, right: 0 }]}>
                        <Text style={{ color: COLORS.zinc500, fontSize: 14 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: COLORS.zinc600, fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 2 }}>SYSTEM STANDBY</Text>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* ── BOTTOM ACTIONS ── */}
              <View style={[styles.workspaceFooter, { paddingHorizontal: 20, paddingBottom: insets.bottom + 10, marginTop: 0, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 }]}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={[styles.generateBtn, loading && { opacity: 0.5 }]}
                  activeOpacity={0.8}
                >
                  {loading ? <ActivityIndicator color="#000" /> : <><SquarePlay color="#000" size={16} /><Text style={styles.generateBtnText}>GENERATE</Text></>}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={toggleSettings}
                  style={styles.settingsIconBtn}
                  activeOpacity={0.75}
                >
                  {(() => {
                    const iconColor = showSettings ? '#000' : COLORS.white;
                    if (showSettings) {
                      return <Settings color={iconColor} size={20} />;
                    }
                    switch (activeTab) {
                      case 'tts':
                        return <TextInitial color={iconColor} size={20} />;
                      case 'stt':
                        return <Mic color={iconColor} size={20} />;
                      case 'changer':
                        return <RefreshCw color={iconColor} size={20} />;
                      case 'translate':
                        return <Globe color={iconColor} size={20} />;
                      case 'clean':
                        return <Brush color={iconColor} size={20} />;
                      default:
                        return <Settings color={iconColor} size={20} />;
                    }
                  })()}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {/* ── SETTINGS BOTTOM SHEET ─ */}
        {showSettings && (
          <View style={[StyleSheet.absoluteFillObject, { zIndex: 30 }]} pointerEvents="box-none">
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeSettings} activeOpacity={1} />
            <Animated.View
              style={[styles.settingsSheet, { transform: [{ translateY: settingsAnim }] }]}
            >
              <LinearGradient colors={['#2a2a2a', COLORS.bg]} style={StyleSheet.absoluteFillObject} />

              {/* Mode tabs */}
              <View style={styles.settingsModesRow}>
                <View style={styles.settingsModesPill}>
                  {TABS.map(tab => {
                    const isActive = activeTab === tab.key;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        onPress={() => { setActiveTab(tab.key); setSelectedFile(null); setResult(null); }}
                        style={[styles.settingsModeBtn, isActive && styles.settingsModeBtnActive]}
                        activeOpacity={0.75}
                      >
                        {isActive && (
                          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.white }]} />
                        )}
                        {React.cloneElement(tab.icon as React.ReactElement<any>, { color: isActive ? '#000' : COLORS.zinc400 })}
                        <Text style={[styles.settingsModeBtnText, isActive && { color: '#000' }]}>
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Settings options */}
              <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.settingsBody} showsVerticalScrollIndicator={false}>
                {(activeTab === 'tts' || activeTab === 'changer' || activeTab === 'translate') && (
                  <View style={styles.settingsGroup}>
                    <Text style={styles.settingsGroupLabel}>VOICE PROFILE</Text>
                    <TouchableOpacity onPress={() => setShowVoiceModal(true)} style={styles.voiceRow} activeOpacity={0.75}>
                      <LinearGradient colors={selectedVoiceData.gradient} style={styles.voiceRowAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                        <Text style={styles.voiceRowAvatarText}>{selectedVoiceData.name.charAt(0)}</Text>
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.voiceRowName}>{selectedVoiceData.name}</Text>
                        <Text style={[S.monoLabel, { color: COLORS.zinc600 }]}>{selectedVoiceData.gender} · {selectedVoiceData.language}</Text>
                      </View>
                      <Text style={{ color: COLORS.zinc500, fontSize: 20 }}>›</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {activeTab === 'translate' && (
                  <View style={styles.settingsGroup}>
                    <Text style={styles.settingsGroupLabel}>TARGET LANGUAGE</Text>
                    <TouchableOpacity onPress={() => setShowLangModal(true)} style={styles.voiceRow} activeOpacity={0.75}>
                      <Text style={{ fontSize: 24 }}>{TRANSLATION_LANGUAGES.find(l => l.id === selectedLanguage)?.flag || '🌐'}</Text>
                      <Text style={styles.voiceRowName}>{selectedLanguage}</Text>
                      <Text style={{ color: COLORS.zinc500, fontSize: 20 }}>›</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {activeTab === 'clone' && (
                  <View style={styles.settingsGroup}>
                    <Text style={styles.settingsGroupLabel}>VOICE IDENTITY NAME</Text>
                    <TextInput
                      value={cloneVoiceName}
                      onChangeText={setCloneVoiceName}
                      placeholder="Enter custom voice name..."
                      placeholderTextColor={COLORS.zinc700}
                      style={styles.settingsInput}
                    />
                  </View>
                )}
                <View style={styles.settingsGroup}>
                  <Text style={styles.settingsGroupLabel}>OUTPUT FORMAT</Text>
                  <View style={styles.formatRow}>
                    {(['mp3', 'wav', 'pcm', 'ulaw'] as const).map(fmt => {
                      const isActive = selectedFormat === fmt;
                      return (
                        <TouchableOpacity
                          key={fmt}
                          onPress={() => setSelectedFormat(fmt)}
                          style={[styles.formatBtn, isActive && styles.formatBtnActive]}
                          activeOpacity={0.75}
                        >
                          {isActive && (
                            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.white }]} />
                          )}
                          <Text style={[styles.formatBtnText, isActive && { color: '#000' }]}>{fmt.toUpperCase()}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.settingsFooter}>
                <TouchableOpacity onPress={closeSettings} style={styles.settingsSaveBtn} activeOpacity={0.85}>
                  <Text style={styles.settingsSaveBtnText}>SAVE</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Input Bar removed */}
      </SafeAreaView>

      {/* ── HISTORY PANEL (slides from right) ──────────── */}
      {historyVisible && (
        <Animated.View style={[styles.historyOverlayView, { opacity: historyOverlay }]}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeHistory} activeOpacity={1} />
        </Animated.View>
      )}
      <Animated.View
        style={[styles.historyPanel, { transform: [{ translateX: historyAnim }] }]}
        pointerEvents={historyVisible ? 'auto' : 'none'}
      >
        <LinearGradient colors={['#2a2a2a', COLORS.bg]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>History ({historyItems.length})</Text>
            <TouchableOpacity onPress={closeHistory} style={styles.historyCloseBtn}>
              <Text style={{ color: COLORS.zinc400, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
          {historyLoading ? (
            <ActivityIndicator size="small" color={COLORS.zinc500} style={{ marginTop: 32 }} />
          ) : historyItems.length === 0 ? (
            <View style={styles.historyEmpty}>
              <History color={COLORS.zinc700} size={32} style={{ marginBottom: 10 }} />
              <Text style={[S.monoLabel, { color: COLORS.zinc700, textAlign: 'center' }]}>No audio records yet.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 12, gap: 10 }} showsVerticalScrollIndicator={false}>
              {historyItems.map(item => {
                const isAudio = item.output?.startsWith('http') || item.output?.endsWith('.mp3') || item.output?.endsWith('.wav');
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.historyItem}
                    activeOpacity={0.7}
                    onLongPress={() => {
                      Alert.alert('Delete Record', 'Are you sure you want to delete this generation?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteHistory(item.id) }
                      ]);
                    }}
                  >
                    <View style={styles.historyItemTop}>
                      <View style={styles.historyTypeBadge}>
                        <Text style={[S.monoLabel, { color: COLORS.white }]}>{item.type?.toUpperCase()}</Text>
                      </View>
                      <Text style={[S.monoLabel, { color: COLORS.zinc700 }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {item.input && <Text style={styles.historyItemInput} numberOfLines={2}>{item.input}</Text>}
                    <View style={styles.historyItemActions}>
                      {isAudio ? (
                        <TouchableOpacity
                          onPress={() => { setResult({ type: 'audio', content: item.output }); handlePlayPause(item.output); closeHistory(); }}
                          style={[styles.historyActionBtn, { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }]}
                        >
                          <Text style={[styles.historyActionTxt, { color: COLORS.white }]}>
                            {activePlayUrl === item.output && isPlaying ? '⏸ PLAYING' : '▶ PLAY'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => { setResult({ type: 'text', content: item.output }); closeHistory(); }}
                          style={styles.historyActionBtn}
                        >
                          <Text style={styles.historyActionTxt}>VIEW TEXT</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </SafeAreaView>
      </Animated.View>

      {/* ── SIDEBAR DRAWER (slides from left) ──────────── */}
      {showSidebar && (
        <Animated.View style={[styles.sidebarOverlay, { opacity: sidebarOverlayAnim }]} pointerEvents="none" />
      )}
      {showSidebar && (
        <>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeSidebar} activeOpacity={1} />
          <Animated.View style={[styles.sidebarPanel, { transform: [{ translateX: sidebarAnim }] }]}>
            <LinearGradient colors={['#2a2a2a', '#212121']} style={StyleSheet.absoluteFillObject} />
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
              <View style={styles.sidebarHeader}>
                <TouchableOpacity
                  style={styles.sidebarProfileTrigger}
                  onPress={() => {
                    closeSidebar();
                    setShowProfileModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  {sessionUser?.image ? (
                    <Image source={{ uri: sessionUser.image }} style={styles.sidebarAvatar} />
                  ) : (
                    <View style={styles.sidebarAvatarFallback}>
                      <User color={COLORS.white} size={16} />
                    </View>
                  )}
                  <Text style={styles.sidebarProfileName} numberOfLines={1}>
                    {sessionUser?.name || 'Profile'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeSidebar} style={styles.sidebarCloseBtn}>
                  <X color={COLORS.zinc400} size={16} />
                </TouchableOpacity>
              </View>
              <View style={{ paddingVertical: 24, paddingHorizontal: 12, flex: 1, justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }} />
                {/* Usage Card */}
                <View style={styles.usageCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Crown color={userState.tier === 'FREE' ? COLORS.zinc600 : COLORS.white} size={14} />
                      <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: COLORS.zinc300, fontSize: 10 }]}>{userState.tier}</Text>
                    </View>
                    <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: COLORS.white, fontWeight: '700' }]}>
                      {userState.usage.toLocaleString()}<Text style={{ color: COLORS.zinc500 }}>/{userState.limit.toLocaleString()}</Text>
                    </Text>
                  </View>
                  <View style={styles.usageProgressBg}>
                    <View style={[styles.usageProgressFill, { width: `${Math.min((userState.usage / userState.limit) * 100, 100)}%` }]} />
                  </View>
                  <TouchableOpacity style={styles.usageManageBtn} onPress={() => { closeSidebar(); setShowPlanModal(true); }}>
                    <Text style={styles.usageManageTxt}>MANAGE PLAN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </Animated.View>
        </>
      )}

      {/* ── VOICE MODAL ────────────────────────────────── */}
      <Modal visible={showVoiceModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowVoiceModal(false)}>
        <SafeAreaView style={[styles.voiceModalSafe, { backgroundColor: COLORS.bgCard }]}>
          <View style={styles.voiceModalInner}>
            <View style={styles.voiceModalHeader}>
              <Text style={styles.voiceModalTitle}>Select Voice Profile</Text>
              <TouchableOpacity onPress={() => setShowVoiceModal(false)} style={styles.voiceModalClose}>
                <Text style={[S.monoLabel, { color: COLORS.zinc400 }]}>Close</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={voiceSearch} onChangeText={setVoiceSearch}
              placeholder="Search by name, language..."
              placeholderTextColor={COLORS.zinc700}
              style={styles.voiceModalSearch}
            />
            {/* Gender filter */}
            <View style={styles.genderRow}>
              {(['All', 'Male', 'Female'] as const).map(g => (
                <TouchableOpacity
                  key={g} onPress={() => setVoiceGender(g)}
                  style={[styles.genderBtn, voiceGender === g && styles.genderBtnActive]}
                  activeOpacity={0.75}
                >
                  {voiceGender === g && <LinearGradient colors={['#7c3aed', '#a855f7']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />}
                  <Text style={[styles.genderBtnText, voiceGender === g && { color: COLORS.white }]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {customVoices.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={[S.monoLabel, { color: COLORS.zinc500, marginBottom: 10 }]}>Your Cloned Voices</Text>
                  {customVoices.map(v => (
                    <TouchableOpacity key={v.id} onPress={() => { setSelectedVoice(v.voiceId || v.id); setShowVoiceModal(false); }} style={[styles.voiceItem, selectedVoice === (v.voiceId || v.id) && styles.voiceItemSelected]}>
                      {selectedVoice === (v.voiceId || v.id) && <View style={styles.voiceItemBar} />}
                      <View style={[styles.voiceItemAvatar, { backgroundColor: COLORS.purpleDim }]}>
                        <Text style={styles.voiceItemAvatarText}>{v.name?.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.voiceItemName}>{v.name}</Text>
                        <Text style={[S.monoLabel, { color: COLORS.zinc600 }]}>Cloned Voice</Text>
                      </View>
                      {selectedVoice === (v.voiceId || v.id) && <Text style={{ color: COLORS.purple, fontSize: 16 }}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={[S.monoLabel, { color: COLORS.zinc500, marginBottom: 10 }]}>Preset Neural Models</Text>
              {filteredVoices.map(v => {
                const isSelected = selectedVoice === v.id;
                return (
                  <TouchableOpacity key={v.id} onPress={() => { setSelectedVoice(v.id); setShowVoiceModal(false); }} style={[styles.voiceItem, isSelected && styles.voiceItemSelected]}>
                    {isSelected && <View style={styles.voiceItemBar} />}
                    <LinearGradient colors={v.gradient} style={styles.voiceItemAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Text style={styles.voiceItemAvatarText}>{v.name.charAt(0)}</Text>
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.voiceItemName}>{v.name}</Text>
                      <Text style={[S.monoLabel, { color: COLORS.zinc500 }]}>{v.gender} · {v.country}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[S.monoLabel, { color: COLORS.zinc600 }]}>{v.language}</Text>
                      {isSelected && <Text style={{ color: COLORS.purple, fontSize: 14, marginTop: 2 }}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── LANGUAGE MODAL ─────────────────────────────── */}
      <Modal visible={showLangModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowLangModal(false)}>
        <SafeAreaView style={[styles.voiceModalSafe, { backgroundColor: COLORS.bgCard }]}>
          <View style={styles.voiceModalInner}>
            <View style={styles.voiceModalHeader}>
              <Text style={styles.voiceModalTitle}>Target Language</Text>
              <TouchableOpacity onPress={() => setShowLangModal(false)} style={styles.voiceModalClose}>
                <Text style={[S.monoLabel, { color: COLORS.zinc400 }]}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {TRANSLATION_LANGUAGES.map(lang => {
                const isSel = selectedLanguage === lang.id;
                return (
                  <TouchableOpacity key={lang.id} onPress={() => { setSelectedLanguage(lang.id); setShowLangModal(false); }} style={[styles.voiceItem, isSel && styles.voiceItemSelected]}>
                    {isSel && <View style={styles.voiceItemBar} />}
                    <Text style={{ fontSize: 24 }}>{lang.flag}</Text>
                    <Text style={[styles.voiceItemName, { flex: 1 }]}>{lang.id}</Text>
                    {isSel && <Text style={{ color: COLORS.purple, fontSize: 14 }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── PROFILE MODAL ────────────────────────────────── */}
      <Modal visible={showProfileModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: COLORS.bgCard, borderColor: 'rgba(255,255,255,0.08)' }]}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              {sessionUser?.image ? (
                <Image source={{ uri: sessionUser.image }} style={styles.profileModalAvatar} />
              ) : (
                <View style={styles.profileModalAvatarFallback}>
                  <User color={COLORS.white} size={32} />
                </View>
              )}
              <Text style={styles.profileModalName}>{sessionUser?.name || 'Director'}</Text>
              <Text style={styles.profileModalEmail}>{sessionUser?.email}</Text>
            </View>

            <View style={[styles.usageCard, { marginTop: 0, marginBottom: 24 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Crown color={userState.tier === 'FREE' ? COLORS.zinc600 : COLORS.white} size={14} />
                  <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: COLORS.zinc300, fontSize: 10 }]}>{userState.tier}</Text>
                </View>
                <Text style={[S.monoLabel, { fontFamily: 'Inter_700Bold', color: COLORS.white, fontWeight: '700' }]}>
                  {userState.usage.toLocaleString()}<Text style={{ color: COLORS.zinc500 }}>/{userState.limit.toLocaleString()}</Text>
                </Text>
              </View>
              <View style={styles.usageProgressBg}>
                <View style={[styles.usageProgressFill, { width: `${Math.min((userState.usage / userState.limit) * 100, 100)}%` }]} />
              </View>
            </View>

            <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.8}>
              <Text style={styles.signOutBtnText}>SIGN OUT</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowProfileModal(false)} style={styles.closeModalBtn} activeOpacity={0.8}>
              <Text style={styles.closeModalBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── PLAN MODAL ───────────────────────────────────── */}
      <Modal visible={showPlanModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={() => setShowPlanModal(false)} activeOpacity={1} />
          <View style={[styles.modalSheet, { backgroundColor: COLORS.bgCard, borderColor: 'rgba(255,255,255,0.08)', paddingBottom: insets.bottom + 20, maxHeight: '92%' }]}>
            <Text style={styles.planModalTitle}>Pricing</Text>

            {/* Monthly/Yearly toggle */}
            <View style={styles.billingToggleContainer}>
              <TouchableOpacity
                onPress={() => setBillingCycle('monthly')}
                style={[styles.billingToggleBtn, billingCycle === 'monthly' && styles.billingToggleBtnActive]}
              >
                <Text style={[styles.billingToggleText, billingCycle === 'monthly' && { color: '#000' }]}>Monthly</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBillingCycle('yearly')}
                style={[styles.billingToggleBtn, billingCycle === 'yearly' && styles.billingToggleBtnActive]}
              >
                <Text style={[styles.billingToggleText, billingCycle === 'yearly' && { color: '#000' }]}>Yearly (-20%)</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 8 }}>
              {[
                {
                  tier: 'FREE',
                  price: '$0',
                  desc: 'Test the engine',
                  limit: '40,000 pulses/mo',
                  sections: [
                    {
                      title: 'Visual Production',
                      items: [
                        { checked: true, text: 'Video Gen & Edit (480p)' },
                        { checked: true, text: 'Image Gen & Edit (Standard)' },
                        { checked: false, text: 'No Flow Video Extension' },
                        { checked: false, text: 'No Multi-Agent Autopilot' }
                      ]
                    },
                    {
                      title: 'Voice & Audio',
                      items: [
                        { checked: true, text: '5,000 Char TTS' },
                        { checked: true, text: '5 min STT Limit' }
                      ]
                    }
                  ]
                },
                {
                  tier: 'BASIC',
                  price: billingCycle === 'monthly' ? '$10/mo' : '$8/mo',
                  desc: 'For regular creators',
                  limit: '120,000 pulses/mo',
                  sections: [
                    {
                      title: 'Visual Production',
                      items: [
                        { checked: true, text: 'Video/Flow/Agent (720p HD)' },
                        { checked: true, text: 'Image Gen & Edit (2K Quality)' },
                        { checked: true, text: 'Flow Video Extension' },
                        { checked: true, text: 'Multi-Agent Autopilot' }
                      ]
                    },
                    {
                      title: 'Voice & Audio',
                      items: [
                        { checked: true, text: '5,000 Char TTS' },
                        { checked: true, text: '5 min STT Limit' }
                      ]
                    }
                  ]
                },
                {
                  tier: 'PREMIUM',
                  price: billingCycle === 'monthly' ? '$20/mo' : '$16/mo',
                  desc: 'For serious creators',
                  limit: '300,000 pulses/mo',
                  sections: [
                    {
                      title: 'Visual Production',
                      items: [
                        { checked: true, text: 'Video/Flow/Agent (720p HD)' },
                        { checked: true, text: 'Image Gen & Edit (2K Quality)' },
                        { checked: true, text: 'Flow Video Extension' },
                        { checked: true, text: 'Multi-Agent Autopilot' }
                      ]
                    },
                    {
                      title: 'Voice & Audio',
                      items: [
                        { checked: true, text: '10,000 Char TTS' },
                        { checked: true, text: '10 min STT Limit' }
                      ]
                    }
                  ]
                },
                {
                  tier: 'PRO',
                  price: billingCycle === 'monthly' ? '$100/mo' : '$80/mo',
                  desc: 'High-volume production',
                  limit: '1,500,000 pulses/mo',
                  sections: [
                    {
                      title: 'Visual Production',
                      items: [
                        { checked: true, text: 'Video/Flow/Agent (720p HD)' },
                        { checked: true, text: 'Image Gen & Edit (2K Quality)' },
                        { checked: true, text: 'Flow Video Extension' },
                        { checked: true, text: 'Multi-Agent Autopilot' }
                      ]
                    },
                    {
                      title: 'Voice & Audio',
                      items: [
                        { checked: true, text: '15,000 Char TTS' },
                        { checked: true, text: '15 min STT Limit' }
                      ]
                    }
                  ]
                },
              ].map((plan) => (
                <TouchableOpacity
                  key={plan.tier}
                  onPress={() => {
                    setShowPlanModal(false);
                    Linking.openURL(`${BASE_URL}/visual?tab=profile`);
                  }}
                  style={[styles.planCard, { minHeight: 400, width: 235 }]}
                  activeOpacity={0.8}
                >
                  <View style={{ width: '100%' }}>
                    <Text style={styles.planCardTier}>{plan.tier}</Text>
                    <Text style={styles.planCardPrice}>{plan.price}</Text>
                    <Text style={styles.planCardLimit}>{plan.limit}</Text>
                    <Text style={styles.planCardDesc}>{plan.desc}</Text>
                    
                    {plan.sections.map((section, sIdx) => (
                      <View key={sIdx} style={{ marginTop: 12 }}>
                        <Text style={[S.monoLabel, { color: COLORS.zinc600, fontSize: 8, marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }]}>
                          {section.title}
                        </Text>
                        {section.items.map((item, iIdx) => (
                          <Text key={iIdx} style={[S.monoLabel, { color: item.checked ? COLORS.zinc300 : COLORS.zinc600, fontSize: 9, marginBottom: 4, textTransform: 'none' }]}>
                            {item.checked ? '✓ ' : '— '}
                            <Text style={!item.checked && { textDecorationLine: 'line-through' }}>{item.text}</Text>
                          </Text>
                        ))}
                      </View>
                    ))}
                  </View>
                  <View style={[styles.planCardBtn, { marginTop: 16 }]}>
                    <Text style={styles.planCardBtnText}>SELECT PLAN</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={() => setShowPlanModal(false)} style={styles.closeModalBtn} activeOpacity={0.8}>
              <Text style={styles.closeModalBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const SH = Dimensions.get('window').height;

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarMenuBtn: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarMenuIcon: { color: COLORS.white, fontSize: 28 },
  topBarCloseBtn: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8,
  },
  topBarCloseTxt: {
    color: COLORS.white, fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '700', letterSpacing: 2,
  },
  topBarHistoryBtn: {
    width: 38, height: 38,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarHistoryTxt: {
    color: COLORS.white, fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '800', letterSpacing: 2,
  },
  engineSwitcherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  engineSwitcherText: {
    color: COLORS.white,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  sidebarNewProjectBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  sidebarNewProjectText: {
    color: '#000',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    letterSpacing: 2,
  },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.purpleDim, borderWidth: 1, borderColor: COLORS.purpleBorder,
    borderRadius: 100, paddingHorizontal: 10, paddingVertical: 6,
  },
  tierDot: {
    width: 6, height: 6, borderRadius: 3,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 4,
  },
  tierText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '700', color: COLORS.purple, letterSpacing: 1.5,
  },

  // Canvas
  canvas: { flex: 1, backgroundColor: COLORS.bg, position: 'relative' },
  canvasCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  // Idle state
  idleIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  idleIconText: { fontSize: 30 },
  idleLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 6,
  },
  idleSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9, color: 'rgba(255,255,255,0.12)', letterSpacing: 1.5, marginBottom: 24,
  },
  idleVoicePill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100, paddingHorizontal: 12, paddingVertical: 8,
  },
  idleVoiceAvatar: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  idleVoiceAvatarText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  idleVoiceName: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  idleVoiceChevron: { color: COLORS.zinc500, fontSize: 18 },

  // Result panel
  resultPanel: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 28, position: 'relative',
  },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  resultStar: { color: COLORS.purple, fontSize: 16 },
  resultLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '700', color: COLORS.zinc400, letterSpacing: 3, textTransform: 'uppercase',
  },
  audioPlayerWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20, padding: 16, width: '100%',
  },
  playBtn: {
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  audioTitle: { color: COLORS.white, fontWeight: '700', fontSize: 13, marginBottom: 4 },
  audioTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9, color: COLORS.zinc500, marginBottom: 8,
  },
  audioProgress: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden',
  },
  audioProgressFill: {
    height: '100%', backgroundColor: COLORS.white, borderRadius: 2,
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8,
  },
  transcriptWrap: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, padding: 16,
  },
  transcriptText: { color: COLORS.white, fontSize: 13, lineHeight: 22 },
  copyBtn: {
    marginTop: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
  },
  copyBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '700', color: COLORS.zinc300, letterSpacing: 2,
  },
  resultCloseBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Settings sheet
  settingsOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 29 },
  settingsSheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30,
    height: 480,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden',
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -20 }, shadowOpacity: 0.95, shadowRadius: 40, elevation: 30,
  },
  settingsModesRow: {
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10,
    borderBottomWidth: 0,
  },
  settingsModesPill: {
    flexDirection: 'row', backgroundColor: 'transparent',
    borderRadius: 16, borderWidth: 0, padding: 4,
  },
  settingsModeBtn: {
    flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8, borderRadius: 12, overflow: 'hidden',
  },
  settingsModeBtnActive: {},
  settingsModeBtnIcon: { fontSize: 11 },
  settingsModeBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 7, fontWeight: '800', color: COLORS.zinc500, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  settingsBody: { paddingHorizontal: 16, paddingTop: 14, gap: 14, paddingBottom: 4 },
  settingsGroup: { gap: 8 },
  settingsGroupLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8, fontWeight: '800', color: COLORS.zinc500, letterSpacing: 3,
  },
  voiceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, padding: 12,
  },
  voiceRowAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  voiceRowAvatarText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  voiceRowName: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  settingsInput: {
    backgroundColor: 'rgba(0,0,0,0.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, color: COLORS.white, fontSize: 13, padding: 12,
    fontFamily: 'Inter_400Regular',
  },
  formatRow: { flexDirection: 'row', gap: 8 },
  formatBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden',
  },
  formatBtnActive: { borderColor: 'rgba(168,85,247,0.4)' },
  formatBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '700', color: COLORS.zinc500, letterSpacing: 1.5,
  },
  settingsFooter: {
    paddingHorizontal: 16, paddingTop: 10, paddingBottom: 22,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'flex-end', marginTop: 8,
  },
  settingsSaveBtn: {
    backgroundColor: COLORS.white, borderRadius: 100, paddingHorizontal: 28, paddingVertical: 10,
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 16,
  },
  settingsSaveBtnText: {
    color: '#000', fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '800', letterSpacing: 3,
  },

  // Input bar — transparent to float on canvas
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingTop: 12,
    backgroundColor: 'transparent',
  },
  inputBarIconBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  inputBarIconBtnActive: { backgroundColor: COLORS.purpleDim, borderColor: COLORS.purpleBorder },
  inputBarFileActive: { borderColor: COLORS.purpleBorder },
  inputBarTabIcon: { fontSize: 18, color: COLORS.white },
  inputBarPlus: { color: COLORS.white, fontSize: 22, fontWeight: '300', lineHeight: 26 },
  inputBarSep: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.12)' },
  inputBarText: {
    flex: 1, color: COLORS.white, fontSize: 13,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 18, elevation: 8,
  },
  sendBtnIcon: { color: '#000', fontSize: 20, fontWeight: '700' },

  // Workspace UI
  workspaceCard: {
    flex: 1, width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24, padding: 20, marginVertical: 16,
  },
  workspaceHeader: { marginBottom: 16 },
  workspaceTitle: {
    fontFamily: 'Inter_700Bold', fontSize: 10, fontWeight: '800',
    color: COLORS.zinc500, letterSpacing: 3,
  },
  workspaceBody: { flex: 1, justifyContent: 'center' },
  textAreaWrapper: { flex: 1 },
  textArea: {
    flex: 1, backgroundColor: 'transparent',
    borderWidth: 0, padding: 0, color: COLORS.white,
    fontFamily: 'Inter_400Regular', fontSize: 13,
  },
  charCountRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 },
  charCountText: { fontFamily: 'Inter_700Bold', fontSize: 9, color: COLORS.zinc600, textTransform: 'uppercase' },
  uploadZone: {
    flex: 1, minHeight: 180,
    borderWidth: 0,
    backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  uploadZoneActive: { backgroundColor: 'rgba(255,255,255,0.05)' },
  uploadIconWrap: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  uploadIconWrapIdle: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  uploadFileName: { color: COLORS.white, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  uploadFileSize: { fontFamily: 'Inter_700Bold', fontSize: 10, color: COLORS.zinc500, letterSpacing: 1 },
  uploadText: { fontFamily: 'Inter_700Bold', color: COLORS.white, fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  uploadSub: { fontFamily: 'Inter_700Bold', color: COLORS.zinc500, fontSize: 9, letterSpacing: 1 },
  workspaceFooter: { flexDirection: 'row', gap: 12, marginTop: 16 },
  generateBtn: {
    flex: 1, flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: 14, height: 44,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  generateBtnText: { color: '#000', fontFamily: 'Inter_700Bold', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  settingsIconBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // History panel
  historyOverlayView: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 39 },
  historyPanel: {
    position: 'absolute', top: 0, right: 0, bottom: 0, width: HISTORY_WIDTH,
    zIndex: 40, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: -10, height: 0 }, shadowOpacity: 0.8, shadowRadius: 40, elevation: 30,
  },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  historyTitle: {
    color: COLORS.white, fontFamily: 'Inter_700Bold',
    fontSize: 10, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase',
  },
  historyCloseBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  historyEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  historyItem: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16, padding: 12, marginBottom: 8,
  },
  historyItemTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  historyTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100,
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 4,
  },
  historyItemInput: { color: COLORS.zinc300, fontSize: 11, lineHeight: 16, marginBottom: 8 },
  historyItemActions: { flexDirection: 'row', gap: 6 },
  historyActionBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8, alignItems: 'center', borderRadius: 10,
    shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  historyActionTxt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '700', color: COLORS.zinc300,
  },

  // Voice modal
  voiceModalSafe: { flex: 1 },
  voiceModalInner: { flex: 1, padding: 20 },
  voiceModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  voiceModalTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  voiceModalClose: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  voiceModalSearch: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, color: COLORS.white, fontSize: 13, padding: 12, marginBottom: 12,
    fontFamily: 'Inter_400Regular',
  },
  genderRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 3, marginBottom: 14,
  },
  genderBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 10, overflow: 'hidden' },
  genderBtnActive: {},
  genderBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 9, fontWeight: '700', color: COLORS.zinc500, letterSpacing: 1,
  },
  voiceItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 14, marginBottom: 8, overflow: 'hidden', position: 'relative',
  },
  voiceItemSelected: { backgroundColor: 'rgba(168,85,247,0.07)', borderColor: 'rgba(168,85,247,0.25)' },
  voiceItemBar: {
    position: 'absolute', left: 0, top: 12, bottom: 12, width: 3,
    backgroundColor: COLORS.purple, borderRadius: 2,
    shadowColor: COLORS.purple, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6,
  },
  voiceItemAvatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  voiceItemAvatarText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  voiceItemName: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  // ── Sidebar panel ──────────────────────────────────────────────
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 49,
  },
  sidebarPanel: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: 270, zIndex: 50,
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 10, height: 0 }, shadowOpacity: 0.8, shadowRadius: 40, elevation: 30,
  },
  sidebarHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sidebarTitle: {
    color: COLORS.white, fontFamily: 'Inter_700Bold',
    fontSize: 10, fontWeight: '800', letterSpacing: 4,
  },
  sidebarCloseBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  sidebarTabItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, padding: 14, marginBottom: 8, overflow: 'hidden', position: 'relative',
  },
  sidebarTabItemActive: { backgroundColor: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.25)' },
  sidebarTabBar: {
    position: 'absolute', left: 0, top: 10, bottom: 10, width: 3,
    backgroundColor: COLORS.purple, borderRadius: 2,
    shadowColor: COLORS.purple, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6,
  },
  sidebarTabName: {
    color: COLORS.zinc400, fontFamily: 'Inter_700Bold',
    fontSize: 12, marginLeft: 8,
  },
  usageCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24, padding: 20, marginTop: 'auto',
  },
  usageProgressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' },
  usageProgressFill: { height: '100%', backgroundColor: COLORS.white, borderRadius: 3, shadowColor: COLORS.white, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  usageManageBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'
  },
  usageManageTxt: { color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 2 },

  // Sidebar profile
  sidebarProfileTrigger: {
    flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1,
  },
  sidebarAvatar: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sidebarAvatarFallback: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sidebarProfileName: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 13, flex: 1,
  },

  // Modal Backdrop and Sheet
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 40,
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.1)',
  },

  // Profile Modal styles
  profileModalAvatar: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: COLORS.white, marginBottom: 12,
  },
  profileModalAvatarFallback: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.white, marginBottom: 12,
  },
  profileModalName: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 18, marginBottom: 4,
  },
  profileModalEmail: {
    color: COLORS.zinc500, fontFamily: 'Inter_400Regular', fontSize: 12,
  },
  signOutBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: 100, paddingVertical: 14, alignItems: 'center', marginBottom: 12,
  },
  signOutBtnText: {
    color: COLORS.red, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2,
  },
  closeModalBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100, paddingVertical: 14, alignItems: 'center',
  },
  closeModalBtnText: {
    color: COLORS.zinc400, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 2,
  },

  // Plan Modal styles
  planModalTitle: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 18, textAlign: 'center', marginBottom: 20,
  },
  billingToggleContainer: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: 3, marginBottom: 20,
  },
  billingToggleBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100,
  },
  billingToggleBtnActive: {
    backgroundColor: COLORS.white,
  },
  billingToggleText: {
    color: COLORS.zinc400, fontFamily: 'Inter_700Bold', fontSize: 11,
  },
  planCard: {
    width: 140, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, padding: 16, alignItems: 'center', justifyContent: 'space-between', minHeight: 180,
  },
  planCardTier: {
    color: COLORS.zinc400, fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8,
  },
  planCardPrice: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 20, marginBottom: 8,
  },
  planCardLimit: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  planCardDesc: {
    color: COLORS.zinc500, fontFamily: 'Inter_400Regular', fontSize: 8.5, textAlign: 'center', lineHeight: 12, marginBottom: 12,
  },
  planCardBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingVertical: 6, width: '100%', alignItems: 'center',
  },
  planCardBtnText: {
    color: COLORS.white, fontFamily: 'Inter_700Bold', fontSize: 8, letterSpacing: 1,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 16,
    height: 32,
    width: 156,
    position: 'relative',
    padding: 2,
  },
  switcherActiveBg: {
    position: 'absolute',
    top: 2,
    width: 74,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  switcherTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  switcherTabText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: 'Inter_700Bold',
  },
  switcherTabTextActive: {
    color: '#ffffff',
  },
});
