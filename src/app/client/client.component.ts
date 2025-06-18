import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { ClientService } from '../services/client/client.service'; // Atualizado para ClientService
import { Client } from '../models/client'; // Atualizado para Client
import { Trainning } from '../models/trainning'; // Corrigido para importar Trainning
import { MatCardModule } from '@angular/material/card'; // Adicionado para estilização

@Component({
  selector: 'app-client', // Seletor renomeado
  standalone: true, // Adicionado standalone para componentes modernos do Angular
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatCardModule // Importado MatCardModule
  ],
  templateUrl: './client.component.html', // Template URL renomeado
  styleUrls: ['./client.component.scss'] // Style URL renomeado
})
export class ClientComponent implements OnInit { // Classe renomeada
  client: Client | null = null; // Propriedade renomeada
  currentTraining: Trainning | null = null; // Propriedade renomeada
  trainingHistory: Trainning[] = []; // Propriedade renomeada
  trainingColumns: string[] = ['startDate', 'endDate', 'goal', 'actions']; // Adicionado 'actions' para botões na tabela

  constructor(
    private clientService: ClientService, // Serviço injetado renomeado
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id'); // Variável renomeada
    if (clientId) {
      this.loadClientData(clientId); // Método renomeado
    }
  }

  private loadClientData(clientId: string): void { // Método renomeado
    this.clientService.getClientById(clientId).subscribe({ // Chamada ao serviço renomeado
      next: (client) => { // Parâmetro renomeado
        this.client = client;
        this.loadTrainings(); // Método renomeado
      },
      error: (error) => {
        console.error('Erro ao carregar dados do Cliente:', error);
        // Opcional: redirecionar ou mostrar mensagem de erro
        this.router.navigate(['/clients']); // Redireciona em caso de erro ao carregar cliente
      }
    });
  }

  private loadTrainings(): void { // Método renomeado
    if (this.client?.trainings) { // Acessando 'trainings' do objeto 'client'
      this.trainingHistory = this.client.trainings; // Atribuindo a 'trainingHistory'
      // Assumindo que você tem uma propriedade 'active' no seu modelo Training
      this.currentTraining = this.client.trainings.find(t => t.active) || null;
    }
  }

  formatMeasure(value: number | undefined | null): string { // Adicionado 'null' ao tipo
    if (value === undefined || value === null) return '-';
    return value.toFixed(1);
  }

  onBack(): void {
    this.router.navigate(['/clients']); // Rota renomeada
  }

  onEdit(): void {
    if (this.client?.id) {
      this.router.navigate(['/clients-edit', this.client.id]); // Rota renomeada
    }
  }

  // Novo método para visualizar detalhes de um treino (necessário para o HTML)
  viewTrainingDetails(training: Trainning): void {
    // Implemente a lógica para visualizar os detalhes do treino, talvez abrindo um modal ou navegando para outra rota
    console.log('Visualizar detalhes do treino:', training);
    // Exemplo: this.router.navigate(['/trainings', training.id]);
  }
}
