import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TextFieldModule } from '@angular/cdk/text-field';
import { Appointment } from '../../models/appointment';
import { AppointmentStatus, APPOINTMENT_STATUS_COLORS } from '../../models/appointment-status.enum';
import { ServiceType, SERVICE_TYPE_OPTIONS } from '../../models/service-type.enum';
import moment from 'moment';

export interface AppointmentDialogData {
  appointment?: Appointment;
  isNew: boolean;
  selectedDate?: Date;
  selectedEndDate?: Date;
}

@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTimepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TextFieldModule
  ],
  templateUrl: './appointment-dialog.component.html',
  styleUrl: './appointment-dialog.component.scss'
})
export class AppointmentDialogComponent implements OnInit {
  appointment: Appointment = {
    name: '',
    dateTime: new Date().toISOString()
  };
  
  // Campos separados para data e hora - completamente independentes
  startDate: Date = new Date();
  startTime: Date = new Date(); // Para MatTimepicker
  endDate: Date = new Date();
  endTime: Date = new Date();   // Para MatTimepicker
  
  // Propriedades auxiliares para conversão
  get startTimeString(): string {
    const result = this.dateToTimeString(this.startTime);
    console.log('startTimeString getter:', this.startTime, '→', result);
    return result;
  }
  
  set startTimeString(value: string) {
    console.log('startTimeString setter:', value);
    this.startTime = this.timeStringToDate(value, this.startTime);
    console.log('startTime after set:', this.startTime);
    // Force change detection
    this.onTimeChange();
  }
  
  get endTimeString(): string {
    const result = this.dateToTimeString(this.endTime);
    console.log('endTimeString getter:', this.endTime, '→', result);
    return result;
  }
  
  set endTimeString(value: string) {
    console.log('endTimeString setter:', value);
    this.endTime = this.timeStringToDate(value, this.endTime);
    console.log('endTime after set:', this.endTime);
    // Force change detection
    this.onTimeChange();
  }

  appointmentStatuses = Object.values(AppointmentStatus);
  serviceTypes = SERVICE_TYPE_OPTIONS;

  constructor(
    public dialogRef: MatDialogRef<AppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentDialogData,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    console.log('Dialog initialized with data:', this.data);
    
    if (this.data.isNew) {
      this.initializeNewAppointment();
    } else {
      this.initializeExistingAppointment();
    }

    // Debug: log the final state after initialization
    setTimeout(() => {
      console.log('After initialization - HTML binding check:', {
        startDate: this.startDate,
        startTime: this.startTime,
        endDate: this.endDate,
        endTime: this.endTime,
        appointment: this.appointment
      });
    }, 100);
  }

  private initializeNewAppointment(): void {
    this.appointment = {
      name: '',
      service: '',
      status: AppointmentStatus.Agendado,
      description: '',
      dateTime: new Date().toISOString()
    };

    if (this.data.selectedDate) {
      this.startDate = this.ensureValidDate(this.data.selectedDate);
      this.startTime = new Date(this.data.selectedDate);
    } else {
      this.startDate = new Date();
      this.startTime = this.timeStringToDate('09:00');
    }

    if (this.data.selectedEndDate) {
      this.endDate = this.ensureValidDate(this.data.selectedEndDate);
      this.endTime = new Date(this.data.selectedEndDate);
    } else {
      // Default: same day, 1 hour later
      this.endDate = new Date(this.startDate);
      const endTimeDate = new Date(this.startTime);
      endTimeDate.setHours(endTimeDate.getHours() + 1);
      this.endTime = endTimeDate;
    }

    console.log('New appointment initialized:', {
      startDate: this.startDate,
      startTime: this.startTime,
      startTimeString: this.startTimeString,
      endDate: this.endDate,
      endTime: this.endTime,
      endTimeString: this.endTimeString
    });
  }

  private initializeExistingAppointment(): void {
    this.appointment = { ...this.data.appointment! };
    
    console.log('Initializing existing appointment:', this.data.appointment);
    
    // Parse start date/time
    let startDateTime: Date;
    if (this.appointment.dateTime) {
      if (Array.isArray(this.appointment.dateTime)) {
        // Backend returns array [year, month, day, hour, minute]
        const [year, month, day, hour, minute] = this.appointment.dateTime;
        startDateTime = new Date(year, month - 1, day, hour, minute);
      } else {
        startDateTime = new Date(this.appointment.dateTime);
      }
      
      startDateTime = this.ensureValidDate(startDateTime, new Date());
    } else {
      startDateTime = new Date();
    }

    // Separate date and time for start
    this.startDate = this.ensureValidDate(startDateTime);
    this.startTime = new Date(startDateTime);

    // Parse end date/time
    let endDateTime: Date;
    if (this.appointment.endDate) {
      if (Array.isArray(this.appointment.endDate)) {
        // Backend returns array [year, month, day, hour, minute]
        const [year, month, day, hour, minute] = this.appointment.endDate;
        endDateTime = new Date(year, month - 1, day, hour, minute);
      } else {
        endDateTime = new Date(this.appointment.endDate);
      }
      
      endDateTime = this.ensureValidDate(endDateTime, new Date(startDateTime.getTime() + 60 * 60 * 1000));
    } else {
      // Se não tem endDate, calcula baseado no startDateTime + 1 hora
      endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + 1);
    }

    // Separate date and time for end
    this.endDate = this.ensureValidDate(endDateTime);
    this.endTime = new Date(endDateTime);
    
    console.log('Final dialog state:', {
      appointment: this.appointment,
      startDate: this.startDate,
      startTime: this.startTime,
      startTimeString: this.startTimeString,
      endDate: this.endDate,
      endTime: this.endTime,
      endTimeString: this.endTimeString
    });
  }

  private formatDateTimeForBackend(date: Date): string {
    // Validate input
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date provided to formatDateTimeForBackend:', date);
      return new Date().toISOString();
    }
    
    // Format as local datetime string for backend (YYYY-MM-DDTHH:mm)
    const pad = (n: number) => n.toString().padStart(2, '0');
    const localDateTime = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    
    console.log('Formatted date for backend:', date, '→', localDateTime);
    return localDateTime;
  }

  private combineDateAndTime(date: Date, timeString: string): Date {
    // Validate date input
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date parameter:', date);
      date = new Date();
    }
    
    // Parse time string (format: HH:mm)
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Invalid time string:', timeString);
      return date;
    }

    // Combine date with time
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  private dateToTimeString(date: any): string {
    // Handle Moment objects
    if (date && typeof date === 'object' && date._isAMomentObject) {
      const momentDate = date.toDate(); // Convert Moment to Date
      const hours = momentDate.getHours().toString().padStart(2, '0');
      const minutes = momentDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // Handle Date objects
    if (date instanceof Date && !isNaN(date.getTime())) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    return '09:00';
  }

  private timeStringToDate(timeString: string, referenceDate?: Date): Date {
    // Parse time string (format: HH:mm)
    if (!timeString || typeof timeString !== 'string') {
      console.error('Invalid time string provided:', timeString);
      return referenceDate || new Date();
    }

    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.error('Invalid time string format:', timeString);
      return referenceDate || new Date();
    }

    // Create a Date object with today's date but the specified time
    const result = new Date();
    result.setHours(hours, minutes, 0, 0);
    
    console.log('timeStringToDate:', timeString, '→', result);
    return result;
  }

  private ensureValidDate(value: any, fallback: Date = new Date()): Date {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    console.warn('Invalid date value, using fallback:', value);
    return fallback;
  }

  getStatusColor(status: AppointmentStatus): string {
    return APPOINTMENT_STATUS_COLORS[status] || '#000000';
  }

  getStatusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.Agendado]: 'Agendado',
      [AppointmentStatus.Atendido]: 'Atendido',
      [AppointmentStatus.Cancelado]: 'Cancelado',
      [AppointmentStatus.Pendente]: 'Pendente',
      [AppointmentStatus.EmAndamento]: 'Em Andamento'
    };
    return labels[status] || status;
  }

  // Método para detectar mudanças nos campos de horário
  onTimeChange(): void {
    console.log('Time changed - triggering validation');
    // Forçar detecção de mudanças para o botão de salvar
    setTimeout(() => {
      console.log('Current form validity:', this.isFormValid());
    }, 0);
  }

  isFormValid(): boolean {
    // Helper function to check if a value is a valid Date or Moment
    const isValidDate = (date: any): boolean => {
      // Check for Moment objects
      if (date && typeof date === 'object' && date._isAMomentObject) {
        return date.isValid();
      }
      // Check for Date objects
      return date instanceof Date && !isNaN(date.getTime());
    };

    const validation = {
      name: !!this.appointment.name,
      service: !!this.appointment.service,
      startDate: this.startDate && isValidDate(this.startDate),
      startTime: this.startTime && isValidDate(this.startTime),
      endDate: this.endDate && isValidDate(this.endDate),
      endTime: this.endTime && isValidDate(this.endTime)
    };

    const isValid = validation.name && validation.service && validation.startDate && 
                   validation.startTime && validation.endDate && validation.endTime;

    // Debug logging
    console.log('Form validation:', {
      validation,
      isValid,
      startTime: this.startTime,
      endTime: this.endTime,
      startTimeString: this.startTimeString,
      endTimeString: this.endTimeString,
      startTimeType: typeof this.startTime,
      endTimeType: typeof this.endTime
    });

    return isValid;
  }

  onSave(): void {
    if (!this.isFormValid()) {
      this.snackBar.open('Preencha todos os campos obrigatórios', 'Fechar', {
        duration: 3000
      });
      return;
    }

    // Ensure all date fields are valid Date objects
    if (!(this.startDate instanceof Date)) {
      this.startDate = new Date(this.startDate);
    }
    if (!(this.endDate instanceof Date)) {
      this.endDate = new Date(this.endDate);
    }

    // Combine date and time fields into LocalDateTime
    const startDateTime = this.combineDateAndTime(this.startDate, this.startTimeString);
    const endDateTime = this.combineDateAndTime(this.endDate, this.endTimeString);

    // Format dates for backend
    this.appointment.dateTime = this.formatDateTimeForBackend(startDateTime);
    this.appointment.endDate = this.formatDateTimeForBackend(endDateTime);

    // Prepare appointment object for backend
    const appointmentToSave: Appointment = {
      ...this.appointment
    };

    // Para edição, garantir que o ID está correto
    if (!this.data.isNew) {
      appointmentToSave.id = this.data.appointment?.id || this.appointment.id;
      console.log('Editing appointment with ID:', appointmentToSave.id);
      
      // Validação adicional do ID
      if (!appointmentToSave.id || isNaN(Number(appointmentToSave.id))) {
        console.error('Invalid appointment ID:', appointmentToSave.id);
        this.snackBar.open('Erro: ID do agendamento inválido', 'Fechar', { duration: 3000 });
        return;
      }
    } else {
      // Para criação, remover o ID
      delete appointmentToSave.id;
    }

    // Remove campos de compatibilidade do calendário antes de enviar para o backend
    delete appointmentToSave.start;
    delete appointmentToSave.end;

    console.log('Appointment to save:', appointmentToSave);
    console.log('Combined start DateTime:', startDateTime);
    console.log('Combined end DateTime:', endDateTime);

    this.dialogRef.close({
      action: 'save',
      appointment: appointmentToSave
    });
  }

  onDelete(): void {
    this.dialogRef.close({
      action: 'delete',
      appointment: this.appointment
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
