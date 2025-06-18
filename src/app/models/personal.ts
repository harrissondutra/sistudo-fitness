export interface Personal {
  id?: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  registry: string;
  clientId?: number; // Optional, as it's nullable in the backend
}
