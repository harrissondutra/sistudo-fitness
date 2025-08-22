import { Component, ViewEncapsulation, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventInput } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { ViewChild, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FitAgendaService } from '../../services/fit-agenda-service/fit-agenda.service';
import { Appointment } from '../../models/appointment';
import { ServiceType, SERVICE_TYPE_OPTIONS } from '../../models/service-type.enum';
import { AppointmentStatus, APPOINTMENT_STATUS_COLORS } from '../../models/appointment-status.enum';
import { Subscription } from 'rxjs';
import { AppointmentDialogComponent, AppointmentDialogData } from '../appointment-dialog/appointment-dialog.component';

// Adicionado para usar o tipo de dado correto nos eventos do FullCalendar
@Component({
  selector: 'app-fit-agenda-proximos',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTimepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    TextFieldModule
  ],
  templateUrl: './fit-agenda-proximos.component.html',
  styleUrls: ['./fit-agenda-proximos.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class FitAgendaProximosComponent implements OnInit {
  getStatusColor(status: string): string {
    return this.statusColors[status as AppointmentStatus] || '#1976d2';
  }
  @ViewChild('calendar') calendarComponent?: ElementRef;
  private appointmentSubscription?: Subscription;

  today = new Date();
  totalAppointments = 0;
  upcomingAppointments = 0;
  availableSlotsToday = 0;

  serviceTypeOptions = SERVICE_TYPE_OPTIONS;
  appointmentStatus = AppointmentStatus;
  statusColors = APPOINTMENT_STATUS_COLORS;
  legendStatus: AppointmentStatus[] = Object.values(AppointmentStatus);
  eventsLoaded = false;
  allAppointments: Appointment[] = [];

  // Configuração do FullCalendar
  calendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: ptBrLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [] as EventInput[],
    eventClick: this.handleEventClick.bind(this),
    datesSet: (arg: any) => this.updateAppointmentStats(),
    eventDidMount: this.handleEventMouse.bind(this),
    selectable: false, // impede seleção de datas vazias
    select: undefined, // impede criação de eventos ao clicar em espaço vazio
    dateClick: undefined, // impede ação ao clicar em espaço vazio
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Dia'
    }
  };

  // Evento para mouse hover customizado
  handleEventMouse(info: any) {
    // Remove tooltip antiga se existir
    if (info.el._customTooltip) {
      info.el._customTooltip.remove();
      info.el._customTooltip = null;
    }
    // Cria tooltip customizada
    info.el.addEventListener('mouseenter', () => {
      const event = info.event;
      const nome = event.title;
      let hora = '';
      if (event.start) {
        const d = new Date(event.start);
        hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
      const servico = event.extendedProps['service'] || '';
      const tooltip = document.createElement('div');
      tooltip.className = 'custom-tooltip-event';
      tooltip.innerHTML = `<strong>Cliente:</strong> ${nome}<br><strong>Hora:</strong> ${hora}<br><strong>Serviço:</strong> ${servico}`;
      document.body.appendChild(tooltip);
      // Posição do mouse
      const mouseMove = (e: MouseEvent) => {
        tooltip.style.left = e.pageX + 15 + 'px';
        tooltip.style.top = e.pageY + 10 + 'px';
      };
      info.el.addEventListener('mousemove', mouseMove);
      info.el._customTooltip = tooltip;
      info.el._customTooltipMouseMove = mouseMove;
    });
    info.el.addEventListener('mouseleave', () => {
      if (info.el._customTooltip) {
        info.el._customTooltip.remove();
        info.el._customTooltip = null;
      }
      if (info.el._customTooltipMouseMove) {
        info.el.removeEventListener('mousemove', info.el._customTooltipMouseMove);
        info.el._customTooltipMouseMove = null;
      }
    });
  }



  constructor(
    private fitAgendaService: FitAgendaService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  ngOnDestroy(): void {
    if (this.appointmentSubscription) {
      this.appointmentSubscription.unsubscribe();
    }
  }

  loadEvents(): void {
    this.eventsLoaded = false;
    this.appointmentSubscription = this.fitAgendaService.list().subscribe({
      next: (appointments) => {
        this.allAppointments = appointments;
        // Mapeia os dados da API para o formato de eventos do FullCalendar
        const toIso = (val: any) => {
          if (Array.isArray(val) && val.length >= 3) {
            const [ano, mes, dia, hora = 0, min = 0, seg = 0] = val;
            return new Date(ano, mes - 1, dia, hora, min, seg).toISOString();
          }
          return val;
        };
        const events = appointments.map(app => {
          let status: AppointmentStatus = AppointmentStatus.Agendado;
          if (typeof app.status === 'string' && Object.values(AppointmentStatus).includes(app.status as AppointmentStatus)) {
            status = app.status as AppointmentStatus;
          }
          let hora = '';
          if (app.dateTime) {
            const d = Array.isArray(app.dateTime)
              ? new Date(app.dateTime[0], app.dateTime[1] - 1, app.dateTime[2], app.dateTime[3] || 0, app.dateTime[4] || 0)
              : new Date(app.dateTime);
            hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          }
          return {
            id: app.id !== undefined ? String(app.id) : undefined,
            title: app.name,
            start: toIso(app.dateTime),
            end: app.endDate ? toIso(app.endDate) : undefined,
            backgroundColor: APPOINTMENT_STATUS_COLORS[status] || APPOINTMENT_STATUS_COLORS[AppointmentStatus.Agendado],
            borderColor: APPOINTMENT_STATUS_COLORS[status] || APPOINTMENT_STATUS_COLORS[AppointmentStatus.Agendado],
            classNames: [status],
            extendedProps: {
              service: app.service,
              description: app.description,
              clientId: app.clientId,
              status: status
            },
            titleAttr: `${app.name} - ${hora}`
          };
        });
        this.calendarOptions.events = events;
        this.eventsLoaded = true;
        this.updateAppointmentStats();
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos:', err);
        this.eventsLoaded = true;
      }
    });
  }

  updateAppointmentStats(): void {
    // Total de agendamentos (todos)
    this.totalAppointments = this.allAppointments.length;

    // Próximos agendamentos (a partir de hoje)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.upcomingAppointments = this.allAppointments.filter(app => {
      let appDate: Date | null = null;
      if (app.dateTime) {
        appDate = Array.isArray(app.dateTime)
          ? new Date(app.dateTime[0], app.dateTime[1] - 1, app.dateTime[2], app.dateTime[3] || 0, app.dateTime[4] || 0)
          : new Date(app.dateTime);
      }
      return appDate && appDate >= today;
    }).length;

    // Horários disponíveis para o dia atual (exemplo: 10 por dia útil)
    let totalSlotsToday = 0;
    const dayOfWeek = today.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      totalSlotsToday = 10;
    }
    // Contar agendamentos do dia atual
    const appointmentsToday = this.allAppointments.filter(app => {
      let appDate: Date | null = null;
      if (app.dateTime) {
        appDate = Array.isArray(app.dateTime)
          ? new Date(app.dateTime[0], app.dateTime[1] - 1, app.dateTime[2], app.dateTime[3] || 0, app.dateTime[4] || 0)
          : new Date(app.dateTime);
      }
      return appDate && appDate.getFullYear() === today.getFullYear() && appDate.getMonth() === today.getMonth() && appDate.getDate() === today.getDate();
    }).length;
    this.availableSlotsToday = totalSlotsToday - appointmentsToday;
    if (this.availableSlotsToday < 0) this.availableSlotsToday = 0;
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const clickedEvent = clickInfo.event;
    
    // Construir objeto appointment a partir do evento
    const appointment: Appointment = {
      id: clickedEvent.id ? +clickedEvent.id : undefined,
      name: clickedEvent.title,
      dateTime: clickedEvent.start ? clickedEvent.start.toISOString() : new Date().toISOString(),
      endDate: clickedEvent.end ? clickedEvent.end.toISOString() : undefined,
      description: clickedEvent.extendedProps['description'],
      service: clickedEvent.extendedProps['service'] as ServiceType,
      status: clickedEvent.extendedProps['status'] as AppointmentStatus || AppointmentStatus.Agendado,
      clientId: clickedEvent.extendedProps['clientId']
    };

    // Preparar dados para o dialog
    const dialogData: AppointmentDialogData = {
      appointment: appointment,
      isNew: false,
      selectedDate: clickedEvent.start || new Date(),
      selectedEndDate: clickedEvent.end || undefined
    };

    // Abrir dialog
    const dialogRef = this.dialog.open(AppointmentDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: false,
      autoFocus: false
    });

    // Tratar resultado do dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.action === 'save') {
          this.saveAppointment(result.appointment);
        } else if (result.action === 'delete') {
          this.deleteAppointment(result.appointment);
        }
      }
    });
  }

  saveAppointment(appointment: Appointment): void {
    if (appointment.id) {
      // Editar agendamento existente
      this.fitAgendaService.update(appointment.id, appointment).subscribe({
        next: (updatedAppointment) => {
          this.snackBar.open('Agendamento atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadEvents();
        },
        error: (err) => {
          console.error('Erro ao atualizar agendamento:', err);
          this.snackBar.open('Erro ao atualizar agendamento', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      // Criar novo agendamento
      this.fitAgendaService.create(appointment).subscribe({
        next: (newAppointment) => {
          this.snackBar.open('Agendamento criado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadEvents();
        },
        error: (err) => {
          console.error('Erro ao criar agendamento:', err);
          this.snackBar.open('Erro ao criar agendamento', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  deleteAppointment(appointment: Appointment): void {
    if (appointment.id) {
      this.fitAgendaService.delete(appointment.id).subscribe({
        next: () => {
          this.snackBar.open('Agendamento excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadEvents();
        },
        error: (err) => {
          console.error('Erro ao excluir agendamento:', err);
          this.snackBar.open('Erro ao excluir agendamento', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
