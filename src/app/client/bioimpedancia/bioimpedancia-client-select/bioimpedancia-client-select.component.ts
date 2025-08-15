import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { ClientService } from '../../../services/client/client.service';
import { BioimpedanciaService } from '../../../services/bioimpedancia/bioimpedancia.service';
import { Client } from '../../../models/client';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-bioimpedancia-client-select',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './bioimpedancia-client-select.component.html',
  styleUrl: './bioimpedancia-client-select.component.scss'
})
export class BioimpedanciaClientSelectComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private clientService = inject(ClientService);
  private bioimpedanciaService = inject(BioimpedanciaService);
  private snackBar = inject(MatSnackBar);

  searchForm!: FormGroup;
  clients: Client[] = [];
  filteredClients: Client[] = [];
  isLoading = false;
  isSearching = false;

  displayedColumns: string[] = ['avatar', 'name', 'email', 'age', 'lastBioimpedancia', 'actions'];

  ngOnInit(): void {
    this.initializeForm();
    this.loadClients();
    this.setupSearch();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  private setupSearch(): void {
    this.searchForm.get('searchTerm')?.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.isSearching = true;
        return this.filterClients(term);
      })
    ).subscribe(filtered => {
      this.filteredClients = filtered;
      this.isSearching = false;
    });
  }

  private loadClients(): void {
    this.isLoading = true;
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        this.loadBioimpedanciaData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.showError('Erro ao carregar lista de clientes');
        this.isLoading = false;
      }
    });
  }

  private loadBioimpedanciaData(): void {
    // Carrega a última bioimpedância de cada cliente
    this.clients.forEach(client => {
      if (client.id) {
        this.bioimpedanciaService.getByClientId(client.id).subscribe({
          next: (bioimpedancias) => {
            if (bioimpedancias && bioimpedancias.length > 0) {
              // Ordena por data e pega a mais recente
              const sorted = bioimpedancias.sort((a, b) =>
                new Date(b.dataMedicao || '').getTime() - new Date(a.dataMedicao || '').getTime()
              );
              (client as any).lastBioimpedancia = sorted[0];
            }
          },
          error: (error) => {
            console.error(`Erro ao carregar bioimpedância do cliente ${client.id}:`, error);
          }
        });
      }
    });
  }

  private filterClients(searchTerm: string): Observable<Client[]> {
    if (!searchTerm.trim()) {
      return of(this.clients);
    }

    const filtered = this.clients.filter(client =>
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone?.includes(searchTerm)
    );

    return of(filtered);
  }

  calculateAge(dateOfBirth: string | Date | undefined): number | null {
    if (!dateOfBirth) return null;

    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  formatLastBioimpedancia(client: any): string {
    if (!client.lastBioimpedancia) {
      return 'Nenhuma';
    }

    const date = new Date(client.lastBioimpedancia.dataMedicao);
    return date.toLocaleDateString('pt-BR');
  }

  onCreateBioimpedancia(client: Client): void {
    if (client.id) {
      // Navega para a criação de bioimpedância passando o id do cliente
      this.router.navigate(['/bioimpedancia', client.id]);
    }
  }

  onViewHistory(clientId: number): void {
    console.log('Navegando para histórico:', clientId);
    if (clientId) { // Verifica se clientId existe
      // Forma correta de navegar com um parâmetro de rota
      this.router.navigate(['/bioimpedancia/history', clientId]);
    } else {
      this.snackBar.open('ID do cliente inválido. Não foi possível abrir o histórico.', 'Fechar', { duration: 3000 });
    }
  }

  onViewClient(client: Client): void {
    if (client.id) {
      this.router.navigate(['/client', client.id]);
    }
  }

  onBack(): void {
    this.router.navigate(['/']);
  }

  clearSearch(): void {
    this.searchForm.patchValue({ searchTerm: '' });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Getters para facilitar o acesso
  get searchTerm() {
    return this.searchForm.get('searchTerm');
  }
}
