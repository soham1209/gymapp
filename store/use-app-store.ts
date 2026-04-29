import { create } from 'zustand';

type WorkoutBlock = {
  id: string;
  label: string;
  focus: string;
  duration: string;
  done: boolean;
};

type WeeklyStat = {
  label: string;
  value: string;
};

type AppState = {
  athleteName: string;
  streak: number;
  weeklyGoal: number;
  completedSessions: number;
  recoveryMode: boolean;
  workoutBlocks: WorkoutBlock[];
  weeklyStats: WeeklyStat[];
  toggleWorkoutBlock: (id: string) => void;
  toggleRecoveryMode: () => void;
};

const initialBlocks: WorkoutBlock[] = [
  { id: 'lift', label: 'Morning Lift', focus: 'Lower body strength', duration: '45 min', done: true },
  { id: 'skill', label: 'Skill Work', focus: 'Clean movement patterns', duration: '18 min', done: true },
  { id: 'zone2', label: 'Zone 2 Cardio', focus: 'Endurance base', duration: '30 min', done: false },
  { id: 'mobility', label: 'Mobility Reset', focus: 'Hips and ankles', duration: '12 min', done: false },
];

const initialWeeklyStats: WeeklyStat[] = [
  { label: 'Workouts', value: '04 / 06' },
  { label: 'Volume', value: '12.4K KG' },
  { label: 'Sleep', value: '7.8 HRS' },
];

export const useAppStore = create<AppState>((set) => ({
  athleteName: 'Soham',
  streak: 8,
  weeklyGoal: 6,
  completedSessions: 2,
  recoveryMode: false,
  workoutBlocks: initialBlocks,
  weeklyStats: initialWeeklyStats,
  toggleWorkoutBlock: (id) =>
    set((state) => {
      const workoutBlocks = state.workoutBlocks.map((block) =>
        block.id === id ? { ...block, done: !block.done } : block,
      );
      const completedSessions = workoutBlocks.filter((block) => block.done).length;

      return {
        workoutBlocks,
        completedSessions,
      };
    }),
  toggleRecoveryMode: () =>
    set((state) => ({
      recoveryMode: !state.recoveryMode,
    })),
}));
