import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TrainningService } from '../../../services/trainning/trainning.service';
import { ClientService } from '../../../services/client/client.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Models
import { Trainning } from '../../../models/trainning';
import { Client } from '../../../models/client';

@Component({
  selector: 'app-client-trainning-active',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatExpansionModule,
    RouterModule
  ],
  templateUrl: './client-trainning-active.component.html',
  styleUrl: './client-trainning-active.component.scss'
})
export class ClientTrainningActiveComponent implements OnInit {
  private trainingService = inject(TrainningService);
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clientId: number | null = null;
  client: Client | null = null;
  activeTrainings: Trainning[] = [];
  loading = true;
  error = false;

  ngOnInit() {
    this.route.params.pipe(
      map(params => {
        const id = params['id'];
        if (!id || isNaN(+id)) {
          this.error = true;
          this.loading = false;
          return null;
        }
        this.clientId = +id;
        return this.clientId;
      }),
      switchMap(clientId => {
        if (!clientId) return of(null);
        return this.loadActiveTrainings(clientId);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.client = data.client;
          this.activeTrainings = data.activeTrainings;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar treinos ativos:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private loadActiveTrainings(clientId: number): Observable<{client: Client, activeTrainings: Trainning[]}> {
    return forkJoin({
      client: this.clientService.getClientById(clientId).pipe(catchError(() => of(null))),
      trainings: this.trainingService.getTrainningByClientId(clientId).pipe(catchError(() => of([])))
    }).pipe(
      map(({ client, trainings }) => {
        if (!client) {
          throw new Error('Cliente não encontrado');
        }

        // Filtrar apenas treinos ativos
        const activeTrainings = trainings.filter((training: any) =>
          training.isActive !== false && training.isCompleted !== true
        );

        return {
          client,
          activeTrainings
        };
      })
    );
  }

  onBack() {
    if (this.clientId) {
      this.router.navigate(['/client-dashboard', this.clientId]);
    } else {
      this.router.navigate(['/clients-list']);
    }
  }

  navigateToTrainingView(trainingId: number) {
    this.router.navigate(['/trainning-view', trainingId]);
  }

  navigateToTrainingEdit(trainingId: number) {
    this.router.navigate(['/trainning-edit', trainingId]);
  }

  createNewTraining() {
    if (this.clientId) {
      this.router.navigate(['/trainning-create', this.clientId]);
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  }

  calculateDaysRemaining(endDate: string | Date): number {
    if (!endDate) return 0;

    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }

  getTrainingStatus(training: any): string {
    const daysRemaining = this.calculateDaysRemaining(training.endDate);

    if (daysRemaining === 0) return 'Termina hoje';
    if (daysRemaining === 1) return '1 dia restante';
    if (daysRemaining <= 7) return `${daysRemaining} dias restantes`;
    if (daysRemaining <= 30) return `${daysRemaining} dias restantes`;

    return 'Em andamento';
  }

  getStatusColor(training: any): string {
    const daysRemaining = this.calculateDaysRemaining(training.endDate);

    if (daysRemaining <= 3) return 'warn';
    if (daysRemaining <= 7) return 'accent';

    return 'primary';
  }

  formatDateRange(startDate: string | Date | null | undefined, endDate: string | Date | null | undefined): string {
    if (!startDate && !endDate) return 'Datas não definidas';
    if (!startDate && endDate) return `Até ${this.formatDate(endDate)}`;
    if (startDate && !endDate) return `Desde ${this.formatDate(startDate)}`;
    if (startDate && endDate) return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;

    return 'Datas não definidas';
  }

  getTotalExercises(): number {
    return this.activeTrainings.reduce((total, training) => {
      return total + (training.exercises?.length || 0);
    }, 0);
  }

  getAverageProgress(): number {
    if (this.activeTrainings.length === 0) return 0;

    // Calcular progresso baseado nos dias decorridos
    const totalProgress = this.activeTrainings.reduce((sum, training) => {
      const startDate = new Date(training.startDate || '');
      const endDate = new Date(training.endDate || '');
      const today = new Date();

      if (!training.startDate || !training.endDate) return sum;

      const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const elapsedDays = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

      return sum + Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
    }, 0);

    return Math.round(totalProgress / this.activeTrainings.length);
  }

  getStatusClass(training: any): string {
    const daysRemaining = this.calculateDaysRemaining(training.endDate);

    if (daysRemaining <= 3) return 'status-urgent';
    if (daysRemaining <= 7) return 'status-warning';
    return 'status-active';
  }

  getStatusIcon(training: any): string {
    const daysRemaining = this.calculateDaysRemaining(training.endDate);

    if (daysRemaining <= 3) return 'warning';
    if (daysRemaining <= 7) return 'schedule';
    return 'check_circle';
  }

  executeTraining(trainingId: number): void {
    this.router.navigate(['/training-execution', trainingId]);
  }

  getEstimatedDuration(training: any): number {
    const exerciseCount = training.exercises?.length || 0;
    const avgTimePerExercise = 3; // 3 minutos por exercício em média
    const restTime = Math.max(0, exerciseCount - 1) * 1; // 1 minuto de descanso entre exercícios

    return exerciseCount * avgTimePerExercise + restTime;
  }

  getDifficultyLevel(training: any): string {
    const exerciseCount = training.exercises?.length || 0;

    if (exerciseCount <= 5) return 'Iniciante';
    if (exerciseCount <= 10) return 'Intermediário';
    return 'Avançado';
  }

  getTrainingProgress(training: any): number {
    if (!training.startDate || !training.endDate) return 0;

    const startDate = new Date(training.startDate);
    const endDate = new Date(training.endDate);
    const today = new Date();

    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(0, Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    return Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
  }
}
