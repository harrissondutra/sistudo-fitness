import { Bioimpedancia } from './Bioimpedancia';

export interface AnaliseMusculoGordura {
  id?: number;
  bioimpedancia: Bioimpedancia;
  massaMuscularEsqueletica?: number;
  massaGorduraTotal?: number;
}

export interface AnaliseMusculoGorduraDTO {
  id?: number;
  bioimpedanciaId: number;
  massaMuscularEsqueletica?: number;
  massaGorduraTotal?: number;
}
