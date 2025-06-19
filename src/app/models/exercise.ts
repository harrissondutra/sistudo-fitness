// No arquivo: ../../models/exercise.ts
export interface Exercise {
  id?: number;
  name: string;
  description?: string;
  // Mude de 'category: { id?: number; name?: string; };' para:
  categoryId: number; // O backend espera um ID de categoria diretamente
  videoUrl?: string;
}

// Suas outras interfaces (ExerciseCategory) permanecem as mesmas
export interface ExerciseCategory {
  id?: number;
  name: string;
  description?: string;
}

export interface ExerciseDto {
  id: number;
  name?: string;
  description?: string;
  // Adicione outras propriedades de ExerciseDto que seu backend envia
}
