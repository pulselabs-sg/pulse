import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/services/authContext';
import { router } from 'expo-router';
import { COLORS, SHADOWS, S } from '../constants/theme';

export default function HomeScreen() {
  const { sessionToken, isLoading, signOut } = useAuth();

  // Pulse animation for dot indicator
  const dotPulse = useRef(new Animated.Value(1)).current;
  const cardScale1 = useRef(new Animated.Value(0.97)).current;
  const cardScale2 = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    // Dot pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Card entrance animation
    Animated.stagger(120, [
      Animated.spring(cardScale1, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.spring(cardScale2, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!sessionToken) {
        router.replace('/login');
      } else {
        router.replace('/visual-engine');
      }
    }
  }, [isLoading, sessionToken]);

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: COLORS.bg }]}>
        <ActivityIndicator size="large" color={COLORS.white} />
      </View>
    );
  }

  if (!sessionToken) return null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#03050c', '#0b0f19', '#03050c']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.container}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <View style={styles.headerTitleRow}>
              <Animated.View style={[styles.headerDot, { opacity: dotPulse }]} />
              <Text style={styles.headerTitle}>iPulse</Text>
            </View>
            <Text style={styles.headerSub}>Select an engine to start</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>

        {/* ── Engine Cards ────────────────────────────────────────── */}
        <View style={styles.cardsContainer}>

          {/* Visual Engine */}
          <Animated.View style={{ transform: [{ scale: cardScale1 }] }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/visual-engine' as any)}
              style={styles.engineCard}
            >
              <LinearGradient
                colors={['rgba(6,182,212,0.06)', 'rgba(6,182,212,0.0)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.cardTopRow}>
                <View style={[styles.iconWrapper, { backgroundColor: COLORS.cyanDim, borderColor: COLORS.cyanBorder }]}>
                  <Text style={styles.iconText}>✨</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: COLORS.cyanDim, borderColor: COLORS.cyanBorder }]}>
                  <Text style={[styles.badgeText, { color: COLORS.cyan }]}>Active</Text>
                </View>
              </View>
              <Text style={styles.engineTitle}>Visual Engine</Text>
              <Text style={styles.engineDesc}>
                Generate cinematic AI videos from text prompts or images using advanced neural synthesis models.
              </Text>
              <View style={[styles.cardFooter, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                <Text style={[S.monoLabel, { color: COLORS.cyan }]}>Image · Video · Flow · Agent</Text>
                <Text style={[S.monoLabel, { color: COLORS.zinc600 }]}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Audio Engine */}
          <Animated.View style={{ transform: [{ scale: cardScale2 }] }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/audio-engine' as any)}
              style={styles.engineCard}
            >
              <LinearGradient
                colors={['rgba(168,85,247,0.06)', 'rgba(168,85,247,0.0)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <View style={styles.cardTopRow}>
                <View style={[styles.iconWrapper, { backgroundColor: COLORS.purpleDim, borderColor: COLORS.purpleBorder }]}>
                  <Text style={styles.iconText}>🎧</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: COLORS.purpleDim, borderColor: COLORS.purpleBorder }]}>
                  <Text style={[styles.badgeText, { color: COLORS.purple }]}>Active</Text>
                </View>
              </View>
              <Text style={styles.engineTitle}>Audio Engine</Text>
              <Text style={styles.engineDesc}>
                Create ultra-realistic voiceovers, clone voices, and generate high-fidelity audio streams.
              </Text>
              <View style={[styles.cardFooter, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
                <Text style={[S.monoLabel, { color: COLORS.purple }]}>TTS · STT · Clone · Translate</Text>
                <Text style={[S.monoLabel, { color: COLORS.zinc600 }]}>→</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

        </View>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={[S.monoLabel, { color: COLORS.zinc700 }]}>
            iPulse AI · Neural Synthesis Platform
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
    fontFamily: 'GoogleSans-Bold',
  },
  headerSub: {
    color: COLORS.zinc500,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 18,
  },
  logoutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
  },
  logoutText: {
    color: COLORS.zinc300,
    fontSize: 12,
    fontWeight: '600',
  },

  // Cards
  cardsContainer: {
    gap: 16,
    flex: 1,
  },
  engineCard: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    ...SHADOWS.cardShadow,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'GoogleSans-Bold',
  },
  engineTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  engineDesc: {
    color: COLORS.zinc400,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 4,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
});
