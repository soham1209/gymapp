export type EntityId = string;

export type Weekday =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Legs'
  | 'Shoulders'
  | 'Arms'
  | 'Core'
  | 'Full Body'
  | 'Cardio'
  | 'Other';

export interface DurationWindow {
  workoutTime: number;
  restTime: number;
}

export interface ExerciseDefaults {
  defaultSets: number;
  defaultReps: number;
  defaultRestTime: number;
}

export interface Exercise extends ExerciseDefaults {
  id: EntityId;
  name: string;
  muscleGroup: MuscleGroup;
}

export interface ExerciseDraft extends ExerciseDefaults {
  name: string;
  muscleGroup: MuscleGroup;
}

export interface WorkoutPlan {
  id: EntityId;
  name: string;
  exercises: Exercise[];
}

export interface WeeklyScheduleExerciseItem {
  type: 'exercise';
  exerciseId: Exercise['id'];
}

export interface WeeklyScheduleWorkoutPlanItem {
  type: 'workoutPlan';
  workoutPlanId: WorkoutPlan['id'];
}

export type WeeklyScheduleItem = WeeklyScheduleExerciseItem | WeeklyScheduleWorkoutPlanItem;

export interface WeeklySchedule {
  day: Weekday;
  items: WeeklyScheduleItem[];
}

export interface LoggedSet {
  setNumber: number;
  reps: number;
  weight: number;
  duration: DurationWindow;
}

export interface LoggedExercise {
  exerciseId: Exercise['id'];
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: EntityId;
  date: string;
  day: Weekday;
  exercises: LoggedExercise[];
}

export interface TimerState extends DurationWindow {
  isWorkoutRunning: boolean;
  isRestRunning: boolean;
}

export interface UserWorkoutData {
  exercises: Exercise[];
  workoutPlans: WorkoutPlan[];
  weeklySchedule: WeeklySchedule[];
  workoutLogs: WorkoutLog[];
}
