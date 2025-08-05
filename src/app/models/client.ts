// src/app/models/client.ts
import { Doctor } from './doctor';
import { Personal } from './personal';
import { Nutritionist } from './nutritionist';
import { Measure } from './measure';
import { Trainning } from './trainning'; // Corrected import name to 'Training' (capital T)

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: string;
}

export interface Client {
  id?: number; // Long no backend -> number no frontend
  name: string;
  email: string;
  user?: User; // Objeto User do backend
  cpf: string;
  dateOfBirth?: Date | string | number[]; // LocalDateTime no backend -> pode ser array de números [year, month, day, hour, minute]
  phone?: string; // Telefone do cliente
  weight?: number;
  height?: number;
  measure?: Measure; // Objeto Measure completo (ManyToOne no backend)
  hasDoctorAssistance?: boolean;
  hasPersonalAssistance?: boolean;
  hasNutritionistAssistance?: boolean;
  role?: string; // Campo role adicional
  trainings?: Trainning[]; // Lista de treinos (ManyToMany no backend), renomeado para 'trainings'
  doctor?: Doctor; // Objeto Doctor completo (ManyToOne no backend)
  personal?: Personal; // Objeto Personal completo (ManyToOne no backend)
  nutritionist?: Nutritionist; // Objeto Nutritionist completo (ManyToOne no backend)
  evolutionPhotos?: string[]; // Lista de URLs de fotos de evolução (OneToMany no backend)
}
export interface ClientDto {
  id: number;
  name?: string; // Exemplo de propriedade, ajuste conforme seu ClientDto real
  // Adicione outras propriedades de ClientDto que seu backend envia
}
