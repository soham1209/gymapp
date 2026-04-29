import { create } from 'zustand';

import { workoutService } from '@/services/workoutService';
import type { Exercise, ExerciseDraft, Weekday, WeeklySchedule, WorkoutPlan } from '@/types/workout';

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

const defaultExercises: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'Chest',
    defaultSets: 4,
    defaultReps: 8,
    defaultRestTime: 90,
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    muscleGroup: 'Back',
    defaultSets: 4,
    defaultReps: 10,
    defaultRestTime: 75,
  },
  {
    id: 'back-squat',
    name: 'Back Squat',
    muscleGroup: 'Legs',
    defaultSets: 5,
    defaultReps: 5,
    defaultRestTime: 120,
  },
  {
    id: 'shoulder-press',
    name: 'Shoulder Press',
    muscleGroup: 'Shoulders',
    defaultSets: 4,
    defaultReps: 8,
    defaultRestTime: 75,
  },
  {
    id: 'rowing-erg',
    name: 'Rowing Erg',
    muscleGroup: 'Cardio',
    defaultSets: 6,
    defaultReps: 500,
    defaultRestTime: 60,
  },
  {
    id: 'hollow-hold',
    name: 'Hollow Hold',
    muscleGroup: 'Core',
    defaultSets: 3,
    defaultReps: 45,
    defaultRestTime: 30,
  },
];

const defaultWorkoutPlans: WorkoutPlan[] = [
  {
    id: 'chest-day',
    name: 'Chest Day',
    exercises: [defaultExercises[0], defaultExercises[3]],
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    exercises: [defaultExercises[1], defaultExercises[4]],
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    exercises: [defaultExercises[2], defaultExercises[5]],
  },
];

const weekdays: Weekday[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const defaultWeeklySchedule: WeeklySchedule[] = weekdays.map((day) => ({
  day,
  items: [],
}));

const demoUserId = 'demo-athlete';

type AppState = {
  athleteName: string;
  streak: number;
  weeklyGoal: number;
  completedSessions: number;
  recoveryMode: boolean;
  workoutBlocks: WorkoutBlock[];
  weeklyStats: WeeklyStat[];
  userId: string;
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  weeklySchedule: WeeklySchedule[];
  plannerReady: boolean;
  plannerStatus: 'idle' | 'loading' | 'saving' | 'error';
  exerciseStatus: 'idle' | 'saving' | 'error';
  toggleWorkoutBlock: (id: string) => void;
  toggleRecoveryMode: () => void;
  initializeWorkoutPlanner: () => Promise<void>;
  addExerciseToDay: (day: Weekday, exerciseId: Exercise['id']) => Promise<void>;
  addWorkoutPlanToDay: (day: Weekday, workoutPlanId: WorkoutPlan['id']) => Promise<void>;
  addExercise: (exercise: ExerciseDraft) => Promise<void>;
  updateExercise: (exerciseId: Exercise['id'], exercise: ExerciseDraft) => Promise<void>;
  deleteExercise: (exerciseId: Exercise['id']) => Promise<void>;
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

function mergeWeeklySchedule(weeklySchedule: WeeklySchedule[]) {
  const scheduleMap = new Map(weeklySchedule.map((entry) => [entry.day, entry]));
  return weekdays.map((day) => scheduleMap.get(day) ?? { day, items: [] });
}

function getUpdatedSchedule(
  weeklySchedule: WeeklySchedule[],
  day: Weekday,
  newItem: WeeklySchedule['items'][number],
) {
  return weeklySchedule.map((entry) =>
    entry.day === day ? { ...entry, items: [...entry.items, newItem] } : entry,
  );
}

function createExerciseId(name: string) {
  return `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
}

function syncPlansWithExercises(workoutPlans: WorkoutPlan[], exercises: Exercise[]) {
  const exerciseMap = new Map(exercises.map((exercise) => [exercise.id, exercise]));

  return workoutPlans
    .map((plan) => ({
      ...plan,
      exercises: plan.exercises
        .map((exercise) => exerciseMap.get(exercise.id))
        .filter((exercise): exercise is Exercise => Boolean(exercise)),
    }))
    .filter((plan) => plan.exercises.length > 0);
}

export const useAppStore = create<AppState>((set, get) => ({
  athleteName: 'Soham',
  streak: 8,
  weeklyGoal: 6,
  completedSessions: 2,
  recoveryMode: false,
  workoutBlocks: initialBlocks,
  weeklyStats: initialWeeklyStats,
  userId: demoUserId,
  exercises: defaultExercises,
  workoutPlans: defaultWorkoutPlans,
  weeklySchedule: defaultWeeklySchedule,
  plannerReady: false,
  plannerStatus: 'idle',
  exerciseStatus: 'idle',
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
  initializeWorkoutPlanner: async () => {
    if (get().plannerReady || get().plannerStatus === 'loading') {
      return;
    }

    set({ plannerStatus: 'loading' });

    try {
      const { userId } = get();
      const userData = await workoutService.fetchUserData(userId);
      const exercises = userData.exercises.length > 0 ? userData.exercises : defaultExercises;
      const workoutPlans =
        syncPlansWithExercises(
          userData.workoutPlans.length > 0 ? userData.workoutPlans : defaultWorkoutPlans,
          exercises,
        );
      const weeklySchedule = mergeWeeklySchedule(
        userData.weeklySchedule.length > 0 ? userData.weeklySchedule : defaultWeeklySchedule,
      );

      set({
        exercises,
        workoutPlans,
        weeklySchedule,
        plannerReady: true,
        plannerStatus: 'idle',
      });
    } catch {
      set({
        plannerReady: true,
        plannerStatus: 'error',
      });
    }
  },
  addExerciseToDay: async (day, exerciseId) => {
    const { userId, weeklySchedule } = get();
    const updatedSchedule = getUpdatedSchedule(weeklySchedule, day, {
      type: 'exercise',
      exerciseId,
    });

    set({
      weeklySchedule: updatedSchedule,
      plannerStatus: 'saving',
    });

    try {
      await workoutService.saveWeeklySchedule(userId, updatedSchedule);
      set({ plannerStatus: 'idle' });
    } catch {
      set({ plannerStatus: 'error' });
    }
  },
  addWorkoutPlanToDay: async (day, workoutPlanId) => {
    const { userId, weeklySchedule } = get();
    const updatedSchedule = getUpdatedSchedule(weeklySchedule, day, {
      type: 'workoutPlan',
      workoutPlanId,
    });

    set({
      weeklySchedule: updatedSchedule,
      plannerStatus: 'saving',
    });

    try {
      await workoutService.saveWeeklySchedule(userId, updatedSchedule);
      set({ plannerStatus: 'idle' });
    } catch {
      set({ plannerStatus: 'error' });
    }
  },
  addExercise: async (exerciseDraft) => {
    const { userId, exercises } = get();
    const nextExercise: Exercise = {
      id: createExerciseId(exerciseDraft.name),
      ...exerciseDraft,
    };
    const updatedExercises = [...exercises, nextExercise];

    set({
      exercises: updatedExercises,
      exerciseStatus: 'saving',
    });

    try {
      await workoutService.saveExercises(userId, updatedExercises);
      set({ exerciseStatus: 'idle' });
    } catch {
      set({ exerciseStatus: 'error' });
    }
  },
  updateExercise: async (exerciseId, exerciseDraft) => {
    const { userId, exercises, workoutPlans } = get();
    const updatedExercises = exercises.map((exercise) =>
      exercise.id === exerciseId ? { ...exercise, ...exerciseDraft } : exercise,
    );
    const updatedWorkoutPlans = syncPlansWithExercises(workoutPlans, updatedExercises);

    set({
      exercises: updatedExercises,
      workoutPlans: updatedWorkoutPlans,
      exerciseStatus: 'saving',
    });

    try {
      await Promise.all([
        workoutService.saveExercises(userId, updatedExercises),
        workoutService.saveWorkoutPlans(userId, updatedWorkoutPlans),
      ]);
      set({ exerciseStatus: 'idle' });
    } catch {
      set({ exerciseStatus: 'error' });
    }
  },
  deleteExercise: async (exerciseId) => {
    const { userId, exercises, workoutPlans, weeklySchedule } = get();
    const updatedExercises = exercises.filter((exercise) => exercise.id !== exerciseId);
    const updatedWorkoutPlans = syncPlansWithExercises(workoutPlans, updatedExercises);
    const updatedWeeklySchedule = weeklySchedule.map((day) => ({
      ...day,
      items: day.items.filter((item) => {
        if (item.type === 'exercise') {
          return item.exerciseId !== exerciseId;
        }

        return updatedWorkoutPlans.some((plan) => plan.id === item.workoutPlanId);
      }),
    }));

    set({
      exercises: updatedExercises,
      workoutPlans: updatedWorkoutPlans,
      weeklySchedule: updatedWeeklySchedule,
      exerciseStatus: 'saving',
    });

    try {
      await Promise.all([
        workoutService.saveExercises(userId, updatedExercises),
        workoutService.saveWorkoutPlans(userId, updatedWorkoutPlans),
        workoutService.saveWeeklySchedule(userId, updatedWeeklySchedule),
      ]);
      set({ exerciseStatus: 'idle' });
    } catch {
      set({ exerciseStatus: 'error' });
    }
  },
}));
