export type Equipment = 'Full Gym' | 'Dumbbells' | 'Bodyweight';

export type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core';

export type TimeOption = 15 | 30 | 45 | 60;

export interface Exercise {
  name: string;
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  formGuidance: string;
  equipment: string;
  visualTag: string;
}

export interface WorkoutPlan {
  id: string;
  timestamp: number;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
  durationMinutes: number;
  exercises: Exercise[];
  estimatedCalories: number;
}

export type AppView =
  | 'LANDING'
  | 'LOGIN'
  | 'DASHBOARD'
  | 'SETUP_EQUIPMENT'
  | 'SETUP_MUSCLES'
  | 'SETUP_TIME'
  | 'GENERATING'
  | 'SESSION'
  | 'HISTORY';