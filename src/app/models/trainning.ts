import { Exercise } from './exercise';

export interface Trainning {
  id?: number;
  name: string;
  exercises: Exercise[];
  userId: number;   // Agora é apenas o ID do Cliente
  active: boolean;
  category: string;
  startDate?: Date; // Data de início do treino
  endDate?: Date;   // Data de término do treino
}
