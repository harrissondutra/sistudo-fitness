export interface Appointment {
  id?: number;
  clientId?: number | null;
  name: string;
  phone?: string | null;
  dateTime: string; // ISO string (LocalDateTime)
  endDate?: string | null; // ISO string (LocalDateTime)
  description?: string | null;
  service?: string | null;
}
