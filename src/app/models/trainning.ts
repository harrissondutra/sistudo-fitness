import { Exercise } from './exercise';

export interface Trainning {
  id?: number;
  name: string;
  exercises: Exercise[];
  clientId: number;   // Agora é apenas o ID do Cliente
  active: boolean;
  category: string;
  startDate?: string | Date; // Data de início do treino
  endDate?: string | Date;   // Data de término do treino
}
