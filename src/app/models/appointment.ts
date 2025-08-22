export interface Appointment {
  id?: number;
  clientId?: number | null;
  name: string;
  phone?: string | null;
  dateTime: string; // ISO string (LocalDateTime)
  endDate?: string | null; // ISO string (LocalDateTime)
  start?: Date; // For calendar compatibility
  end?: Date; // For calendar compatibility
  description?: string | null;
  status?: string | null;
  service?: string | null;
}
