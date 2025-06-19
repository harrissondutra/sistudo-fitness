import { ExerciseDto } from './exercise';
import { ClientDto } from './client';
import { TrainningCategoryDto } from './trainning-category'; // Nova importação

export interface Trainning {
  id?: number;
  name: string;
  description?: string;
  exercises: ExerciseDto[];
  client: ClientDto;
  active: boolean;
  categories: TrainningCategoryDto[]; // Ajustado para lista de TrainningCategoryDto
  // Removendo startDate e endDate daqui, pois não estão no DTO do backend
  // Se forem adicionados ao backend no futuro, inclua-os novamente aqui.
  startDate?: Date; // Opcional, se necessário
  endDate?: Date; // Opcional, se necessário
}

