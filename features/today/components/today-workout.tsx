import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { StatChip } from '@/components/ui/stat-chip';
import { useAppStore } from '@/store/use-app-store';
import type { Exercise, LoggedSet, Weekday } from '@/types/workout';
import { palette } from '@/utils/theme';
import { WorkoutTimerPanel } from '@/features/today/components/workout-timer-panel';

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

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function TodayWorkout() {
  const {
    weeklySchedule,
    exercises,
    workoutPlans,
    todayWorkoutLog,
    todayChecklist,
    workoutLogStatus,
    plannerReady,
    initializeWorkoutPlanner,
    toggleTodayExercise,
    addSetToExerciseLog,
    updateExerciseSetField,
    saveTodayWorkoutLog,
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

  const loggedSetCount =
    todayWorkoutLog?.exercises.reduce((total, entry) => total + entry.sets.length, 0) ?? 0;

  const getLoggedSets = (exerciseId: string): LoggedSet[] =>
    todayWorkoutLog?.exercises.find((entry) => entry.exerciseId === exerciseId)?.sets ?? [];

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
        <StatChip label="Sets Logged" value={`${loggedSetCount}`} />
      </View>

      <WorkoutTimerPanel />

      <View style={styles.headerRow}>
        <SectionTitle>Checklist</SectionTitle>
        <Text style={styles.statusText}>
          {!plannerReady ? 'Loading' : workoutLogStatus === 'saving' ? 'Saving Log' : 'Live Schedule'}
        </Text>
      </View>

      <Pressable style={styles.saveLogButton} onPress={() => void saveTodayWorkoutLog()}>
        <Text style={styles.saveLogLabel}>Save Workout Log</Text>
      </Pressable>

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
            const loggedSets = getLoggedSets(entry.exercise.id);

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

                    <View style={styles.logHeader}>
                      <Text style={[styles.logTitle, isDone && styles.doneText]}>Sets</Text>
                      <Pressable
                        style={styles.addSetButton}
                        onPress={() => addSetToExerciseLog(entry.exercise.id)}>
                        <Text style={styles.addSetLabel}>Add Set</Text>
                      </Pressable>
                    </View>

                    {loggedSets.length === 0 ? (
                      <Text style={[styles.logHint, isDone && styles.doneText]}>
                        Add a set to capture timer data, then enter reps and weight.
                      </Text>
                    ) : (
                      <View style={styles.setList}>
                        {loggedSets.map((setEntry) => (
                          <View key={`${entry.exercise.id}-${setEntry.setNumber}`} style={styles.setCard}>
                            <View style={styles.setHeader}>
                              <Text style={styles.setNumber}>Set {setEntry.setNumber}</Text>
                              <Text style={styles.setTime}>
                                Work {formatSeconds(setEntry.duration.workoutTime)} / Rest{' '}
                                {formatSeconds(setEntry.duration.restTime)}
                              </Text>
                            </View>
                            <View style={styles.setInputRow}>
                              <View style={styles.setInputGroup}>
                                <Text style={styles.setInputLabel}>Reps</Text>
                                <TextInput
                                  keyboardType="numeric"
                                  style={styles.setInput}
                                  value={String(setEntry.reps)}
                                  onChangeText={(value) =>
                                    updateExerciseSetField(
                                      entry.exercise.id,
                                      setEntry.setNumber,
                                      'reps',
                                      Number.parseInt(value || '0', 10) || 0,
                                    )
                                  }
                                />
                              </View>
                              <View style={styles.setInputGroup}>
                                <Text style={styles.setInputLabel}>Weight</Text>
                                <TextInput
                                  keyboardType="numeric"
                                  style={styles.setInput}
                                  value={String(setEntry.weight)}
                                  onChangeText={(value) =>
                                    updateExerciseSetField(
                                      entry.exercise.id,
                                      setEntry.setNumber,
                                      'weight',
                                      Number.parseInt(value || '0', 10) || 0,
                                    )
                                  }
                                />
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
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
  saveLogButton: {
    alignItems: 'center',
    backgroundColor: palette.text,
    borderColor: palette.border,
    borderWidth: 2,
    paddingVertical: 14,
  },
  saveLogLabel: {
    color: palette.inverse,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
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
  logHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  logTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  addSetButton: {
    backgroundColor: palette.text,
    borderColor: palette.border,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addSetLabel: {
    color: palette.inverse,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  logHint: {
    color: palette.mutedText,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  setList: {
    gap: 10,
  },
  setCard: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderWidth: 2,
    gap: 10,
    padding: 12,
  },
  setHeader: {
    gap: 4,
  },
  setNumber: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  setTime: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  setInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  setInputGroup: {
    flex: 1,
    gap: 6,
  },
  setInputLabel: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  setInput: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderWidth: 2,
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 10,
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
