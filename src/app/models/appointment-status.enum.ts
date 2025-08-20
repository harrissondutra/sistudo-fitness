export enum AppointmentStatus {
  Agendado = 'agendado',
  Atendido = 'atendido',
  Cancelado = 'cancelado',
  Pendente = 'pendente',
  EmAndamento = 'Em andamento'
}

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Agendado]: '#00ac2eff', // Azul padrão
  [AppointmentStatus.Atendido]: '#b1b1b1ff', // Verde
  [AppointmentStatus.Cancelado]: '#e53935', // Vermelho
  [AppointmentStatus.Pendente]: '#fbc02d', // Amarelo
  [AppointmentStatus.EmAndamento]: '#1976d2' // Roxo

};
