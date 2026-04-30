import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { useAppStore } from '@/store/use-app-store';
import type { Exercise, ExerciseDraft, MuscleGroup } from '@/types/workout';
import { palette } from '@/utils/theme';

const muscleGroups: MuscleGroup[] = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
  'Cardio',
  'Other',
];

const emptyDraft: ExerciseDraft = {
  name: '',
  muscleGroup: 'Chest',
  defaultSets: 4,
  defaultReps: 8,
  defaultRestTime: 60,
};

function numberFromInput(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

type ExerciseFormProps = {
  draft: ExerciseDraft;
  onChange: (draft: ExerciseDraft) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
};

function ExerciseForm({ draft, onChange, onSubmit, submitLabel, onCancel }: ExerciseFormProps) {
  return (
    <View style={styles.form}>
      <TextInput
        placeholder="Exercise Name"
        placeholderTextColor={palette.mutedText}
        style={styles.input}
        value={draft.name}
        onChangeText={(name) => onChange({ ...draft, name })}
      />

      <View style={styles.pillRow}>
        {muscleGroups.map((group) => (
          <Pressable
            key={group}
            style={[styles.pill, draft.muscleGroup === group && styles.pillActive]}
            onPress={() => onChange({ ...draft, muscleGroup: group })}>
            <Text style={[styles.pillLabel, draft.muscleGroup === group && styles.pillLabelActive]}>
              {group}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricField}>
          <Text style={styles.metricLabel}>Sets</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="4"
            placeholderTextColor={palette.mutedText}
            style={styles.input}
            value={String(draft.defaultSets)}
            onChangeText={(value) =>
              onChange({ ...draft, defaultSets: numberFromInput(value, draft.defaultSets) })
            }
          />
        </View>
        <View style={styles.metricField}>
          <Text style={styles.metricLabel}>Reps</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="8"
            placeholderTextColor={palette.mutedText}
            style={styles.input}
            value={String(draft.defaultReps)}
            onChangeText={(value) =>
              onChange({ ...draft, defaultReps: numberFromInput(value, draft.defaultReps) })
            }
          />
        </View>
        <View style={styles.metricField}>
          <Text style={styles.metricLabel}>Rest</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="60"
            placeholderTextColor={palette.mutedText}
            style={styles.input}
            value={String(draft.defaultRestTime)}
            onChangeText={(value) =>
              onChange({ ...draft, defaultRestTime: numberFromInput(value, draft.defaultRestTime) })
            }
          />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.primaryButton, !draft.name.trim() && styles.buttonDisabled]}
          disabled={!draft.name.trim()}
          onPress={onSubmit}>
          <Text style={styles.primaryButtonLabel}>{submitLabel}</Text>
        </Pressable>
        {onCancel ? (
          <Pressable style={styles.secondaryButton} onPress={onCancel}>
            <Text style={styles.secondaryButtonLabel}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function toDraft(exercise: Exercise): ExerciseDraft {
  return {
    name: exercise.name,
    muscleGroup: exercise.muscleGroup,
    defaultSets: exercise.defaultSets,
    defaultReps: exercise.defaultReps,
    defaultRestTime: exercise.defaultRestTime,
  };
}

export function ExerciseManager() {
  const { exercises, exerciseStatus, addExercise, updateExercise, deleteExercise } = useAppStore();
  const [createDraft, setCreateDraft] = useState<ExerciseDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ExerciseDraft>(emptyDraft);

  const startEditing = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setEditDraft(toDraft(exercise));
  };

  const stopEditing = () => {
    setEditingId(null);
    setEditDraft(emptyDraft);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <SectionTitle>Exercises</SectionTitle>
        <Text style={styles.statusText}>
          {exerciseStatus === 'saving' ? 'Syncing' : exerciseStatus === 'error' ? 'Retry Pending' : 'Global'}
        </Text>
      </View>

      <BrutalCard style={styles.createCard}>
        <Text style={styles.cardTitle}>Add New Exercise</Text>
        <ExerciseForm
          draft={createDraft}
          onChange={setCreateDraft}
          onSubmit={() => {
            void addExercise(createDraft);
            setCreateDraft(emptyDraft);
          }}
          submitLabel="Add Exercise"
        />
      </BrutalCard>

      <View style={styles.list}>
        {exercises.map((exercise) => {
          const isEditing = editingId === exercise.id;

          return (
            <BrutalCard key={exercise.id} style={styles.exerciseCard}>
              {isEditing ? (
                <>
                  <Text style={styles.cardTitle}>Edit Exercise</Text>
                  <ExerciseForm
                    draft={editDraft}
                    onChange={setEditDraft}
                    onSubmit={() => {
                      void updateExercise(exercise.id, editDraft);
                      stopEditing();
                    }}
                    submitLabel="Save Changes"
                    onCancel={stopEditing}
                  />
                </>
              ) : (
                <>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseHeading}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseGroup}>{exercise.muscleGroup}</Text>
                    </View>
                    <View style={styles.inlineButtons}>
                      <Pressable style={styles.secondaryButton} onPress={() => startEditing(exercise)}>
                        <Text style={styles.secondaryButtonLabel}>Edit</Text>
                      </Pressable>
                      <Pressable style={styles.dangerButton} onPress={() => void deleteExercise(exercise.id)}>
                        <Text style={styles.dangerButtonLabel}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statBlock}>
                      <Text style={styles.statValue}>{exercise.defaultSets}</Text>
                      <Text style={styles.statLabel}>Sets</Text>
                    </View>
                    <View style={styles.statBlock}>
                      <Text style={styles.statValue}>{exercise.defaultReps}</Text>
                      <Text style={styles.statLabel}>Reps</Text>
                    </View>
                    <View style={styles.statBlock}>
                      <Text style={styles.statValue}>{exercise.defaultRestTime}s</Text>
                      <Text style={styles.statLabel}>Rest</Text>
                    </View>
                  </View>
                </>
              )}
            </BrutalCard>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
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
  createCard: {
    gap: 14,
  },
  cardTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    gap: 14,
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
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderColor: palette.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillActive: {
    backgroundColor: palette.text,
  },
  pillLabel: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '600',
  },
  pillLabelActive: {
    color: palette.inverse,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricField: {
    flex: 1,
    gap: 6,
  },
  metricLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: palette.text,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  primaryButtonLabel: {
    color: palette.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryButton: {
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  secondaryButtonLabel: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    gap: 14,
  },
  exerciseCard: {
    gap: 14,
  },
  exerciseHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  exerciseHeading: {
    flex: 1,
    gap: 6,
  },
  exerciseName: {
    color: palette.text,
    fontSize: 22,
    fontWeight: '700',
  },
  exerciseGroup: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  inlineButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  dangerButton: {
    backgroundColor: palette.text,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dangerButtonLabel: {
    color: palette.inverse,
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBlock: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    padding: 12,
  },
  statValue: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
});
