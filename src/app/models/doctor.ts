export interface Doctor {
  id?: number;
  name: string;
  crm: string;
  specialty: string;
  email: string;
  phone: string;
  clientId?: number; // Para compatibilidade com API antiga
  clients?: Client[]; // Array de clientes vinculados
  clientIds?: number[]; // Array de IDs dos clientes
}

// Importação do modelo Client
export interface Client {
  id?: number;
  name: string;
  email: string;
}
