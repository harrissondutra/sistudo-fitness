export interface Nutritionist {
  id?: number;
  name: string;
  email: string;
  phone: string;
  registry: string;
  clientId?: number; // Optional, as it's nullable in the backend
}
