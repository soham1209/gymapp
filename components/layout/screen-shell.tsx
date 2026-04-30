import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { palette } from '@/utils/theme';

type ScreenShellProps = PropsWithChildren<{
  title: string;
  eyebrow: string;
  subtitle: string;
}>;

export function ScreenShell({ title, eyebrow, subtitle, children }: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    gap: 24,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 36,
  },
  header: {
    gap: 12,
  },
  eyebrow: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  title: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: palette.mutedText,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
    maxWidth: 360,
  },
});
