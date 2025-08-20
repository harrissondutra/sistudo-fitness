import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventInput } from '@fullcalendar/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FitAgendaService } from '../../services/fit-agenda-service/fit-agenda.service';
import { Appointment } from '../../models/appointment';
import { ServiceType, SERVICE_TYPE_OPTIONS } from '../../models/service-type.enum';
import { AppointmentStatus, APPOINTMENT_STATUS_COLORS } from '../../models/appointment-status.enum';
import { Subscription } from 'rxjs';

// Adicionado para usar o tipo de dado correto nos eventos do FullCalendar
@Component({
  selector: 'app-fit-agenda-proximos',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FullCalendarModule,
    FormsModule
  ],
  templateUrl: './fit-agenda-proximos.component.html',
  styleUrls: ['./fit-agenda-proximos.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FitAgendaProximosComponent implements OnInit {
  getStatusColor(status: string): string {
    return this.statusColors[status as AppointmentStatus] || '#1976d2';
  }
  // Component properties
  @ViewChild('calendar') calendarComponent?: ElementRef;
  private appointmentSubscription?: Subscription;

  // Propriedades para a agenda e o modal
  showModal = false;
  isEditing = false;
  // Tipo auxiliar para o modal, incluindo campos extras para edição
  modalData: (Appointment & { startString?: string | null; endString?: string | null; status?: AppointmentStatus }) | null = null;
  statusEdit: AppointmentStatus = AppointmentStatus.Agendado;
  today = new Date();
  totalAppointments = 0;
  upcomingAppointments = 0;


  serviceTypeOptions = SERVICE_TYPE_OPTIONS;
  appointmentStatus = AppointmentStatus;
  statusColors = APPOINTMENT_STATUS_COLORS;
  legendStatus: AppointmentStatus[] = Object.values(AppointmentStatus);

  // Propriedade para controlar o carregamento de eventos
  eventsLoaded = false;

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
    private snackBar: MatSnackBar
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
        // Mapeia os dados da API para o formato de eventos do FullCalendar
        const toIso = (val: any) => {
          if (Array.isArray(val) && val.length >= 3) {
            const [ano, mes, dia, hora = 0, min = 0, seg = 0] = val;
            return new Date(ano, mes - 1, dia, hora, min, seg).toISOString();
          }
          return val;
        };
        const events = appointments.map(app => {
          // status pode vir como string do backend, garantir que seja um valor válido do enum
          let status: AppointmentStatus = AppointmentStatus.Agendado;
          if (typeof app.status === 'string' && Object.values(AppointmentStatus).includes(app.status as AppointmentStatus)) {
            status = app.status as AppointmentStatus;
          }
          // Tooltip: nome + hora
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
        // Atribui os eventos ao calendário
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
    const calendarApi = (this.calendarComponent as any)?.getApi();
    if (calendarApi) {
      const allEvents = calendarApi.getEvents();
      this.totalAppointments = allEvents.length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.upcomingAppointments = allEvents.filter((event: { start: Date | string | null }) => {
        const eventStart: Date | string | null = event.start;
        return eventStart && new Date(eventStart as string) >= today;
      }).length;
    }
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const clickedEvent = clickInfo.event;
    // Helper para formatar para 'YYYY-MM-DDTHH:mm' local
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatLocal = (d: Date | string | null | undefined) => {
      if (!d) return null;
      const date = typeof d === 'string' ? new Date(d) : d;
      return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    this.modalData = {
      id: clickedEvent.id ? +clickedEvent.id : undefined,
      name: clickedEvent.title,
      dateTime: clickedEvent.start ? formatLocal(clickedEvent.start) || '' : '',
      endDate: clickedEvent.end ? formatLocal(clickedEvent.end) || undefined : undefined,
      description: clickedEvent.extendedProps['description'],
      service: clickedEvent.extendedProps['service'],
      clientId: clickedEvent.extendedProps['clientId'],
      startString: clickedEvent.start ? formatLocal(clickedEvent.start) : null,
      endString: clickedEvent.end ? formatLocal(clickedEvent.end) : null
    };
    // status pode vir como string, garantir que seja um valor válido do enum
    const statusRaw = clickedEvent.extendedProps['status'];
    this.statusEdit = (typeof statusRaw === 'string' && Object.values(AppointmentStatus).includes(statusRaw as AppointmentStatus))
      ? (statusRaw as AppointmentStatus)
      : AppointmentStatus.Agendado;
    this.showModal = true;
  }

  handleDeleteAppointment(): void {
    if (this.modalData?.id) {
      this.fitAgendaService.delete(this.modalData.id).subscribe({
        next: () => {
          this.showModal = false;
          this.snackBar.open('Agendamento excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadEvents();
        },
        error: (err) => {
          console.error('Erro ao excluir agendamento:', err);
        }
      });
    }
  }


  saveChanges(): void {
    if (this.modalData?.id) {
      // Formata para 'YYYY-MM-DDTHH:mm' (local time, sem Z/UTC)
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatLocal = (d: Date | string | null | undefined) => {
        if (!d) return '';
        const date = typeof d === 'string' ? new Date(d) : d;
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
      };
      const dateTime = this.modalData.startString ? formatLocal(this.modalData.startString) : this.modalData.dateTime;
      const endDate = this.modalData.endString ? formatLocal(this.modalData.endString) : this.modalData.endDate;
      // Atualiza o status também no modalData para refletir imediatamente na UI
      this.modalData.status = this.statusEdit;
      const payload: any = {
        id: this.modalData.id,
        name: this.modalData.name,
        service: this.modalData.service as ServiceType,
        description: this.modalData.description,
        clientId: this.modalData.clientId,
        dateTime,
        endDate,
        status: (this.statusEdit as string) || AppointmentStatus.Agendado
      };

      this.fitAgendaService.update(this.modalData.id, payload).subscribe({
        next: () => {
          this.showModal = false;
          this.isEditing = false;
          // Aguarda o recarregamento dos eventos para garantir que o status atualizado seja refletido
          setTimeout(() => this.loadEvents(), 100);
          this.snackBar.open('Agendamento alterado com sucesso!', 'Fechar', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erro ao salvar agendamento:', err);
        }
      });
    }
  }

  closeModal(event: MouseEvent | null): void {
    if (!event || (event.target as HTMLElement).classList.contains('modal-overlay') || (event.target as HTMLElement).classList.contains('close-button-icon')) {
      this.showModal = false;
      this.isEditing = false;
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
  }
}
