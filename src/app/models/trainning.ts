import { Exercise } from './exercise';

export interface Trainning {
  id?: number;
  name: string;
  exercises: Exercise[];
  userId: number;   // Agora é apenas o ID do Cliente
  active: boolean;
}
