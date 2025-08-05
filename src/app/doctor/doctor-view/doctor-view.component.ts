import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { IonicModule } from '@ionic/angular';

import { Doctor } from '../../models/doctor';
import { Client } from '../../models/client';
import { DoctorService } from '../../services/doctor/doctor.service';
import { ClientService } from '../../services/client/client.service';

@Component({
  selector: 'app-doctor-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    IonicModule
  ],
  templateUrl: './doctor-view.component.html',
  styleUrls: ['./doctor-view.component.scss']
})
export class DoctorViewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private doctorService = inject(DoctorService);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  doctorForm: FormGroup;
  doctor: Doctor | null = null;
  clients: Client[] = []; // Todos os clientes para seleção no modo edição
  doctorClients: Client[] = []; // Clientes específicos do médico
  isLoading = false;
  isEditing = false;
  doctorId!: string;

  constructor() {
    this.doctorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      crm: ['', [Validators.required, Validators.minLength(3)]],
      specialty: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      clientIds: [[]] // Array de IDs dos clientes
    });
  }

  ngOnInit(): void {
    this.doctorId = this.route.snapshot.params['id'];
    if (this.doctorId) {
      this.loadDoctor();
      // Carregamos todos os clientes apenas para o modo de edição (seleção)
      this.loadClients();
    }
  }

  loadDoctor(): void {
    this.isLoading = true;
    this.doctorService.getDoctorById(this.doctorId).subscribe({
      next: (doctor) => {
        console.log('=== DOCTOR LOADED ===');
        console.log('Raw doctor data from API:', doctor);
        console.log('Doctor.clients:', doctor.clients);
        console.log('Doctor.clientIds:', doctor.clientIds);
        console.log('Doctor.clientId:', doctor.clientId);
        console.log('Available clients at doctor load time:', this.clients);

        this.doctor = doctor;
        this.populateForm(doctor);
        this.isLoading = false;

        // Carregar clientes específicos do médico usando o novo endpoint
        this.loadDoctorClientsFromEndpoint();

        // Força uma atualização da lista de clientes após carregar o médico
        setTimeout(() => {
          console.log('=== DELAYED CLIENT CHECK ===');
          console.log('Available clients after timeout:', this.clients);
          console.log('getClientsList() result:', this.getClientsList());
        }, 1000);
      },
      error: (error) => {
        console.error('Erro ao carregar médico:', error);
        this.showSnackBar('Erro ao carregar dados do médico', 'error');
        this.isLoading = false;
      }
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        console.log('=== CLIENTS LOADED ===');
        console.log('Raw clients data from API:', clients);
        console.log('Number of clients loaded:', clients.length);

        this.clients = clients;

        // Se o médico já foi carregado, força uma atualização
        if (this.doctor) {
          console.log('Doctor already loaded, forcing client list update');
          console.log('Updated getClientsList() result:', this.getClientsList());
        }
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
      }
    });
  }

  // Nova função para carregar clientes usando o endpoint específico
  loadDoctorClientsFromEndpoint(): void {
    if (!this.doctor || !this.doctor.id) return;

    console.log('=== LOADING CLIENTS FROM SPECIFIC ENDPOINT ===');
    console.log('Doctor ID:', this.doctor.id);

    this.doctorService.getClientsByDoctorId(this.doctor.id).subscribe({
      next: (doctorClients) => {
        console.log('Clients loaded from getClientsByDoctorId:', doctorClients);

        // Armazenar os clientes específicos do médico
        this.doctorClients = doctorClients;

        console.log('Doctor specific clients stored:', this.doctorClients);
      },
      error: (error) => {
        console.error('Erro ao carregar clientes do médico:', error);
        // Fallback para o método anterior se o novo endpoint falhar
        this.loadDoctorClients();
      }
    });
  }

  // Nova função para carregar clientes específicos do médico
  loadDoctorClients(): void {
    if (!this.doctor) return;

    // Se o médico tem IDs de clientes, buscar apenas esses clientes
    const clientIds = this.getClientIds();

    if (clientIds.length > 0) {
      console.log('=== LOADING SPECIFIC DOCTOR CLIENTS ===');
      console.log('Client IDs to load:', clientIds);

      // Buscar cada cliente individualmente
      const clientRequests = clientIds.map(id =>
        this.clientService.getClientById(id)
      );

      // Executar todas as requisições em paralelo
      Promise.all(clientRequests.map(req => req.toPromise()))
        .then(specificClients => {
          console.log('Specific clients loaded:', specificClients);
          // Adicionar os clientes específicos ao array geral, filtrando undefined
          const validClients = specificClients.filter((client): client is Client => client !== undefined);
          this.clients = [...this.clients, ...validClients];
          console.log('Updated clients array:', this.clients);
        })
        .catch(error => {
          console.error('Erro ao carregar clientes específicos:', error);
        });
    }
  }

  // Função auxiliar para extrair IDs dos clientes do médico
  private getClientIds(): number[] {
    if (!this.doctor) return [];

    if (this.doctor.clientIds && this.doctor.clientIds.length > 0) {
      return this.doctor.clientIds;
    } else if (this.doctor.clients && this.doctor.clients.length > 0) {
      return this.doctor.clients.map(client => client.id!).filter(id => id);
    } else if (this.doctor.clientId) {
      return [this.doctor.clientId];
    }

    return [];
  }

  populateForm(doctor: Doctor): void {
    console.log('Doctor data received:', doctor); // Debug log

    // Determinar IDs dos clientes - compatibilidade com API antiga e nova
    let clientIds: number[] = [];
    if (doctor.clientIds && doctor.clientIds.length > 0) {
      clientIds = doctor.clientIds;
      console.log('Using doctor.clientIds:', clientIds); // Debug log
    } else if (doctor.clients && doctor.clients.length > 0) {
      clientIds = doctor.clients.map(client => client.id!);
      console.log('Using doctor.clients mapped to IDs:', clientIds); // Debug log
      console.log('Doctor clients data:', doctor.clients); // Debug log
    } else if (doctor.clientId) {
      clientIds = [doctor.clientId];
      console.log('Using single doctor.clientId:', clientIds); // Debug log
    }

    this.doctorForm.patchValue({
      name: doctor.name,
      crm: doctor.crm,
      specialty: doctor.specialty,
      email: doctor.email,
      phone: doctor.phone,
      clientIds: clientIds
    });
    this.doctorForm.disable();
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.doctorForm.enable();
    } else {
      this.doctorForm.disable();
      if (this.doctor) {
        this.populateForm(this.doctor);
      }
    }
  }

  onSave(): void {
    if (this.doctorForm.valid && this.doctor) {
      this.isLoading = true;
      const formValue = this.doctorForm.value;
      const updatedDoctor: Doctor = {
        ...this.doctor,
        name: formValue.name!,
        crm: formValue.crm!,
        specialty: formValue.specialty!,
        email: formValue.email!,
        phone: formValue.phone!,
        clientIds: formValue.clientIds! // Use clientIds array
      };

      this.doctorService.updateDoctor(updatedDoctor).subscribe({
        next: (response) => {
          this.doctor = response;
          this.populateForm(response);
          this.isEditing = false;
          this.isLoading = false;
          this.showSnackBar('Médico atualizado com sucesso!', 'success');
        },
        error: (error) => {
          console.error('Erro ao atualizar médico:', error);
          this.showSnackBar('Erro ao atualizar médico', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.isEditing = false;
    this.doctorForm.disable();
    if (this.doctor) {
      this.populateForm(this.doctor);
    }
  }

  onDelete(): void {
    if (this.doctor && confirm('Tem certeza que deseja excluir este médico?')) {
      this.isLoading = true;
      this.doctorService.deleteDoctor(this.doctor.id!.toString()).subscribe({
        next: () => {
          this.showSnackBar('Médico excluído com sucesso!', 'success');
          this.router.navigate(['/doctor-list']);
        },
        error: (error) => {
          console.error('Erro ao excluir médico:', error);
          this.showSnackBar('Erro ao excluir médico', 'error');
          this.isLoading = false;
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/doctor-list']);
  }

  getFieldError(fieldName: string): string {
    const field = this.doctorForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors?.['minlength']?.requiredLength} caracteres`;
    }
    if (field?.hasError('pattern')) {
      return `${this.getFieldLabel(fieldName)} deve estar no formato (99) 99999-9999`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      crm: 'CRM',
      specialty: 'Especialidade',
      email: 'Email',
      phone: 'Telefone',
      clientIds: 'Clientes'
    };
    return labels[fieldName] || fieldName;
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  getClientNames(): string {
    if (!this.doctor) return 'Nenhum cliente vinculado';

    // Usa a função getClientsList() que já tem a lógica corrigida
    const clientsList = this.getClientsList();

    if (clientsList.length === 0) return 'Nenhum cliente vinculado';

    // Aguarda os clientes serem carregados se necessário
    if (this.clients.length === 0 && this.doctor.clientIds && this.doctor.clientIds.length > 0) {
      return 'Carregando clientes...';
    }

    const names = clientsList
      .map(client => client.name)
      .filter(name => name && !name.includes('não encontrado')); // Remove nomes inválidos

    if (names.length === 0) return 'Nenhum cliente vinculado';

    return names.length > 3
      ? `${names.slice(0, 3).join(', ')} e mais ${names.length - 3}...`
      : names.join(', ');
  }

  getClientsList(): Client[] {
    console.log('=== getClientsList() CALLED ===');
    if (!this.doctor) {
      console.log('No doctor available, returning empty array');
      return [];
    }

    console.log('Doctor data:', this.doctor);
    console.log('Doctor specific clients:', this.doctorClients);
    console.log('Doctor specific clients count:', this.doctorClients.length);

    // 1. Primeiro, usa os clientes carregados do endpoint específico
    if (this.doctorClients.length > 0) {
      console.log('✓ Using doctor specific clients from endpoint');
      return this.doctorClients;
    }

    // 2. Fallback: verifica se o médico já tem os dados completos dos clientes
    if (this.doctor.clients && this.doctor.clients.length > 0) {
      console.log('✓ Using doctor.clients directly (fallback):', this.doctor.clients);

      const result = this.doctor.clients
        .filter(client => client && client.name)
        .map(client => ({
          id: client.id,
          name: client.name || `Cliente ID: ${client.id}`,
          email: client.email || 'Email não informado',
          cpf: 'CPF não informado',
          dateOfBirth: undefined,
          phone: undefined,
          weight: undefined,
          height: undefined
        } as Client));

      console.log('Final result from doctor.clients fallback:', result);
      return result;
    }

    console.log('❌ No clients found, returning empty array');
    return [];
  }

  getSelectedClientIds(): number[] {
    if (!this.doctor) return [];

    if (this.doctor.clientIds && this.doctor.clientIds.length > 0) {
      return this.doctor.clientIds;
    } else if (this.doctor.clients && this.doctor.clients.length > 0) {
      return this.doctor.clients.map(client => client.id!);
    } else if (this.doctor.clientId) {
      return [this.doctor.clientId];
    }

    return [];
  }
}
