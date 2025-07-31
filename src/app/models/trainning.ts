import { ExerciseDto } from './exercise';
import { ClientDto } from './client';
import { TrainningCategoryDto } from './trainning-category'; // Nova importação

// Defina o tipo WeekDay como uma enumeração ou tipo de string
export type WeekDay = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';

// Atualização para o modelo Trainning
// Em models/trainning.ts
export interface Trainning {
  id?: number;
  name: string;
  description?: string;
  exercises: ExerciseDto[];
  client: ClientDto;
  active: boolean;
  categories: TrainningCategoryDto[];
  // Atualizado para aceitar arrays
  startDate?: Date | null;
  endDate?: Date | null;
  weekFrequency?: WeekDay[];
}

