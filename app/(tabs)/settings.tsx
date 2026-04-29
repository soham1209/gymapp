import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/layout/screen-shell';
import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { ExerciseManager } from '@/features/exercises/components/exercise-manager';
import { firebaseConfig, isFirebaseConfigured } from '@/services/firebase';
import { useAppStore } from '@/store/use-app-store';
import { palette } from '@/utils/theme';

export default function SettingsScreen() {
  const { recoveryMode, toggleRecoveryMode } = useAppStore();

  return (
    <ScreenShell
      title="Settings"
      eyebrow="System"
      subtitle="Project wiring lives here: app state, Firebase readiness, and a simple recovery switch.">
      <SectionTitle>Controls</SectionTitle>
      <Pressable onPress={toggleRecoveryMode}>
        <BrutalCard style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Recovery Mode</Text>
            <Text style={styles.rowBody}>Reduce intensity cues and favor restoration work.</Text>
          </View>
          <Text style={styles.rowState}>{recoveryMode ? 'ON' : 'OFF'}</Text>
        </BrutalCard>
      </Pressable>

      <SectionTitle>Firebase</SectionTitle>
      <BrutalCard style={styles.firebaseCard}>
        <Text style={styles.rowTitle}>{isFirebaseConfigured ? 'Configured' : 'Needs Env Values'}</Text>
        <Text style={styles.rowBody}>
          Add `EXPO_PUBLIC_FIREBASE_*` variables to enable your modular Firebase app instance.
        </Text>
        <Text style={styles.metaText}>
          Project ID: {firebaseConfig.projectId ?? 'missing'}
        </Text>
      </BrutalCard>

      <ExerciseManager />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  rowTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  rowBody: {
    color: palette.mutedText,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    maxWidth: 240,
  },
  rowState: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
  },
  firebaseCard: {
    gap: 10,
  },
  metaText: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
