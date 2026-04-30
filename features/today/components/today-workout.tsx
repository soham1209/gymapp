import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { StatChip } from '@/components/ui/stat-chip';
import { useAppStore } from '@/store/use-app-store';
import type { Exercise, Weekday } from '@/types/workout';
import { palette } from '@/utils/theme';

type TodayExercise = {
  checklistId: string;
  sourceLabel: string;
  exercise: Exercise;
};

const weekdayMap: Record<number, Weekday> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

function getCurrentWeekday() {
  return weekdayMap[new Date().getDay()];
}

export function TodayWorkout() {
  const {
    weeklySchedule,
    exercises,
    workoutPlans,
    todayChecklist,
    plannerReady,
    initializeWorkoutPlanner,
    toggleTodayExercise,
  } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    void initializeWorkoutPlanner();
  }, [initializeWorkoutPlanner]);

  const currentDay = getCurrentWeekday();

  const todaysExercises = useMemo(() => {
    const scheduleForDay = weeklySchedule.find((entry) => entry.day === currentDay);

    if (!scheduleForDay) {
      return [];
    }

    return scheduleForDay.items.flatMap<TodayExercise>((item, index) => {
      if (item.type === 'exercise') {
        const exercise = exercises.find((entry) => entry.id === item.exerciseId);
        return exercise
          ? [
              {
                checklistId: `${currentDay}:${item.type}:${exercise.id}:${index}`,
                sourceLabel: 'Direct Assignment',
                exercise,
              },
            ]
          : [];
      }

      const workoutPlan = workoutPlans.find((entry) => entry.id === item.workoutPlanId);
      return workoutPlan
        ? workoutPlan.exercises.map((exercise, exerciseIndex) => ({
            checklistId: `${currentDay}:${item.type}:${workoutPlan.id}:${exercise.id}:${index}:${exerciseIndex}`,
            sourceLabel: workoutPlan.name,
            exercise,
          }))
        : [];
    });
  }, [currentDay, exercises, weeklySchedule, workoutPlans]);

  const completedCount = todaysExercises.filter((entry) => todayChecklist[entry.checklistId]).length;

  return (
    <View style={styles.container}>
      <BrutalCard style={styles.heroCard}>
        <Text style={styles.heroKicker}>Detected Day</Text>
        <Text style={styles.heroTitle}>{currentDay}</Text>
        <Text style={styles.heroBody}>
          The checklist below is pulled directly from your repeating weekly planner.
        </Text>
      </BrutalCard>

      <View style={styles.statsRow}>
        <StatChip label="Assigned" value={`${todaysExercises.length}`} />
        <StatChip label="Done" value={`${completedCount}`} />
        <StatChip label="Open" value={`${Math.max(todaysExercises.length - completedCount, 0)}`} />
      </View>

      <View style={styles.headerRow}>
        <SectionTitle>Checklist</SectionTitle>
        <Text style={styles.statusText}>{plannerReady ? 'Live Schedule' : 'Loading'}</Text>
      </View>

      <View style={styles.list}>
        {todaysExercises.length === 0 ? (
          <BrutalCard>
            <Text style={styles.emptyTitle}>No Work Assigned</Text>
            <Text style={styles.emptyBody}>
              Add exercises or a workout plan to {currentDay} in the Plan tab to populate today.
            </Text>
          </BrutalCard>
        ) : (
          todaysExercises.map((entry, index) => {
            const isDone = Boolean(todayChecklist[entry.checklistId]);
            const isExpanded = expandedId === entry.checklistId;

            return (
              <BrutalCard key={entry.checklistId} style={[styles.exerciseCard, isDone && styles.exerciseCardDone]}>
                <View style={styles.exerciseTopRow}>
                  <Pressable
                    style={[styles.checkbox, isDone && styles.checkboxChecked]}
                    onPress={() => toggleTodayExercise(entry.checklistId)}>
                    <Text style={[styles.checkboxLabel, isDone && styles.checkboxLabelChecked]}>
                      {isDone ? 'Done' : 'Open'}
                    </Text>
                  </Pressable>
                  <Text style={[styles.exerciseIndex, isDone && styles.doneText]}>{index + 1}</Text>
                </View>

                <Pressable onPress={() => setExpandedId(isExpanded ? null : entry.checklistId)} style={styles.expandArea}>
                  <Text style={[styles.exerciseName, isDone && styles.doneText]}>{entry.exercise.name}</Text>
                  <Text style={[styles.exerciseSource, isDone && styles.doneText]}>{entry.sourceLabel}</Text>
                  <Text style={[styles.expandLabel, isDone && styles.doneText]}>
                    {isExpanded ? 'Hide Details' : 'Show Details'}
                  </Text>
                </Pressable>

                {isExpanded ? (
                  <View style={styles.details}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, isDone && styles.doneText]}>Muscle Group</Text>
                      <Text style={[styles.detailValue, isDone && styles.doneText]}>
                        {entry.exercise.muscleGroup}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, isDone && styles.doneText]}>Prescription</Text>
                      <Text style={[styles.detailValue, isDone && styles.doneText]}>
                        {entry.exercise.defaultSets} sets x {entry.exercise.defaultReps} reps
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, isDone && styles.doneText]}>Rest</Text>
                      <Text style={[styles.detailValue, isDone && styles.doneText]}>
                        {entry.exercise.defaultRestTime} seconds
                      </Text>
                    </View>
                  </View>
                ) : null}
              </BrutalCard>
            );
          })
        )}
      </View>
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
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: palette.text,
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroBody: {
    color: palette.mutedText,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
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
  statusText: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  list: {
    gap: 16,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  emptyBody: {
    color: palette.mutedText,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  exerciseCard: {
    gap: 14,
  },
  exerciseCardDone: {
    backgroundColor: palette.text,
  },
  exerciseTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkbox: {
    borderColor: palette.border,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  checkboxChecked: {
    backgroundColor: palette.inverse,
  },
  checkboxLabel: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  checkboxLabelChecked: {
    color: palette.text,
  },
  exerciseIndex: {
    color: palette.mutedText,
    fontSize: 24,
    fontWeight: '900',
  },
  expandArea: {
    gap: 6,
  },
  exerciseName: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  exerciseSource: {
    color: palette.mutedText,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  expandLabel: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  details: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderWidth: 2,
    gap: 10,
    padding: 14,
  },
  detailRow: {
    gap: 4,
  },
  detailLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  doneText: {
    color: palette.inverse,
  },
});
