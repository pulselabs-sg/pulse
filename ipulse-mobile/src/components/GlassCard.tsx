/**
 * GlassCard — Reusable glassmorphism card container
 * Matches web app's `glass border border-white/10 rounded-2xl` aesthetic
 */
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  noPadding?: boolean;
  borderColor?: string;
  glowColor?: string;
}

export default function GlassCard({
  children,
  style,
  noPadding = false,
  borderColor = COLORS.border,
  glowColor,
}: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        { borderColor },
        glowColor && {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 10,
        },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    ...SHADOWS.cardShadow,
    overflow: 'hidden',
  },
  padding: {
    padding: 20,
  },
});
