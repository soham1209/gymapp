import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { StatChip } from '@/components/ui/stat-chip';
import { useAppStore } from '@/store/use-app-store';
import type { Exercise, LoggedSet, WorkoutLog } from '@/types/workout';
import { palette } from '@/utils/theme';

type DateRangeFilter = '7D' | '30D' | '90D' | 'ALL';

type ChartPoint = {
  label: string;
  value: number;
};

type FlattenedSet = {
  date: string;
  exerciseId: string;
  reps: number;
  weight: number;
  volume: number;
  set: LoggedSet;
};

const dateRanges: DateRangeFilter[] = ['7D', '30D', '90D', 'ALL'];

function parseDateKey(date: string) {
  return new Date(`${date}T00:00:00`);
}

function matchesDateRange(date: string, range: DateRangeFilter) {
  if (range === 'ALL') {
    return true;
  }

  const today = new Date();
  const target = parseDateKey(date);
  const daysBack = range === '7D' ? 7 : range === '30D' ? 30 : 90;
  const start = new Date(today);
  start.setDate(today.getDate() - (daysBack - 1));
  start.setHours(0, 0, 0, 0);

  return target >= start && target <= today;
}

function flattenWorkoutLogs(workoutLogs: WorkoutLog[]) {
  return workoutLogs.flatMap<FlattenedSet>((log) =>
    log.exercises.flatMap((exerciseEntry) =>
      exerciseEntry.sets.map((setEntry) => ({
        date: log.date,
        exerciseId: exerciseEntry.exerciseId,
        reps: setEntry.reps,
        weight: setEntry.weight,
        volume: setEntry.reps * setEntry.weight,
        set: setEntry,
      })),
    ),
  );
}

function buildWeightProgression(points: FlattenedSet[]) {
  const grouped = new Map<string, number>();

  points.forEach((point) => {
    const current = grouped.get(point.date) ?? 0;
    grouped.set(point.date, Math.max(current, point.weight));
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, value]) => ({
      label: date.slice(5),
      value,
    }));
}

function buildVolumeProgression(points: FlattenedSet[]) {
  const grouped = new Map<string, number>();

  points.forEach((point) => {
    grouped.set(point.date, (grouped.get(point.date) ?? 0) + point.volume);
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, value]) => ({
      label: date.slice(5),
      value,
    }));
}

function BasicBarChart({
  title,
  metricLabel,
  points,
}: {
  title: string;
  metricLabel: string;
  points: ChartPoint[];
}) {
  const maxValue = Math.max(...points.map((point) => point.value), 0);

  return (
    <BrutalCard style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.chartMetric}>{metricLabel}</Text>
      </View>

      {points.length === 0 ? (
        <Text style={styles.emptyText}>No logged data for this filter yet.</Text>
      ) : (
        <View style={styles.chartBars}>
          {points.map((point) => {
            const height = maxValue > 0 ? Math.max((point.value / maxValue) * 140, 10) : 10;

            return (
              <View key={`${title}-${point.label}`} style={styles.barColumn}>
                <Text style={styles.barValue}>{Math.round(point.value)}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height }]} />
                </View>
                <Text style={styles.barLabel}>{point.label}</Text>
              </View>
            );
          })}
        </View>
      )}
    </BrutalCard>
  );
}

export function ProgressDashboard() {
  const { exercises, workoutLogs, plannerReady, initializeWorkoutPlanner } = useAppStore();
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30D');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('ALL');

  useEffect(() => {
    void initializeWorkoutPlanner();
  }, [initializeWorkoutPlanner]);

  const flattenedSets = useMemo(() => flattenWorkoutLogs(workoutLogs), [workoutLogs]);

  const exerciseOptions = useMemo(() => {
    const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    const usedExerciseIds = [...new Set(flattenedSets.map((entry) => entry.exerciseId))];
    const usedExercises = usedExerciseIds
      .map((exerciseId) => exerciseMap.get(exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));

    return usedExercises;
  }, [exercises, flattenedSets]);

  useEffect(() => {
    if (selectedExerciseId === 'ALL' && exerciseOptions.length > 0) {
      setSelectedExerciseId(exerciseOptions[0].id);
      return;
    }

    if (
      selectedExerciseId !== 'ALL' &&
      exerciseOptions.length > 0 &&
      !exerciseOptions.some((exercise) => exercise.id === selectedExerciseId)
    ) {
      setSelectedExerciseId(exerciseOptions[0].id);
    }
  }, [exerciseOptions, selectedExerciseId]);

  const filteredSets = useMemo(
    () =>
      flattenedSets.filter(
        (entry) =>
          matchesDateRange(entry.date, dateRange) &&
          (selectedExerciseId === 'ALL' || entry.exerciseId === selectedExerciseId),
      ),
    [dateRange, flattenedSets, selectedExerciseId],
  );

  const selectedExerciseName =
    selectedExerciseId === 'ALL'
      ? 'All Exercises'
      : exercises.find((exercise) => exercise.id === selectedExerciseId)?.name ?? 'Exercise';

  const totalVolume = filteredSets.reduce((sum, entry) => sum + entry.volume, 0);
  const maxWeight = filteredSets.reduce((max, entry) => Math.max(max, entry.weight), 0);
  const totalSets = filteredSets.length;

  const weightProgression = useMemo(() => buildWeightProgression(filteredSets), [filteredSets]);
  const volumeProgression = useMemo(() => buildVolumeProgression(filteredSets), [filteredSets]);

  return (
    <View style={styles.container}>
      <BrutalCard style={styles.heroCard}>
        <Text style={styles.heroKicker}>Progress Feed</Text>
        <Text style={styles.heroTitle}>{plannerReady ? 'Logs Loaded' : 'Loading Logs'}</Text>
        <Text style={styles.heroBody}>
          Track working weight and total training volume without touching your weekly plans.
        </Text>
      </BrutalCard>

      <View style={styles.filterBlock}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Date Range</Text>
          <View style={styles.filterRow}>
            {dateRanges.map((range) => (
              <Pressable
                key={range}
                style={[styles.filterPill, dateRange === range && styles.filterPillActive]}
                onPress={() => setDateRange(range)}>
                <Text
                  style={[
                    styles.filterPillLabel,
                    dateRange === range && styles.filterPillLabelActive,
                  ]}>
                  {range}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Exercise</Text>
          <View style={styles.filterRow}>
            {exerciseOptions.length === 0 ? (
              <Text style={styles.emptyText}>Save a workout log to unlock exercise filters.</Text>
            ) : (
              exerciseOptions.map((exercise) => (
                <Pressable
                  key={exercise.id}
                  style={[
                    styles.filterPill,
                    selectedExerciseId === exercise.id && styles.filterPillActive,
                  ]}
                  onPress={() => setSelectedExerciseId(exercise.id)}>
                  <Text
                    style={[
                      styles.filterPillLabel,
                      selectedExerciseId === exercise.id && styles.filterPillLabelActive,
                    ]}>
                    {exercise.name}
                  </Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatChip label="Exercise" value={selectedExerciseName} />
        <StatChip label="Total Volume" value={`${Math.round(totalVolume)}`} />
        <StatChip label="Peak Weight" value={`${Math.round(maxWeight)}`} />
        <StatChip label="Sets Logged" value={`${totalSets}`} />
      </View>

      <View style={styles.headerRow}>
        <SectionTitle>Charts</SectionTitle>
        <Text style={styles.headerMeta}>Logs Only</Text>
      </View>

      <BasicBarChart
        title="Weight Progression"
        metricLabel="Max weight per day"
        points={weightProgression}
      />
      <BasicBarChart
        title="Total Volume"
        metricLabel="Sets x reps x weight"
        points={volumeProgression}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  heroCard: {
    gap: 10,
  },
  heroKicker: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    color: palette.text,
    fontSize: 30,
    fontWeight: '800',
  },
  heroBody: {
    color: palette.mutedText,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  filterBlock: {
    gap: 14,
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterPillActive: {
    backgroundColor: palette.text,
  },
  filterPillLabel: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillLabelActive: {
    color: palette.inverse,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerMeta: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '600',
  },
  chartCard: {
    gap: 14,
  },
  chartHeader: {
    gap: 4,
  },
  chartTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
  },
  chartMetric: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '500',
  },
  chartBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    minHeight: 180,
  },
  barColumn: {
    flex: 1,
    gap: 8,
    justifyContent: 'flex-end',
  },
  barValue: {
    color: palette.text,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  barTrack: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    height: 150,
    justifyContent: 'flex-end',
    padding: 4,
  },
  barFill: {
    backgroundColor: palette.text,
    width: '100%',
  },
  barLabel: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyText: {
    color: palette.mutedText,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
});
