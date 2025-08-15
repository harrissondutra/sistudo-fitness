import { Bioimpedancia } from './Bioimpedancia';

export interface GorduraSegmentar {
  id?: number;
  bioimpedancia: Bioimpedancia;
  bracoEsquerdo?: number;
  bracoEsquerdoPct?: number;
  bracoDireito?: number;
  bracoDireitoPct?: number;
  tronco?: number;
  troncoPct?: number;
  pernaEsquerda?: number;
  pernaEsquerdaPct?: number;
  pernaDireita?: number;
  pernaDireitaPct?: number;
}

export interface GorduraSegmentarDTO {
  id?: number;
  bioimpedanciaId: number;
  bracoEsquerdo?: number;
  bracoEsquerdoPct?: number;
  bracoDireito?: number;
  bracoDireitoPct?: number;
  tronco?: number;
  troncoPct?: number;
  pernaEsquerda?: number;
  pernaEsquerdaPct?: number;
  pernaDireita?: number;
  pernaDireitaPct?: number;
}
