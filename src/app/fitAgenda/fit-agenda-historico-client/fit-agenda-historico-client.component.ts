
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../services/client/client.service';
import { Client } from '../../models/client';
import { Observable, startWith, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FitAgendaService } from '../../services/fit-agenda-service/fit-agenda.service';
import { Appointment } from '../../models/appointment';

@Component({
  selector: 'app-fit-agenda-historico-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatIconModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, NgxMaskDirective],
  providers: [provideNgxMask()],
  templateUrl: './fit-agenda-historico-client.component.html',
  styleUrl: './fit-agenda-historico-client.component.scss'
})
export class FitAgendaHistoricoClientComponent implements OnInit {
  clientService = inject(ClientService);
  agendaService = inject(FitAgendaService);
  clientControl = new FormControl('');
  serviceControl = new FormControl('');
  dateControl = new FormControl('');
  clients: Client[] = [];
  filteredClients$: Observable<Client[]> = new Observable<Client[]>();
  selectedClient: Client | null = null;
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  searchName: string = '';
  searchService: string = '';
  searchDate: { day?: number, month?: number, year?: number } = {};
  allServices: string[] = [];
  filteredServices: string[] = [];

  // Máscara dinâmica para o campo de data
  get dateMask(): string {
    const v = this.dateControl?.value || '';
    if (/^\d{0,2}$/.test(v)) return '00/00/0000'; // default para digitação
    if (/^\d{2}\/\d{0,2}$/.test(v)) return '00/00/0000';
    if (/^\d{2}\/\d{4}$/.test(v)) return '00/0000';
    if (/^\d{4}$/.test(v)) return '0000';
    return '00/00/0000';
  }
  // Utilitário para converter datas do backend (string, array ou ISO) para Date
  getDateFromAppointment(appt: Appointment): Date | null {
  let raw = appt.dateTime;
    if (!raw) return null;
    if (Array.isArray(raw) && raw.length >= 3) {
      // [ano, mes, dia, hora, min]
      const [ano, mes, dia, hora = 0, min = 0, seg = 0] = raw;
      return new Date(ano, mes - 1, dia, hora, min, seg);
    }
    if (typeof raw === 'string') {
      // '2025-08-19 18:00:00.000' ou '2025-08-19T18:00:00.000'
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(raw)) {
        raw = raw.replace(' ', 'T');
      }
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  ngOnInit() {
    // Carrega todos os clientes para autocomplete (opcional, só para autocomplete visual)
    this.clientService.getAllClients().subscribe(clients => {
      this.clients = clients;
      this.filteredClients$ = this.clientControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filterClients(value || ''))
      );
    });
    // Carrega todos os agendamentos do banco (clientes cadastrados ou não)
    this.agendaService.list().subscribe(appointments => {
      this.appointments = appointments;
      this.filteredAppointments = appointments;
      // Extrai lista única de serviços
      const serviceSet = new Set<string>();
      appointments.forEach(a => {
        if (a.description) serviceSet.add(a.description);
        else if (a.service) serviceSet.add(a.service);
      });
      this.allServices = Array.from(serviceSet).sort();
      this.filteredServices = this.allServices;
    });
    // Filtros reativos
    this.clientControl.valueChanges.subscribe((value: string | null) => {
      this.searchName = value || '';
      this.applyAllFilters();
    });
    this.serviceControl.valueChanges.subscribe((value: string | null) => {
      this.searchService = value || '';
      this.filterServices(value || '');
      this.applyAllFilters();
    });
    this.dateControl.valueChanges.subscribe((value: string | null) => {
      this.parseDateFilter(value || '');
      this.applyAllFilters();
    });
  }

  private _filterClients(value: string): Client[] {
    const filterValue = value.toLowerCase();
    return this.clients.filter(client =>
      client.name.toLowerCase().includes(filterValue)
    );
  }


  onClientSelected(event: any) {
    // Não faz nada especial, pois o filtro já é feito pelo valueChanges
  }


  applyAllFilters() {
    let filtered = this.appointments;
    // Filtro por nome
    const name = this.searchName.trim().toLowerCase();
    if (name) {
      filtered = filtered.filter(a => a.name && a.name.toLowerCase().includes(name));
    }
    // Filtro por serviço
    const service = this.searchService.trim().toLowerCase();
    if (service) {
      filtered = filtered.filter(a =>
        (a.description && a.description.toLowerCase().includes(service)) ||
        (a.service && a.service.toLowerCase().includes(service))
      );
    }
    // Filtro por data flexível
    const { day, month, year } = this.searchDate || {};
    if (day || month || year) {
      filtered = filtered.filter(a => {
        const apptDate = this.getDateFromAppointment(a);
        if (!apptDate) return false;
        if (year && apptDate.getFullYear() !== year) return false;
        if (month && (apptDate.getMonth() + 1) !== month) return false;
        if (day && apptDate.getDate() !== day) return false;
        return true;
      });
    }
    this.filteredAppointments = filtered;
  }

  filterServices(value: string) {
    const filter = value.toLowerCase();
    this.filteredServices = this.allServices.filter(s => s.toLowerCase().includes(filter));
  }

  // Permite filtrar por dia, mês ou ano (ex: 18/08/2025, 08/2025, 2025)
  parseDateFilter(value: string) {
    value = value.trim();
    let day, month, year;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      // dd/mm/yyyy
      const [d, m, y] = value.split('/').map(Number);
      day = d; month = m; year = y;
    } else if (/^\d{2}\/\d{4}$/.test(value)) {
      // mm/yyyy
      const [m, y] = value.split('/').map(Number);
      month = m; year = y;
    } else if (/^\d{4}$/.test(value)) {
      // yyyy
      year = Number(value);
    } else {
      day = month = year = undefined;
    }
    this.searchDate = { day, month, year };
  }

  onDateInput(event: any) {
    this.dateControl.setValue(event.target.value);
  }

  // Exibe todos se não houver filtro
  clearClientFilter() {
    this.selectedClient = null;
    this.clientControl.setValue('');
    this.filteredAppointments = this.appointments;
  }
}
