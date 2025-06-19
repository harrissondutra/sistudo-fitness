import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../../services/client/client.service';
import { Client } from '../../models/client'; // Importa a interface Client atualizada
import { Measure } from '../../models/measure'; // Importa a interface Measure
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-client-view',
  templateUrl: './client-view.component.html',
  styleUrls: ['./client-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressSpinnerModule
  ]
})
export class ClientViewComponent implements OnInit {
  client: Client | null = null;
  isLoading = false;
  // measure: any; // REMOVIDO: A medida agora está diretamente em client.measure

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.loadClient(clientId);
    } else {
      console.warn('ID do cliente não fornecido na URL.');
      this.snackBar.open('ID do cliente não encontrado.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/clients']);
    }
  }

  private loadClient(id: string): void {
    this.isLoading = true;
    this.clientService.getClientById(id).subscribe({
      next: (clientData: Client) => {
        this.client = clientData;
        this.isLoading = false;
        // Não é necessário carregar 'measure' separadamente se ele já vem no objeto client
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        this.snackBar.open('Erro ao carregar dados do cliente.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  formatMeasure(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  onBack(): void {
    this.router.navigate(['/clients']);
  }

  onEdit(): void {
    if (this.client?.id) {
      this.router.navigate(['/clients', this.client.id, 'edit']);
    } else {
      this.snackBar.open('Não é possível editar: Cliente não carregado.', 'Fechar', { duration: 3000 });
    }
  }
}
