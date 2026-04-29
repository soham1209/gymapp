import { StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '@/components/layout/screen-shell';
import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { useAppStore } from '@/store/use-app-store';
import { palette } from '@/utils/theme';

export default function ProgressScreen() {
  const { weeklyStats, completedSessions, weeklyGoal } = useAppStore();

  return (
    <ScreenShell
      title="Progress"
      eyebrow="Scoreboard"
      subtitle="High-contrast feedback on consistency, output, and recovery so your trend is obvious at a glance.">
      <BrutalCard style={styles.hero}>
        <Text style={styles.heroValue}>
          {completedSessions} / {weeklyGoal}
        </Text>
        <Text style={styles.heroLabel}>sessions completed this week</Text>
      </BrutalCard>

      <SectionTitle>Metrics</SectionTitle>
      <View style={styles.list}>
        {weeklyStats.map((stat) => (
          <BrutalCard key={stat.label} style={styles.metric}>
            <Text style={styles.metricLabel}>{stat.label}</Text>
            <Text style={styles.metricValue}>{stat.value}</Text>
          </BrutalCard>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 28,
  },
  heroValue: {
    color: palette.text,
    fontSize: 44,
    fontWeight: '900',
  },
  heroLabel: {
    color: palette.mutedText,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  list: {
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: palette.mutedText,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '900',
  },
});
