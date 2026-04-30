import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrutalCard } from '@/components/ui/brutal-card';
import { SectionTitle } from '@/components/ui/section-title';
import { StatChip } from '@/components/ui/stat-chip';
import { useAppStore } from '@/store/use-app-store';
import { palette } from '@/utils/theme';

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function WorkoutTimerPanel() {
  const {
    timer,
    tickTimer,
    startWorkoutTimer,
    pauseWorkoutTimer,
    startRestTimer,
    stopRestTimer,
    completeSet,
    resetWorkoutSession,
  } = useAppStore();

  useEffect(() => {
    if (!timer.isWorkoutRunning && !timer.isRestRunning) {
      return;
    }

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [tickTimer, timer.isRestRunning, timer.isWorkoutRunning]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <SectionTitle>Timer System</SectionTitle>
        <Text style={styles.statusText}>
          {timer.isWorkoutRunning
            ? 'Workout Running'
            : timer.isRestRunning
              ? timer.restContext === 'exercise'
                ? 'Exercise Rest'
                : 'Set Rest'
              : 'Idle'}
        </Text>
      </View>

      <BrutalCard style={styles.primaryCard}>
        <View style={styles.timerRow}>
          <View style={styles.timerBlock}>
            <Text style={styles.timerLabel}>Workout Timer</Text>
            <Text style={styles.timerValue}>{formatSeconds(timer.workoutTime)}</Text>
          </View>
          <View style={styles.timerBlock}>
            <Text style={styles.timerLabel}>Rest Timer</Text>
            <Text style={styles.timerValue}>{formatSeconds(timer.restTime)}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.primaryButton, timer.isWorkoutRunning && styles.primaryButtonActive]}
            onPress={() => {
              if (timer.isWorkoutRunning) {
                pauseWorkoutTimer();
                return;
              }

              startWorkoutTimer();
            }}>
            <Text style={styles.primaryButtonLabel}>
              {timer.isWorkoutRunning ? 'Pause Workout' : 'Start Workout'}
            </Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={resetWorkoutSession}>
            <Text style={styles.secondaryButtonLabel}>Reset Session</Text>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryButton} onPress={() => startRestTimer('set')}>
            <Text style={styles.secondaryButtonLabel}>Set Rest</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => startRestTimer('exercise')}>
            <Text style={styles.secondaryButtonLabel}>Exercise Rest</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={stopRestTimer}>
            <Text style={styles.secondaryButtonLabel}>Stop Rest</Text>
          </Pressable>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.primaryButton} onPress={completeSet}>
            <Text style={styles.primaryButtonLabel}>Log Set Time</Text>
          </Pressable>
        </View>
      </BrutalCard>

      <View style={styles.statsRow}>
        <StatChip label="Current Set" value={formatSeconds(timer.currentSetTime)} />
        <StatChip label="Total Workout" value={formatSeconds(timer.totalWorkoutTime)} />
        <StatChip label="Sets Logged" value={`${timer.setDurations.length}`} />
      </View>

      {timer.setDurations.length > 0 ? (
        <BrutalCard style={styles.setsCard}>
          <Text style={styles.setsTitle}>Set Times</Text>
          <View style={styles.setsList}>
            {timer.setDurations.map((duration, index) => (
              <View key={`${duration}-${index}`} style={styles.setRow}>
                <Text style={styles.setRowLabel}>Set {index + 1}</Text>
                <Text style={styles.setRowValue}>{formatSeconds(duration)}</Text>
              </View>
            ))}
          </View>
        </BrutalCard>
      ) : null}
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
  primaryCard: {
    gap: 16,
  },
  timerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timerBlock: {
    backgroundColor: palette.elevated,
    borderColor: palette.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    padding: 14,
  },
  timerLabel: {
    color: palette.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  timerValue: {
    color: palette.text,
    fontSize: 34,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: palette.text,
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonActive: {
    backgroundColor: '#d9d9d9',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonLabel: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  setsCard: {
    gap: 12,
  },
  setsTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
  },
  setsList: {
    gap: 10,
  },
  setRow: {
    alignItems: 'center',
    borderColor: palette.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  setRowLabel: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  setRowValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
