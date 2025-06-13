import { Measure } from './measure';
export interface User {
  id?: number; // Opcional, pois é gerado pelo backend
  name: string;
  email: string;
  cpf: string;
  weight?: number | null; // Agora permite 'null' explicitamente
  height?: number | null; // Agora permite 'null' explicitamente
  Measures?: Measure[]; // Relacionamento com medidas
}
