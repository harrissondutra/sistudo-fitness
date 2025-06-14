export interface Training {
  id?: string;
  startDate: Date;
  endDate?: Date;
  goal: string;
  frequency: number;
  exercises?: Exercise[];
}

export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
} 