export interface Exercise {
  id?: number;
  name: string;
  description?: string;
  category?: ExerciseCategory; // Defina a interface ExerciseCategory conforme seu backend
  videoUrl?: string;
}

// Exemplo de interface para ExerciseCategory (ajuste conforme seu backend)
export interface ExerciseCategory {
  id?: number;
  name: string;
  // outros campos se necessário
}
