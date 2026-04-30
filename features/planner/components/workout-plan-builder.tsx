import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { useAppStore } from '@/store/use-app-store';
import type { Exercise } from '@/types/workout';
import { palette } from '@/utils/theme';

function toggleExercise(current: string[], exerciseId: string) {
  return current.includes(exerciseId)
    ? current.filter((id) => id !== exerciseId)
    : [...current, exerciseId];
}

function moveExercise(ids: string[], fromIndex: number, direction: -1 | 1) {
  const nextIndex = fromIndex + direction;

  if (nextIndex < 0 || nextIndex >= ids.length) {
    return ids;
  }

  const next = [...ids];
  const [item] = next.splice(fromIndex, 1);
  next.splice(nextIndex, 0, item);
  return next;
}

export function WorkoutPlanBuilder() {
  const { exercises, workoutPlanStatus, createWorkoutPlan } = useAppStore();
  const [planName, setPlanName] = useState('');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);

  const selectedExercises = useMemo(() => {
    const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));
    return selectedExerciseIds
      .map((exerciseId) => exerciseMap.get(exerciseId))
      .filter((exercise): exercise is Exercise => Boolean(exercise));
  }, [exercises, selectedExerciseIds]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <SectionTitle>Plan Builder</SectionTitle>
        <Text style={styles.statusText}>
          {workoutPlanStatus === 'saving'
            ? 'Saving'
            : workoutPlanStatus === 'error'
              ? 'Retry Pending'
              : 'Stored Globally'}
        </Text>
      </View>

      <BrutalCard style={styles.card}>
        <Text style={styles.cardTitle}>Create Workout Plan</Text>
        <TextInput
          placeholder="Plan Name"
          placeholderTextColor={palette.mutedText}
          style={styles.input}
          value={planName}
          onChangeText={setPlanName}
        />

        <View style={styles.selectorList}>
          {exercises.map((exercise) => {
            const selected = selectedExerciseIds.includes(exercise.id);

            return (
              <Pressable
                key={exercise.id}
                style={[styles.selectorItem, selected && styles.selectorItemActive]}
                onPress={() => setSelectedExerciseIds((current) => toggleExercise(current, exercise.id))}>
                <View style={styles.selectorTextWrap}>
                  <Text style={[styles.selectorTitle, selected && styles.selectorTitleActive]}>
                    {exercise.name}
                  </Text>
                  <Text style={[styles.selectorMeta, selected && styles.selectorMetaActive]}>
                    {exercise.muscleGroup} / {exercise.defaultSets}x{exercise.defaultReps}
                  </Text>
                </View>
                <Text style={[styles.selectorBadge, selected && styles.selectorBadgeActive]}>
                  {selected ? 'Added' : 'Add'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Exercise Order</Text>
          {selectedExercises.length === 0 ? (
            <Text style={styles.emptyText}>Select exercises to start building the plan.</Text>
          ) : (
            selectedExercises.map((exercise, index) => (
              <View key={`${exercise.id}-${index}`} style={styles.previewRow}>
                <View style={styles.previewTextWrap}>
                  <Text style={styles.previewName}>
                    {index + 1}. {exercise.name}
                  </Text>
                  <Text style={styles.previewMeta}>
                    {exercise.defaultSets}x{exercise.defaultReps} / {exercise.defaultRestTime}s rest
                  </Text>
                </View>
                <View style={styles.orderButtons}>
                  <Pressable
                    style={styles.orderButton}
                    onPress={() => setSelectedExerciseIds((current) => moveExercise(current, index, -1))}>
                    <Text style={styles.orderButtonLabel}>Up</Text>
                  </Pressable>
                  <Pressable
                    style={styles.orderButton}
                    onPress={() => setSelectedExerciseIds((current) => moveExercise(current, index, 1))}>
                    <Text style={styles.orderButtonLabel}>Down</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <Pressable
          style={[
            styles.saveButton,
            (!planName.trim() || selectedExerciseIds.length === 0) && styles.saveButtonDisabled,
          ]}
          disabled={!planName.trim() || selectedExerciseIds.length === 0}
          onPress={() => {
            void createWorkoutPlan(planName, selectedExerciseIds);
            setPlanName('');
            setSelectedExerciseIds([]);
          }}>
          <Text style={styles.saveButtonLabel}>Save Plan</Text>
        </Pressable>
      </BrutalCard>
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
    fontWeight: '600',
  },
  card: {
    gap: 16,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '700',
  },
  input: {
    backgroundColor: palette.background,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    color: palette.text,
    fontSize: 15,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectorList: {
    gap: 10,
  },
  selectorItem: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  selectorItemActive: {
    backgroundColor: palette.text,
  },
  selectorTextWrap: {
    flex: 1,
    gap: 4,
  },
  selectorTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  selectorTitleActive: {
    color: palette.inverse,
  },
  selectorMeta: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '500',
  },
  selectorMetaActive: {
    color: palette.inverse,
  },
  selectorBadge: {
    color: palette.text,
    fontSize: 11,
    fontWeight: '600',
  },
  selectorBadgeActive: {
    color: palette.inverse,
  },
  previewSection: {
    gap: 10,
  },
  previewTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: palette.mutedText,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  previewRow: {
    alignItems: 'center',
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  previewTextWrap: {
    flex: 1,
    gap: 4,
  },
  previewName: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  previewMeta: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '500',
  },
  orderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  orderButton: {
    borderColor: palette.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  orderButtonLabel: {
    color: palette.text,
    fontSize: 11,
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: palette.text,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveButtonLabel: {
    color: palette.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
});
