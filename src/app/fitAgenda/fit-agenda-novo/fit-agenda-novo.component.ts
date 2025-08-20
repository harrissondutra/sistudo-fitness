
import { Component, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FitAgendaService } from '../../services/fit-agenda-service/fit-agenda.service';
import { Appointment } from '../../models/appointment';
import { ClientService } from '../../services/client/client.service';
import { Client } from '../../models/client';
import { Observable, startWith, map } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { COUNTRY_DDIS, CountryDDI } from '../../models/country-ddi';
import { ServiceType, SERVICE_TYPE_OPTIONS } from '../../models/service-type.enum';

@Component({
  selector: 'app-fit-agenda-novo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    FormsModule,
    MatCheckboxModule,
    NgxMaskDirective
],
  providers: [provideNgxMask()],
  templateUrl: './fit-agenda-novo.component.html',
  styleUrl: './fit-agenda-novo.component.scss'
})



export class FitAgendaNovoComponent implements OnInit, DoCheck {
  isRegisteredClient: boolean = true;
  agendaForm: FormGroup;
  countryDDIs: CountryDDI[] = COUNTRY_DDIS;
  selectedDDI: CountryDDI = COUNTRY_DDIS[0];
  isLoading = false;
  clients: Client[] = [];
  filteredClients$: Observable<Client[]> = new Observable<Client[]>();

  serviceTypeOptions = SERVICE_TYPE_OPTIONS;


  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private agendaService: FitAgendaService,
    private clientService: ClientService
  ) {
    this.agendaForm = this.fb.group({
      client: [''], // opcional
      unregisteredClient: [''], // required dinamicamente
      phone: [''], // required dinamicamente
      ddi: [COUNTRY_DDIS[0].code], // DDI default Brasil
      name: ['', Validators.required], // nome do atendimento obrigatório
      service: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      notes: ['']
    });
  }

  ngDoCheck(): void {
    // Validação dinâmica:
    if (this.isRegisteredClient) {
      // Cliente cadastrado: nome obrigatório, telefone não
      this.agendaForm.get('name')?.setValidators([Validators.required]);
      this.agendaForm.get('unregisteredClient')?.clearValidators();
      this.agendaForm.get('phone')?.clearValidators();
    } else {
      // Não cadastrado: nome opcional, telefone obrigatório
      this.agendaForm.get('name')?.clearValidators();
      this.agendaForm.get('unregisteredClient')?.clearValidators();
      this.agendaForm.get('phone')?.setValidators([Validators.required]);
    }
    this.agendaForm.get('name')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    this.agendaForm.get('unregisteredClient')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    this.agendaForm.get('phone')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  // Getter para exibir campo de busca de cliente ou nome livre
   get showRegisteredClientField(): boolean {
    return this.isRegisteredClient;
  }

  ngOnInit(): void {
    // Carrega clientes e configura autocomplete
    this.clientService.getAllClients().subscribe((clients: Client[]) => {
      this.clients = clients;
      this.filteredClients$ = this.agendaForm.get('client')!.valueChanges.pipe(
        startWith(''),
        map((value: string) => this._filterClients(value || ''))
      );
    });
  }

  // Mantido apenas uma implementação de cada método

  onClientTypeChange(): void {
    if (this.isRegisteredClient) {
      this.agendaForm.get('unregisteredClient')?.setValue('');
    } else {
      this.agendaForm.get('client')?.setValue('');
    }
  }

  private _filterClients(value: string): Client[] {
    const filterValue = value.toLowerCase();
    return this.clients.filter((client: Client) =>
      client.name.toLowerCase().includes(filterValue)
    );
  }

  onClientSelected(event: any) {
    const name = event.option.value;
    const selected = this.clients.find((c: Client) => c.name === name);
    if (selected) {
      this.agendaForm.get('client')!.setValue(selected.id);
      this.agendaForm.get('name')!.setValue(selected.name); // preenche o nome do atendimento
    }
  }

  onSubmit() {
    if (this.agendaForm.valid) {
      this.isLoading = true;
      const form = this.agendaForm.value;
      // clientId é opcional
      const clientId = form.client ? Number(form.client) : undefined;
      // Usa o campo correto de nome
      const name = this.isRegisteredClient ? form.name : form.unregisteredClient;
      let phone = !this.isRegisteredClient ? form.phone : undefined;
      const ddi = !this.isRegisteredClient ? form.ddi : undefined;
      if (phone && ddi) {
        phone = `${ddi} ${phone}`;
      }
  const service = form.service;
      const description = form.notes || '';
      // Monta data/hora ISO
      const date: Date = form.date instanceof Date ? form.date : new Date(form.date);
      const [hour, minute] = (form.time || '').split(':');
      date.setHours(Number(hour), Number(minute), 0, 0);
      // Formata para 'YYYY-MM-DDTHH:mm' (local time, sem Z/UTC)
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const dateTime = formatLocal(date);
      // Supondo duração padrão de 1h
      const endDateObj = new Date(date);
      endDateObj.setHours(endDateObj.getHours() + 1);
      const endDate = formatLocal(endDateObj);
      const appointment: Appointment = {
        name,
        service,
        description,
        dateTime,
        endDate
      };
      if (clientId !== undefined) {
        appointment.clientId = clientId;
      }
      if (phone) {
        appointment.phone = phone;
      }
      this.agendaService.create(appointment).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Agendamento criado com sucesso!', 'Fechar', { duration: 3000 });
          this.agendaForm.reset();
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open('Erro ao criar agendamento', 'Fechar', { duration: 4000 });
        }
      });
    } else {
      this.agendaForm.markAllAsTouched();
    }
  }

  setRegisteredClient(value: boolean): void {
    this.isRegisteredClient = value;
    this.onClientTypeChange();
  }

//
  ServiceType = ServiceType;
}
