import { Exercise } from './exercise';

export interface Trainning {
  id?: number; // Opcional, pois é gerado pelo backend
  name: string;
  exercises: Exercise[]; // Lista de exercícios
  userId: number; // ID do usuário associado ao treino
  active: boolean; // Indica se o treino está ativo ou não
}
