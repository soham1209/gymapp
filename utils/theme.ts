import type { Theme } from '@react-navigation/native';

export const palette = {
  background: '#f3f4f6',
  surface: '#ffffff',
  elevated: '#f8fafc',
  border: '#e5e7eb',
  text: '#1f2937',
  mutedText: '#6b7280',
  accent: '#8da3b8',
  inverse: '#ffffff',
  success: '#a7c4a0',
  danger: '#d9a5a5',
} as const;

export const appTheme: Theme = {
  dark: false,
  colors: {
    primary: palette.accent,
    background: palette.background,
    card: palette.surface,
    text: palette.text,
    border: palette.border,
    notification: palette.text,
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '800',
    },
  },
};

export const appShadows = {
  block: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
} as const;
