import { Client } from './client';

export interface Nutritionist {
  id?: number;
  name: string;
  email: string;
  phone: string;
  registry: string;  // CRN (Conselho Regional de Nutricionistas)
  specialty: string;
  clients?: Client[];
}
