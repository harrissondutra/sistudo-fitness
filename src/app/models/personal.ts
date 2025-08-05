export interface Personal {
  id?: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  registry: string; // Registro profissional do personal trainer
  clients?: any[]; // Lista de clientes associados (opcional para exibição)
  gymPersonals?: any[]; // Lista de academias associadas (opcional para exibição)
  // Campos herdados de EntityBase
  createdAt?: string;
  updatedAt?: string;
}
