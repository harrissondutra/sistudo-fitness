import { Bioimpedancia } from './Bioimpedancia';

export interface ComposicaoCorporal {
  id?: number;
  bioimpedancia: Bioimpedancia;
  aguaCorporal?: number;
  proteina?: number;
  minerais?: number;
  massaGordura?: number;
}

export interface ComposicaoCorporalDTO {
  id?: number;
  bioimpedanciaId: number;
  aguaCorporal?: number;
  proteina?: number;
  minerais?: number;
  massaGordura?: number;
}
