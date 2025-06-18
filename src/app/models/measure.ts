// src/app/models/measure.ts
export interface Measure {
  id?: number;
  data?: Date;
  ombro?: number;
  cintura?: number;
  quadril?: number;
  panturrilhaDireita?: number;
  panturrilhaEsquerda?: number;
  bracoDireito?: number;
  bracoEsquerdo?: number;
  coxaDireita?: number;
  coxaEsquerda?: number;
  peitoral?: number;
  abdomem?: number;
  abdominal?: number; // Assuming this is for abdominal skinfold
  suprailiaca?: number;
  subescapular?: number;
  triceps?: number;
  axilar?: number;
  torax?: number;
  clientId?: number; // Changed from userId to clientId for consistency
}
