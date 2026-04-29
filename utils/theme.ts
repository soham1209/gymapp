import type { Theme } from '@react-navigation/native';

export const palette = {
  background: '#050505',
  surface: '#111111',
  elevated: '#171717',
  border: '#ffffff',
  text: '#ffffff',
  mutedText: '#b3b3b3',
  accent: '#ffffff',
  inverse: '#000000',
  success: '#ffffff',
  danger: '#ffffff',
} as const;

export const brutalTheme: Theme = {
  dark: true,
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
      fontWeight: '500',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '800',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '900',
    },
  },
};

export const brutalShadows = {
  block: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;
