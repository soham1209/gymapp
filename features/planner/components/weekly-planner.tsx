import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { useAppStore } from '@/store/use-app-store';
import type { Exercise, Weekday, WeeklyScheduleItem, WorkoutPlan } from '@/types/workout';
import { palette } from '@/utils/theme';

type ResolvedScheduleItem = {
  key: string;
  title: string;
  meta: string;
  expandedExercises: Exercise[];
  typeLabel: 'Exercise' | 'Plan';
};

function resolveScheduleItem(
  item: WeeklyScheduleItem,
  exercises: Exercise[],
  workoutPlans: WorkoutPlan[],
): ResolvedScheduleItem | null {
  if (item.type === 'exercise') {
    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
    return exercise
      ? {
          key: `${item.type}-${exercise.id}`,
          title: exercise.name,
          meta: `${exercise.muscleGroup} / ${exercise.defaultSets}x${exercise.defaultReps}`,
          expandedExercises: [exercise],
          typeLabel: 'Exercise',
        }
      : null;
  }

  const workoutPlan = workoutPlans.find((entry) => entry.id === item.workoutPlanId);
  return workoutPlan
    ? {
        key: `${item.type}-${workoutPlan.id}`,
        title: workoutPlan.name,
        meta: `${workoutPlan.exercises.length} exercise block`,
        expandedExercises: workoutPlan.exercises,
        typeLabel: 'Plan',
      }
    : null;
}

function isResolvedScheduleItem(item: ResolvedScheduleItem | null): item is ResolvedScheduleItem {
  return item !== null;
}

export function WeeklyPlanner() {
  const {
    exercises,
    workoutPlans,
    weeklySchedule,
    plannerReady,
    plannerStatus,
    initializeWorkoutPlanner,
    addExerciseToDay,
    addWorkoutPlanToDay,
  } = useAppStore();
  const [planPickerDay, setPlanPickerDay] = useState<Weekday | null>(null);

  useEffect(() => {
    void initializeWorkoutPlanner();
  }, [initializeWorkoutPlanner]);

  const nextExerciseForDay = (day: Weekday) => {
    const dayEntry = weeklySchedule.find((entry) => entry.day === day);
    return exercises[dayEntry ? dayEntry.items.length % exercises.length : 0];
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <SectionTitle>Weekly Planner</SectionTitle>
        <Text style={styles.statusText}>
          {plannerStatus === 'saving'
            ? 'Saving'
            : plannerStatus === 'loading'
              ? 'Loading'
              : plannerStatus === 'error'
                ? 'Offline Cache Active'
                : 'Repeats Weekly'}
        </Text>
      </View>

      {!plannerReady ? (
        <BrutalCard>
          <Text style={styles.loadingTitle}>Building Your Week</Text>
          <Text style={styles.loadingBody}>Pulling the latest weekly schedule and local cache.</Text>
        </BrutalCard>
      ) : (
        <View style={styles.days}>
          {weeklySchedule.map((dayEntry) => {
            const resolvedItems = dayEntry.items
              .map((item) => resolveScheduleItem(item, exercises, workoutPlans))
              .filter(isResolvedScheduleItem);

            const nextExercise = nextExerciseForDay(dayEntry.day);
            const isPlanPickerOpen = planPickerDay === dayEntry.day;

            return (
              <BrutalCard key={dayEntry.day} style={styles.dayCard}>
                <View style={styles.dayTopRow}>
                  <View style={styles.dayHeading}>
                    <Text style={styles.dayLabel}>{dayEntry.day}</Text>
                    <Text style={styles.dayMeta}>
                      {dayEntry.items.length === 0 ? 'No assignments yet' : `${dayEntry.items.length} assigned`}
                    </Text>
                  </View>
                  <Text style={styles.repeatBadge}>Weekly</Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => void addExerciseToDay(dayEntry.day, nextExercise.id)}
                    style={styles.actionButton}>
                    <Text style={styles.actionButtonLabel}>+ Exercise</Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      setPlanPickerDay((current) => (current === dayEntry.day ? null : dayEntry.day))
                    }
                    style={styles.actionButton}>
                    <Text style={styles.actionButtonLabel}>+ Plan</Text>
                  </Pressable>
                </View>

                {isPlanPickerOpen ? (
                  <View style={styles.planPicker}>
                    <Text style={styles.planPickerTitle}>Choose a saved plan</Text>
                    {workoutPlans.length === 0 ? (
                      <Text style={styles.planPickerEmpty}>
                        Build a workout plan above, then assign it here.
                      </Text>
                    ) : (
                      workoutPlans.map((plan) => (
                        <Pressable
                          key={plan.id}
                          style={styles.planPickerItem}
                          onPress={() => {
                            void addWorkoutPlanToDay(dayEntry.day, plan.id);
                            setPlanPickerDay(null);
                          }}>
                          <View style={styles.planPickerTextWrap}>
                            <Text style={styles.planPickerName}>{plan.name}</Text>
                            <Text style={styles.planPickerMeta}>
                              {plan.exercises.length} exercises
                            </Text>
                          </View>
                          <Text style={styles.planPickerAction}>Assign</Text>
                        </Pressable>
                      ))
                    )}
                  </View>
                ) : null}

                <View style={styles.items}>
                  {resolvedItems.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyTitle}>Open Slot</Text>
                      <Text style={styles.emptyBody}>
                        Add a single exercise or drop in a full workout plan.
                      </Text>
                    </View>
                  ) : (
                    resolvedItems.map((item) => (
                      <View key={item.key} style={styles.itemBlock}>
                        <View style={styles.itemHeader}>
                          <Text style={styles.itemTitle}>{item.title}</Text>
                          <Text style={styles.itemType}>{item.typeLabel}</Text>
                        </View>
                        <Text style={styles.itemMeta}>{item.meta}</Text>
                        {item.expandedExercises.map((exercise) => (
                          <View key={`${item.key}-${exercise.id}`} style={styles.exerciseRow}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            <Text style={styles.exerciseMeta}>
                              {exercise.defaultSets}x{exercise.defaultReps} / {exercise.defaultRestTime}s rest
                            </Text>
                          </View>
                        ))}
                      </View>
                    ))
                  )}
                </View>
              </BrutalCard>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
  loadingTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  loadingBody: {
    color: palette.mutedText,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  days: {
    gap: 18,
  },
  dayCard: {
    gap: 16,
  },
  dayTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayHeading: {
    gap: 4,
  },
  dayLabel: {
    color: palette.text,
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  dayMeta: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  repeatBadge: {
    borderColor: palette.border,
    borderWidth: 2,
    color: palette.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: palette.text,
    borderColor: palette.border,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionButtonLabel: {
    color: palette.inverse,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  planPicker: {
    borderColor: palette.border,
    borderWidth: 2,
    gap: 10,
    padding: 12,
  },
  planPickerTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  planPickerEmpty: {
    color: palette.mutedText,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  planPickerItem: {
    alignItems: 'center',
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  planPickerTextWrap: {
    flex: 1,
    gap: 4,
  },
  planPickerName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  planPickerMeta: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  planPickerAction: {
    color: palette.text,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  items: {
    gap: 12,
  },
  emptyState: {
    borderColor: palette.border,
    borderStyle: 'dashed',
    borderWidth: 2,
    gap: 6,
    padding: 14,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  emptyBody: {
    color: palette.mutedText,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  itemBlock: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderWidth: 2,
    gap: 10,
    padding: 14,
  },
  itemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTitle: {
    color: palette.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    paddingRight: 10,
    textTransform: 'uppercase',
  },
  itemType: {
    color: palette.mutedText,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  itemMeta: {
    color: palette.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  exerciseRow: {
    borderTopColor: palette.border,
    borderTopWidth: 1,
    gap: 4,
    paddingTop: 10,
  },
  exerciseName: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  exerciseMeta: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
});
