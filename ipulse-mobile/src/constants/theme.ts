/**
 * iPulse Mobile — Design System Tokens
 * Mirrors the web app's dark glassmorphism aesthetic
 */

import { StyleSheet, Platform } from 'react-native';

// ── Core Colors ──────────────────────────────────────────────────────────────
export const COLORS = {
  bg: '#03050c',          // matches web background
  bgCard: '#0b0f19',      // matches web surface/card bg
  bgDeep: '#000000',      // pure black for inputs
  bgGlass: 'rgba(255,255,255,0.03)',
  bgGlassMid: 'rgba(255,255,255,0.06)',

  border: 'rgba(255,255,255,0.08)',
  borderMid: 'rgba(255,255,255,0.12)',
  borderBright: 'rgba(255,255,255,0.25)',
  borderZinc: '#27272a',   // zinc-800

  white: '#ffffff',
  zinc100: '#f4f4f5',
  zinc300: '#d4d4d8',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  zinc600: '#52525b',
  zinc700: '#3f3f46',
  zinc800: '#27272a',
  zinc900: '#18181b',
  zinc950: '#03050c',

  // Engine themes
  purple: '#a855f7',
  purpleDim: 'rgba(168,85,247,0.15)',
  purpleBorder: 'rgba(168,85,247,0.3)',
  purpleDark: '#3b0764',

  cyan: '#22d3ee',
  cyanDim: 'rgba(34,211,238,0.12)',
  cyanBorder: 'rgba(34,211,238,0.25)',

  red: '#ef4444',
  redDim: 'rgba(239,68,68,0.1)',
  redBorder: 'rgba(239,68,68,0.3)',

  emerald: '#10b981',
  amber: '#f59e0b',
};

// ── Shadow / Glow Presets ─────────────────────────────────────────────────────
export const SHADOWS = {
  glowWhite: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  glowPurple: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  glowCyan: {
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  buttonGlowPurple: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGlowCyan: {
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ── Shared StyleSheet ─────────────────────────────────────────────────────────
export const S = StyleSheet.create({
  // Glass card
  glassCard: {
    backgroundColor: COLORS.bgGlass,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    ...SHADOWS.cardShadow,
  },

  // Input field
  inputDark: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    color: '#ffffff',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    padding: 14,
  },

  // Section label
  monoLabel: {
    fontFamily: 'GoogleSans-Regular',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'capitalize',
    color: COLORS.zinc500,
  },

  // Dot pulse indicator
  dotPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },

  // Primary purple button
  btnPrimary: {
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 8,
    ...SHADOWS.buttonGlowPurple,
  },

  // Primary cyan button
  btnPrimaryCyan: {
    backgroundColor: '#0891b2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
    gap: 8,
    ...SHADOWS.buttonGlowCyan,
  },

  btnText: {
    color: '#ffffff',
    fontFamily: 'Inter_700Bold',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Segment tab container
  tabContainer: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100,
    padding: 3,
    flexDirection: 'row' as const,
  },

  // Active tab pill
  tabActive: {
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center' as const,
  },

  // Dashed upload zone
  uploadZone: {
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 130,
  },
});

// ── Waveform bar heights for animation ───────────────────────────────────────
export const WAVEFORM_HEIGHTS = [
  [8, 40, 14, 36, 10],
  [16, 44, 10, 32, 16],
  [12, 36, 18, 42, 8],
  [20, 30, 12, 44, 14],
  [8, 44, 14, 36, 10],
  [14, 32, 20, 38, 12],
  [10, 42, 16, 28, 18],
  [18, 36, 8, 44, 14],
  [12, 40, 20, 30, 10],
  [8, 44, 14, 36, 10],
  [16, 30, 18, 42, 8],
  [14, 44, 10, 34, 16],
  [10, 38, 20, 28, 14],
  [20, 32, 12, 44, 10],
  [8, 42, 18, 36, 12],
  [16, 36, 10, 44, 14],
];

// ── Core theme components compatibility ───────────────────────────────────────
export type ThemeColor = 'text' | 'textSecondary' | 'background' | 'backgroundElement' | 'backgroundSelected';

export const Colors = {
  light: {
    text: '#111827',
    textSecondary: '#6b7280',
    background: '#ffffff',
    backgroundElement: '#f3f4f6',
    backgroundSelected: '#e5e7eb',
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#a1a1aa',
    background: '#03050c',
    backgroundElement: '#0b0f19',
    backgroundSelected: '#27272a',
  },
};

export const Spacing = {
  half: 4,
  one: 8,
  two: 12,
  three: 16,
  four: 20,
  five: 24,
};

export const MaxContentWidth = 1200;

export const Fonts = {
  mono: 'Inter_400Regular',
};

