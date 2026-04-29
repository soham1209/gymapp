import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { StatChip } from '@/components/ui/stat-chip';
import { useAppStore } from '@/store/use-app-store';
import { palette } from '@/utils/theme';

export function HomeOverview() {
  const { athleteName, streak, workoutBlocks, weeklyStats, toggleWorkoutBlock } = useAppStore();

  return (
    <View style={styles.container}>
      <BrutalCard>
        <Text style={styles.heroKicker}>HOME BASE</Text>
        <Text style={styles.heroTitle}>{athleteName}, TRAIN HARD. RECOVER SMART.</Text>
        <Text style={styles.heroBody}>
          Today is built around sharp focus, clean volume, and visible momentum.
        </Text>
      </BrutalCard>

      <View style={styles.statsRow}>
        <StatChip label="Streak" value={`${streak} Days`} />
        {weeklyStats.slice(0, 2).map((stat) => (
          <StatChip key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <SectionTitle>Today&apos;s Blocks</SectionTitle>
      </View>

      <View style={styles.blocks}>
        {workoutBlocks.map((block) => (
          <Pressable key={block.id} onPress={() => toggleWorkoutBlock(block.id)} style={styles.pressable}>
            <BrutalCard style={[styles.blockCard, block.done && styles.blockDone]}>
              <View style={styles.blockTopRow}>
                <Text style={[styles.blockLabel, block.done && styles.blockDoneText]}>{block.label}</Text>
                <Text style={[styles.blockState, block.done && styles.blockDoneText]}>
                  {block.done ? 'DONE' : 'OPEN'}
                </Text>
              </View>
              <Text style={[styles.blockFocus, block.done && styles.blockDoneText]}>{block.focus}</Text>
              <Text style={[styles.blockDuration, block.done && styles.blockDoneText]}>
                {block.duration}
              </Text>
            </BrutalCard>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  heroKicker: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    textTransform: 'uppercase',
  },
  heroBody: {
    color: palette.mutedText,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionHeader: {
    marginTop: 4,
  },
  blocks: {
    gap: 16,
  },
  pressable: {
    alignSelf: 'stretch',
  },
  blockCard: {
    gap: 8,
  },
  blockDone: {
    backgroundColor: palette.text,
  },
  blockTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  blockLabel: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  blockState: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  blockFocus: {
    color: palette.mutedText,
    fontSize: 15,
    fontWeight: '600',
  },
  blockDuration: {
    color: palette.mutedText,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  blockDoneText: {
    color: palette.inverse,
  },
});
