import { Client } from './client';
import { ComposicaoCorporal } from './ComposicaoCorporal';
import { AnaliseMusculoGordura } from './AnaliseMusculoGordura';
import { MassaMagraSegmentar } from './MassaMagraSegmentar';
import { GorduraSegmentar } from './GorduraSegmentar';

export interface Bioimpedancia {
  id?: number;
  client: Client;
  dataMedicao?: Date | string;
  pontuacaoInbody?: number;
  pesoAtual?: number;
  pesoIdeal?: number;
  controlePeso?: number;
  controleGordura?: number;
  controleMuscular?: number;
  imc?: number;
  pgc?: number;
  relacaoCinturaQuadril?: number;
  nivelGorduraVisceral?: number;
  massaLivreGordura?: number;
  tmb?: number;
  grauObesidade?: number;
  smi?: number;
  ingestaoCaloricaRecomendada?: number;
  composicaoCorporal?: ComposicaoCorporal;
  analiseMusculoGordura?: AnaliseMusculoGordura;
  massaMagraSegmentar?: MassaMagraSegmentar;
  gorduraSegmentar?: GorduraSegmentar;
}

export interface BioimpedanciaDTO {
  id?: number;
  clientId: number;
  dataMedicao?: string;
  pontuacaoInbody?: number;
  pesoAtual?: number;
  pesoIdeal?: number;
  controlePeso?: number;
  controleGordura?: number;
  controleMuscular?: number;
  imc?: number;
  pgc?: number;
  relacaoCinturaQuadril?: number;
  nivelGorduraVisceral?: number;
  massaLivreGordura?: number;
  tmb?: number;
  grauObesidade?: number;
  smi?: number;
  ingestaoCaloricaRecomendada?: number;
  composicaoCorporal?: ComposicaoCorporal;
  analiseMusculoGordura?: AnaliseMusculoGordura;
  massaMagraSegmentar?: MassaMagraSegmentar;
  gorduraSegmentar?: GorduraSegmentar;
}
