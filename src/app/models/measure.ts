export interface Measure {
  id?: number;
  data?: Date | string; // Campo para data da medição (não presente no backend)

  // Campos exatamente como definidos no backend
  ombro?: number;
  cintura?: number;
  quadril?: number;
  panturrilha_direita?: number;
  panturrilha_esquerda?: number;
  braco_direito?: number;      // Usando string literal para o caractere especial
  braco_esquerdo?: number;     // Usando string literal para o caractere especial
  coxa_direita?: number;
  coxa_esquerda?: number;
  peitoral?: number;
  abdomem?: number;
  abdominal?: number;
  suprailiaca?: number;
  subescapular?: number;
  triceps?: number;
  axilar?: number;
  torax?: number;
}
