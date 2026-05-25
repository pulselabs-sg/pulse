/**
 * WaveformLoader — Animated 16-bar waveform
 * Mirrors the web app's loading animation in WorkspacePanel.tsx
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

interface WaveformLoaderProps {
  stageLabel?: string;
  elapsed?: number;
  progress?: number;
  color?: string;
  glowColor?: string;
}

const BAR_COUNT = 16;

export default function WaveformLoader({
  stageLabel = 'Processing...',
  elapsed = 0,
  progress = 0,
  color = COLORS.purple,
  glowColor,
}: WaveformLoaderProps) {
  const resolvedGlow = glowColor || color;

  // Create animated values for each bar
  const animValues = useRef<Animated.Value[]>(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = animValues.map((val, i) => {
      const duration = 900 + (i % 5) * 120;
      const delay = i * 50;
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: duration / 2,
            useNativeDriver: false,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: false,
          }),
        ])
      );
    });

    const master = Animated.parallel(animations);
    master.start();
    return () => master.stop();
  }, []);

  const maxHeights = [40, 50, 30, 48, 36, 44, 28, 52, 38, 46, 32, 50, 28, 44, 36, 48];
  const minHeights = [8, 10, 6, 12, 8, 10, 6, 14, 8, 10, 6, 12, 6, 10, 8, 12];

  return (
    <View style={styles.container}>
      {/* Ambient glow layer */}
      <View
        style={[
          styles.ambientGlow,
          { backgroundColor: resolvedGlow, shadowColor: resolvedGlow },
        ]}
      />

      {/* Waveform bars */}
      <View style={styles.barsRow}>
        {animValues.map((val, i) => {
          const barColors = [
            color,
            color,
            `${color}cc`,
            `${color}99`,
          ];
          const barColor = barColors[i % barColors.length];
          const animHeight = val.interpolate({
            inputRange: [0, 1],
            outputRange: [minHeights[i], maxHeights[i]],
          });
          const animOpacity = val.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 1],
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                {
                  height: animHeight,
                  opacity: animOpacity,
                  backgroundColor: barColor,
                  shadowColor: resolvedGlow,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Stage label */}
      <Text style={[styles.stageLabel, { color: COLORS.white }]}>
        {stageLabel}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(progress, 100)}%` as any,
              backgroundColor: color,
              shadowColor: resolvedGlow,
            },
          ]}
        />
      </View>

      <View style={styles.bottomRow}>
        <Text style={[styles.elapsed, { color: COLORS.zinc500 }]}>
          {elapsed}s elapsed
        </Text>
        <Text style={[styles.percent, { color }]}>
          {Math.round(progress)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    width: '100%',
    gap: 16,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    width: 200,
    height: 60,
    opacity: 0.08,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    blurRadius: 40,
  } as any,
  barsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 56,
  },
  bar: {
    width: 3.5,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  stageLabel: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  progressTrack: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  elapsed: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  percent: {
    fontFamily: 'GoogleSans-Bold',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
