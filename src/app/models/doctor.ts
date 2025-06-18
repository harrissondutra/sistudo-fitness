export interface Doctor {
  id?: number;
  name: string;
  crm: string;
  specialty: string;
  email: string;
  phone: string;
  clientId: number; // Assuming you'll send/receive the client ID in the interface
}
