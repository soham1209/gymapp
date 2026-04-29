import { StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/layout/screen-shell';
import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { palette } from '@/utils/theme';

const days = [
  ['MON', 'Lower strength + sled pushes'],
  ['TUE', 'Upper strength + row intervals'],
  ['WED', 'Mobility, breath work, and core'],
  ['THU', 'Posterior chain power + carries'],
  ['FRI', 'Conditioning ladder + accessories'],
];

export default function PlanScreen() {
  return (
    <ScreenShell
      title="Plan"
      eyebrow="Weekly Split"
      subtitle="A compact weekly structure with enough detail to keep the plan actionable.">
      <SectionTitle>Week Map</SectionTitle>
      <View style={styles.list}>
        {days.map(([day, workout]) => (
          <BrutalCard key={day} style={styles.card}>
            <Text style={styles.day}>{day}</Text>
            <Text style={styles.workout}>{workout}</Text>
          </BrutalCard>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 16,
  },
  card: {
    gap: 8,
  },
  day: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  workout: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
    textTransform: 'uppercase',
  },
});
