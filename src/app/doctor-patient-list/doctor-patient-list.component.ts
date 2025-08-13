import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { DoctorService } from '../services/doctor/doctor.service';
import { ClientService } from '../services/client/client.service';
import { Client } from '../models/client';

@Component({
  selector: 'app-doctor-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './doctor-patient-list.component.html',
  styleUrl: './doctor-patient-list.component.scss'
})
export class DoctorPatientListComponent implements OnInit {
  doctorId!: string;
  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading = false;
  searchTerm = '';
  error = '';

  displayedColumns: string[] = ['name', 'email', 'phone', 'dateOfBirth', 'hasMeasure', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.doctorId = params['id'];
      this.loadClients();
    });
  }

  loadClients(): void {
    this.loading = true;
    this.error = '';

    // 🔍 DEBUG: Verificar valor do doctorId
    console.log('🔍 DEBUG doctorId:', this.doctorId, 'tipo:', typeof this.doctorId);

    // 🔧 SOLUÇÃO ALTERNATIVA: Usar endpoint funcional enquanto cache não é corrigido
    console.log('🔧 Tentando endpoint original primeiro...');

    this.doctorService.getClientsByDoctorId(this.doctorId).subscribe({
      next: (clients) => {
        console.log('✅ Clients recebidos pelo endpoint original:', clients);
        this.clients = clients;
        this.filteredClients = clients;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erro no endpoint original:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Error detail:', error.error);

        // 🔧 FALLBACK: Se der erro de cache, usar método alternativo
        if (error.status === 400 && error.error?.mensagem?.includes('cache')) {
          console.log('🔧 Erro de cache detectado, usando método alternativo...');
          this.loadClientsAlternative();
        } else {
          this.error = 'Erro ao carregar lista de clientes';
          this.loading = false;
        }
      }
    });
  }

  /**
   * 🔧 MÉTODO ALTERNATIVO: Busca todos os clientes e filtra pelo doctor
   * Solução temporária para o problema de cache da API
   */
  loadClientsAlternative(): void {
    console.log('🔧 Carregando clientes via método alternativo...');

    this.clientService.getAllClients().subscribe({
      next: (allClients) => {
        console.log('📊 Total de clientes recebidos:', allClients.length);

        // TODO: Implementar lógica de filtro por doctor
        // Por enquanto, mostra todos os clientes como fallback
        this.clients = allClients;
        this.filteredClients = allClients;
        this.loading = false;

        console.log('⚠️ ATENÇÃO: Mostrando todos os clientes (fallback temporário)');
        console.log('🔧 Necessário implementar filtro por doctor ou corrigir cache na API');
      },
      error: (error) => {
        console.error('❌ Erro no método alternativo:', error);
        this.error = 'Erro ao carregar lista de clientes (métodos primário e alternativo falharam)';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredClients = this.clients.filter(client =>
      client.name?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.toLowerCase().includes(term)
    );
  }

  viewClient(clientId: number): void {
    this.router.navigate(['/client-dashboard', clientId]);
  }

  editClient(clientId: number): void {
    this.router.navigate(['/clients-edit', clientId]);
  }

  goToClientMeasure(clientId: number): void {
    this.router.navigate(['/client-measure', clientId]);
  }

  calculateAge(dateOfBirth: Date | string | number[] | undefined): number | null {
    if (!dateOfBirth) return null;

    let birthDate: Date;

    if (Array.isArray(dateOfBirth)) {
      // Array format: [year, month, day, ...]
      birthDate = new Date(dateOfBirth[0], dateOfBirth[1] - 1, dateOfBirth[2]);
    } else if (typeof dateOfBirth === 'string') {
      birthDate = new Date(dateOfBirth);
    } else {
      birthDate = dateOfBirth;
    }

    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }

    return age;
  }

  formatDateOfBirth(dateOfBirth: Date | string | number[] | undefined): string {
    if (!dateOfBirth) return '-';

    let birthDate: Date;

    if (Array.isArray(dateOfBirth)) {
      birthDate = new Date(dateOfBirth[0], dateOfBirth[1] - 1, dateOfBirth[2]);
    } else if (typeof dateOfBirth === 'string') {
      birthDate = new Date(dateOfBirth);
    } else {
      birthDate = dateOfBirth;
    }

    return birthDate.toLocaleDateString('pt-BR');
  }

  goBack(): void {
    this.router.navigate(['/doctor-list']);
  }
}
