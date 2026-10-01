/**
 * MyCoaster design tokens — from design_handoff_mycoaster.
 * Light mode is the source of truth; dark values are reasonable inversions.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Static brand colors that do not change with the color scheme. */
export const Brand = {
  navy: '#0d1b3d',
  blue: '#3d5af1',
  bluePressed: '#2e49d8',
  lime: '#c8f04a',
  limeLight: '#e5ff7a',
  likeActive: '#d24a26',
  scrim: 'rgba(13,27,61,.45)',
} as const;

export const Colors = {
  light: {
    text: '#0d1b3d',
    background: '#eef3fd', // bgApp — screen background
    backgroundElement: '#ffffff', // bgCard — card surface
    backgroundSelected: '#e3e9fd',
    textSecondary: '#5d6c96',
    textMuted: '#8593b8',
    textBody: '#33415e',
    card: '#ffffff',
    border: '#d9e2f5',
    borderMuted: '#c3cfea',
    borderDashed: '#b9c6e8',
    blueTint: '#e3e9fd',
    starEmpty: '#c9d4ee',
    progressTrack: '#eef3fd',
    disabledBg: '#e9edf6',
  },
  dark: {
    text: '#f2f5ff',
    background: '#0a1129',
    backgroundElement: '#141d3d',
    backgroundSelected: '#22305e',
    textSecondary: '#93a2cc',
    textMuted: '#6e7ca6',
    textBody: '#c4cde8',
    card: '#141d3d',
    border: '#243158',
    borderMuted: '#31406e',
    borderDashed: '#31406e',
    blueTint: '#22305e',
    starEmpty: '#31406e',
    progressTrack: '#0a1129',
    disabledBg: '#1b2547',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Space Grotesk families loaded in the root layout. */
export const FontFamily = {
  regular: 'SpaceGrotesk_400Regular',
  medium: 'SpaceGrotesk_500Medium',
  bold: 'SpaceGrotesk_700Bold',
} as const;

/** Status pill colors (Coaster status). */
export const StatusColors = {
  operating: { label: 'Operating', bg: '#e6f4d9', fg: '#55830a' },
  sbno: { label: 'SBNO', bg: '#fff3d6', fg: '#a06b00' },
  under_construction: { label: 'Under construction', bg: '#e3e9fd', fg: '#3d5af1' },
  defunct: { label: 'Defunct', bg: '#e9edf6', fg: '#8593b8' },
} as const;

export type CoasterStatus = keyof typeof StatusColors;

/** Sentiment tag colors (AI summary chips). */
export const SentimentColors = {
  positive: { bg: '#eef7d8', fg: '#55830a', bd: '#d5e8a8' },
  negative: { bg: '#ffe9e3', fg: '#d24a26', bd: '#f5c8ba' },
  mixed: { bg: '#fff3d6', fg: '#a06b00', bd: '#efd9a2' },
} as const;

export type Sentiment = keyof typeof SentimentColors;

/** Moderation pill (photo uploads). */
export const ModerationPill = { bg: '#fff3d6', fg: '#a06b00' } as const;

export const Radii = {
  card: 22,
  cardSmall: 18,
  panel: 20,
  photoTile: 16,
  iconSquare: 12,
  sheet: 26,
  bar: 4,
  pill: 999,
} as const;

/** Card / CTA shadows from the handoff. */
export const Shadows = {
  card: {
    shadowColor: '#0d1b3d',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  blueCta: {
    shadowColor: '#3d5af1',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  limeCta: {
    shadowColor: '#c8f04a',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  floating: {
    shadowColor: '#0d1b3d',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
  /** Handoff rhythm: horizontal screen padding. */
  screenX: 20,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
