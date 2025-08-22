import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { FormsModule } from '@angular/forms';
import { CalendarOptions, EventInput, EventApi, DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { FitAgendaService } from '../../../app/services/fit-agenda-service/fit-agenda.service';
import { Appointment } from '../../models/appointment';
import { Subject, takeUntil } from 'rxjs';

interface SelectedEventData {
  id: string;
  title: string;
  start: Date;
  end: Date;
  service?: string;
  description?: string;
  notes?: string;
  clientId?: number;
}

@Component({
  selector: 'app-fit-agenda-hoje',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule],
  templateUrl: './fit-agenda-hoje.component.html',
  styleUrl: './fit-agenda-hoje.component.scss',
})
export class FitAgendaHojeComponent implements OnInit, OnDestroy {
  eventCount = 0;
  freeSlots = 0;
  today: Date = new Date();
  @ViewChild('eventModal') eventModal!: ElementRef<HTMLDialogElement>;

  private destroy$ = new Subject<void>();

  // Estado do modal
  showModal = false;
  selectedEvent: SelectedEventData | null = null;
  isEditing = false;
  editingEvent: SelectedEventData | null = null;

  // Loading state
  isLoading = true;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridDay',

    // Header toolbar melhorado
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay'
    },

    locale: ptBrLocale,
    height: 'auto',
    slotMinTime: '06:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    allDaySlot: false,
    nowIndicator: true,
    scrollTime: '08:00:00',

    // Configurações visuais melhoradas
    dayHeaderFormat: {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    },

    // Eventos dinâmicos do backend
    events: (fetchInfo, successCallback, failureCallback) => {
      this.loadAppointments(fetchInfo.startStr, fetchInfo.endStr)
        .then(events => successCallback(events))
        .catch((error: unknown) => failureCallback(error as Error));
    },

    // Click no evento - abre modal personalizado
    eventClick: (arg: EventClickArg) => {
      this.openEventModal(arg.event);
    },

    // Configuração de horário
    slotLabelFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: false as const
    },

    eventTimeFormat: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      hour12: false as const
    },

    // Configurações de interação
    selectable: true,
    selectMirror: true,

    // Callback para seleção de horário (para criar novos eventos)
    select: (selectInfo: DateSelectArg) => {
      console.log('Horário selecionado:', selectInfo);
      // Aqui você pode abrir um modal para criar novo agendamento
    },

    // Configurações de responsividade
    aspectRatio: 1.8,
    contentHeight: 'auto',

    // Configurações adicionais para melhor UX
    eventResizableFromStart: true,
    eventDurationEditable: true,
    eventStartEditable: true,

    // Callback para quando eventos são movidos ou redimensionados
    eventDrop: (info: EventDropArg) => {
      this.updateAppointment(info);
    },

    eventResize: (info: any) => {
      this.updateAppointment(info);
    }
  };

  constructor(private fitAgendaService: FitAgendaService) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    // O FullCalendar já vai chamar o callback de events automaticamente
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  private async loadAppointments(start: string, end: string): Promise<EventInput[]> {
    try {
      console.log('[DEBUG] Parâmetros enviados para o backend:', { start, end });
      const appointments = await this.fitAgendaService.list({
        start: start,
        end: end
      }).pipe(takeUntil(this.destroy$)).toPromise();
      console.log('[DEBUG] Dados retornados do backend:', appointments);
      if (appointments && appointments.length) {
        appointments.forEach((a, idx) => {
          console.log(`[DEBUG] Agendamento #${idx+1}: start=${a.dateTime}, end=${a.endDate}`);
        });
        console.log('[DEBUG] Range solicitado pelo calendário:', { start, end });
      }
      const events = (appointments || [])
        .map(appointment => this.mapAppointmentToEvent(appointment))
        .filter(event => !!event);
      this.eventCount = events.length;
      // Calcular horários livres (intervalos de 1h entre 06:00 e 22:00)
      const slots: string[] = [];
      const baseDate = new Date(this.today);
      baseDate.setHours(6, 0, 0, 0);
      for (let h = 6; h < 22; h++) {
        const slotStart = new Date(baseDate);
        slotStart.setHours(h, 0, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(h + 1, 0, 0, 0);
        slots.push(slotStart.toISOString());
      }
      // Verifica se cada slot está livre
      let busySlots = 0;
      slots.forEach(slotIso => {
        const slotDate = new Date(slotIso);
        const slotEnd = new Date(slotDate.getTime() + 60 * 60 * 1000);
        const overlapping = events.some(ev => {
          if (!ev.start || !ev.end) return false;
          const evStart = new Date(ev.start as string);
          const evEnd = new Date(ev.end as string);
          return evStart < slotEnd && evEnd > slotDate;
        });
        if (overlapping) busySlots++;
      });
      this.freeSlots = slots.length - busySlots;
      return events;
    } catch (error: unknown) {
      console.error('Erro ao carregar agendamentos:', error);
      return [];
    }
  }

  private mapAppointmentToEvent(appointment: Appointment): EventInput {
    // Cores baseadas no tipo de serviço
    const colorMap: { [key: string]: { bg: string; border: string } } = {
      'consulta': { bg: '#1976d2', border: '#1565c0' },
      'avaliacao': { bg: '#388e3c', border: '#2e7d32' },
      'treino': { bg: '#f57c00', border: '#ef6c00' },
      'nutricao': { bg: '#7b1fa2', border: '#6a1b9a' },
      'default': { bg: '#5c6bc0', border: '#3f51b5' }
    };

    const serviceKey = appointment.service?.toLowerCase() || 'default';
    const colors = colorMap[serviceKey] || colorMap['default'];

    // Aceita apenas dateTime e endDate do modelo Appointment
    let start = appointment.dateTime;
    let end = appointment.endDate;
    // Se vier como array [ano, mes, dia, hora, min, seg] (não esperado, mas mantido por compatibilidade)
    if (Array.isArray(start) && start.length >= 3) {
      const [ano, mes, dia, hora = 0, min = 0, seg = 0] = start;
      const dateObj = new Date(ano, mes - 1, dia, hora, min, seg);
      start = dateObj.toISOString();
    } else if (typeof start === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(start)) {
      // Se vier como '2025-08-19 09:00:00', converte para ISO
      start = start.replace(' ', 'T');
    }
    // Se não houver end, considera 1h de duração
    if (!end && start) {
      const startDate = new Date(start);
      if (!isNaN(startDate.getTime())) {
        end = new Date(startDate.getTime() + 60 * 60 * 1000).toISOString();
      }
    }
    // Se ainda não houver start ou end, ignora o evento
    if (!start || !end) {
      return null as any;
    }
    return {
      id: appointment.id?.toString(),
      title: appointment.name,
      start: start,
      end: end,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      textColor: '#ffffff',
      extendedProps: {
        clientId: appointment.clientId,
        service: appointment.service,
        description: appointment.description,
        originalAppointment: appointment
      }
    };
  }

  private openEventModal(calendarEvent: EventApi): void {
    // Garante que start e end sejam Date
    const toDate = (val: any) => {
      if (!val) return new Date();
      if (val instanceof Date) return val;
      return new Date(val);
    };
    // Corrige o mapeamento: service e description
    this.selectedEvent = {
      id: calendarEvent.id,
      title: calendarEvent.title,
      start: toDate(calendarEvent.start),
      end: toDate(calendarEvent.end),
      service: calendarEvent.extendedProps['service'] || '',
      description: calendarEvent.extendedProps['description'] || '',
  // notes: calendarEvent.extendedProps['notes'],
      clientId: calendarEvent.extendedProps['clientId']
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedEvent = null;
    this.isEditing = false;
    this.editingEvent = null;
  }

  // Método para entrar no modo de edição
  startEditing(): void {
    if (this.selectedEvent) {
      this.isEditing = true;
      this.editingEvent = { ...this.selectedEvent };
    }
  }

  // Método para cancelar edição
  cancelEditing(): void {
    this.isEditing = false;
    this.editingEvent = null;
  }

  // Método para salvar edição
  saveEditing(): void {
    if (!this.editingEvent) return;

    // Converte as datas para o formato correto
    const startDate = new Date(this.editingEvent.start);
    const endDate = new Date(this.editingEvent.end);

    const appointmentId = parseInt(this.editingEvent.id);
    const updatedAppointment: Appointment = {
      id: appointmentId,
      name: this.editingEvent.title,
      service: this.editingEvent.service || '',
      description: this.editingEvent.description || '',
      dateTime: startDate.toISOString(),
      endDate: endDate.toISOString(),
      clientId: this.editingEvent.clientId || 0
    };

    this.fitAgendaService.update(appointmentId, updatedAppointment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Agendamento atualizado com sucesso');
          // Atualiza o evento selecionado com os novos dados
          this.selectedEvent = {
            ...this.editingEvent!,
            start: startDate,
            end: endDate
          };
          this.isEditing = false;
          this.editingEvent = null;
          // Recarrega o calendário para refletir as mudanças
          window.location.reload();
        },
        error: (error: unknown) => {
          console.error('Erro ao atualizar agendamento:', error);
          alert('Erro ao salvar as alterações. Tente novamente.');
        }
      });
  }

  private updateAppointment(info: any): void {
    const appointmentId = parseInt(info.event.id);
    const updatedAppointment: Appointment = {
      id: appointmentId,
      name: info.event.title,
      service: info.event.extendedProps['service'],
      description: info.event.extendedProps['description'],
      dateTime: info.event.start ? info.event.start.toISOString() : '',
      endDate: info.event.end ? info.event.end.toISOString() : undefined,
      clientId: info.event.extendedProps['clientId']
    };

    this.fitAgendaService.update(appointmentId, updatedAppointment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Agendamento atualizado com sucesso');
        },
        error: (error: unknown) => {
          console.error('Erro ao atualizar agendamento:', error);
          info.revert(); // Reverte a mudança visual se houver erro
        }
      });
  }

  // Método para excluir agendamento
  deleteAppointment(id: number): void {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      this.fitAgendaService.delete(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.closeModal();
            // Recarrega o calendário
            window.location.reload();
          },
          error: (error: unknown) => {
            console.error('Erro ao excluir agendamento:', error);
          }
        });
    }
  }

  // Formatador de data para exibição
  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Converte Date para string datetime-local para input HTML
  dateToDatetimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Getter para start datetime-local
  get editingStartDatetime(): string {
    return this.editingEvent ? this.dateToDatetimeLocal(this.editingEvent.start) : '';
  }

  // Setter para start datetime-local
  set editingStartDatetime(value: string) {
    if (this.editingEvent && value) {
      this.editingEvent.start = new Date(value);
    }
  }

  // Getter para end datetime-local
  get editingEndDatetime(): string {
    return this.editingEvent ? this.dateToDatetimeLocal(this.editingEvent.end) : '';
  }

  // Setter para end datetime-local
  set editingEndDatetime(value: string) {
    if (this.editingEvent && value) {
      this.editingEvent.end = new Date(value);
    }
  }
}
