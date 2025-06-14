import { Measure } from './measure';
import { Trainning } from './trainning';

export interface User {
  id?: string; // Opcional, pois é gerado pelo backend
  name: string;
  email: string;
  cpf: string;
  weight?: number | null; // Agora permite 'null' explicitamente
  height?: number | null; // Agora permite 'null' explicitamente
  Measures?: Measure[]; // Relacionamento com medidas
  phone?: string;
  birthDate?: Date;
  goal?: string;
  trainings?: Trainning[];
  evolutionPhotos?: EvolutionPhoto[];
}

export interface EvolutionPhoto {
  id?: string;
  url: string;
  date: Date;
  description?: string;
}
