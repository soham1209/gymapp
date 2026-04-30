import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { appTheme, palette } from '@/utils/theme';

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(palette.background).catch(() => undefined);
  }, []);

  return (
    <ThemeProvider value={appTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
