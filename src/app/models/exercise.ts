// Modelo principal de exercício
export interface Exercise {
  id?: number;
  name: string;
  description?: string;
  categoryId: number;
  category?: ExerciseCategory; // Referência à categoria (útil para exibição)
  videoUrl?: string;
  // Campos adicionais que podem ser necessários
  image?: string;
  instructions?: string;
  difficultyLevel?: string;
  equipment?: string[];
}

// Modelo de categoria de exercício
export interface ExerciseCategory {
  id?: number;
  name: string;
  description?: string;
  exerciseCount?: number; // Útil para UI
}

// Data Transfer Object - usado para API
export interface ExerciseDto {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  videoUrl?: string;
  sets?: number;
  repetitions?: number;
  weight?: number;
  rest?: number; // Tempo de descanso em segundos
  order?: number; // Ordem no treino
  trainningId?: number; // Relacionamento com treino
}

// Interface para exercício no contexto de um treino
export interface TrainningExercise extends Exercise {
  sets?: number;
  repetitions?: number;
  weight?: number;
  rest?: number;
  order?: number;
  notes?: string;
}
