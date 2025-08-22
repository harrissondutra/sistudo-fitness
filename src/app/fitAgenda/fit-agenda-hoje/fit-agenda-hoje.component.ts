import { Component, OnInit, OnDestroy } from '@angular/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { FitAgendaService } from '../../../app/services/fit-agenda-service/fit-agenda.service';
import { Appointment } from '../../models/appointment';
import { AppointmentStatus, APPOINTMENT_STATUS_COLORS } from '../../models/appointment-status.enum';
import { AppointmentDialogComponent, AppointmentDialogData } from '../appointment-dialog/appointment-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-fit-agenda-hoje',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './fit-agenda-hoje.component.html',
  styleUrl: './fit-agenda-hoje.component.scss',
})
export class FitAgendaHojeComponent implements OnInit, OnDestroy {
  today: Date = new Date();
  isLoading = true;
  eventCount = 0;
  freeSlots = 0;

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridDay',
    locale: ptBrLocale,
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,timeGridWeek',
    },
    nowIndicator: true,
    selectable: true,
    height: 'auto',
    events: [],
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDisplay: 'block',
    eventColor: '#1976d2'
  };

  private unsubscribe$ = new Subject<void>();

  constructor(
    private agendaService: FitAgendaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('FitAgendaHojeComponent initialized');
    this.fetchAppointments();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  fetchAppointments(): void {
    this.isLoading = true;
    console.log('Fetching appointments...');
    
    this.agendaService
      .list()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (appointments: Appointment[]) => {
          console.log('Appointments received:', appointments);
          
          const events = appointments.map((app: Appointment) => {
            // Melhor tratamento das datas
            let startDate: Date;
            let endDate: Date;
            
            // Tratamento especial para arrays (formato do backend)
            if (Array.isArray(app.dateTime)) {
              // Backend retorna array [year, month, day, hour, minute]
              const [year, month, day, hour, minute] = app.dateTime;
              startDate = new Date(year, month - 1, day, hour, minute); // month é 0-indexed no JS
            } else if (app.start instanceof Date) {
              startDate = app.start;
            } else if (app.start) {
              startDate = new Date(app.start);
            } else if (app.dateTime) {
              // dateTime é uma string ISO
              startDate = new Date(app.dateTime);
            } else {
              console.warn('Appointment without valid start date:', app);
              startDate = new Date(); // fallback para agora
            }
            
            if (Array.isArray(app.endDate)) {
              // Backend retorna array [year, month, day, hour, minute]
              const [year, month, day, hour, minute] = app.endDate;
              endDate = new Date(year, month - 1, day, hour, minute); // month é 0-indexed no JS
            } else if (app.end instanceof Date) {
              endDate = app.end;
            } else if (app.end) {
              endDate = new Date(app.end);
            } else if (app.endDate) {
              // endDate é uma string ISO
              endDate = new Date(app.endDate);
            } else {
              // Default: 1 hora após o início
              endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            }
            
            // Verificar se as datas são válidas
            if (isNaN(startDate.getTime())) {
              console.warn('Invalid start date for appointment:', app);
              startDate = new Date();
            }
            
            if (isNaN(endDate.getTime())) {
              console.warn('Invalid end date for appointment:', app);
              endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
            }
            
            const event = {
              id: app.id?.toString() || '',
              title: `${app.name}${app.service ? ' - ' + app.service : ''}`,
              start: startDate,
              end: endDate,
              backgroundColor: this.getEventColor(app.status),
              borderColor: this.getEventColor(app.status),
              extendedProps: { ...app },
            };
            
            console.log('Mapped event:', event);
            return event;
          });
          
          this.calendarOptions = {
            ...this.calendarOptions,
            events: events
          };
          
          this.eventCount = appointments.length;
          this.calculateFreeSlots(appointments);
          this.isLoading = false;
          
          console.log('Calendar updated with', events.length, 'events');
        },
        error: (err: any) => {
          console.error('Erro ao buscar agendamentos:', err);
          this.snackBar.open('Erro ao carregar agendamentos', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        },
      });
  }

  private getEventColor(status?: string | null): string {
    if (!status) return '#1976d2';
    return APPOINTMENT_STATUS_COLORS[status as AppointmentStatus] || '#1976d2';
  }

  calculateFreeSlots(appointments: Appointment[]): void {
    // Lógica para calcular slots disponíveis
    const workStart = 8 * 60; // 8:00 AM in minutes
    const workEnd = 18 * 60; // 6:00 PM in minutes
    let totalMinutes = workEnd - workStart;

    appointments.forEach((app: Appointment) => {
      const startDate = app.start || new Date(app.dateTime);
      const endDate = app.end || (app.endDate ? new Date(app.endDate) : new Date(app.dateTime));
      const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
      const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
      totalMinutes -= endMinutes - startMinutes;
    });

    this.freeSlots = Math.floor(totalMinutes / 60);
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    const dialogData: AppointmentDialogData = {
      isNew: true,
      selectedDate: selectInfo.start,
      selectedEndDate: selectInfo.end
    };

    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'save') {
        this.createAppointment(result.appointment);
      }
    });
  }

  handleEventClick(clickInfo: EventClickArg): void {
    // Create a new appointment object to avoid read-only property issues
    const originalAppointment = clickInfo.event.extendedProps as Appointment;
    const appointment: Appointment = {
      ...originalAppointment,
      id: parseInt(clickInfo.event.id)
    };

    console.log('Event clicked - original appointment:', originalAppointment);
    console.log('Event clicked - processed appointment:', appointment);

    const dialogData: AppointmentDialogData = {
      isNew: false,
      appointment: appointment
    };

    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '600px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'save') {
          this.updateAppointment(result.appointment);
        } else if (result.action === 'delete') {
          this.deleteAppointment(result.appointment.id!);
        }
      }
    });
  }

  private createAppointment(appointment: Appointment): void {
    this.agendaService.create(appointment)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.snackBar.open('Agendamento criado com sucesso!', 'Fechar', { duration: 3000 });
          this.fetchAppointments();
        },
        error: (err) => {
          console.error('Erro ao criar agendamento:', err);
          this.snackBar.open('Erro ao criar agendamento', 'Fechar', { duration: 3000 });
        }
      });
  }

  private updateAppointment(appointment: Appointment): void {
    console.log('Updating appointment with data:', appointment);
    console.log('Appointment ID:', appointment.id);
    console.log('Appointment ID type:', typeof appointment.id);
    
    // Validação do ID antes de fazer a requisição
    if (!appointment.id || isNaN(Number(appointment.id))) {
      console.error('Invalid appointment ID for update:', appointment.id);
      this.snackBar.open('Erro: ID do agendamento inválido', 'Fechar', { duration: 3000 });
      return;
    }
    
    const appointmentId = Number(appointment.id);
    console.log('Converted ID to number:', appointmentId);
    
    this.agendaService.update(appointmentId, appointment)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          console.log('Update response:', response);
          this.snackBar.open('Agendamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.fetchAppointments();
        },
        error: (err) => {
          console.error('Erro ao atualizar agendamento:', err);
          this.snackBar.open('Erro ao atualizar agendamento', 'Fechar', { duration: 3000 });
        }
      });
  }

  private deleteAppointment(id: number): void {
    this.agendaService.delete(id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.snackBar.open('Agendamento excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.fetchAppointments();
        },
        error: (err) => {
          console.error('Erro ao excluir agendamento:', err);
          this.snackBar.open('Erro ao excluir agendamento', 'Fechar', { duration: 3000 });
        }
      });
  }
}
