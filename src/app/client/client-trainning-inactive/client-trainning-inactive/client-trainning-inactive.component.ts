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
  selector: 'app-client-trainning-inactive',
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
  templateUrl: './client-trainning-inactive.component.html',
  styleUrl: './client-trainning-inactive.component.scss'
})
export class ClientTrainningInactiveComponent implements OnInit {
  private trainingService = inject(TrainningService);
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clientId: number | null = null;
  client: Client | null = null;
  inactiveTrainings: Trainning[] = [];
  completedTrainings: Trainning[] = [];
  expiredTrainings: Trainning[] = [];
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
        return this.loadInactiveTrainings(clientId);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.client = data.client;
          this.inactiveTrainings = data.inactiveTrainings;
          this.completedTrainings = data.completedTrainings;
          this.expiredTrainings = data.expiredTrainings;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar treinos inativos:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private loadInactiveTrainings(clientId: number): Observable<{
    client: Client,
    inactiveTrainings: Trainning[],
    completedTrainings: Trainning[],
    expiredTrainings: Trainning[]
  }> {
    return forkJoin({
      client: this.clientService.getClientById(clientId).pipe(catchError(() => of(null))),
      trainings: this.trainingService.getTrainningByClientId(clientId).pipe(catchError(() => of([])))
    }).pipe(
      map(({ client, trainings }) => {
        if (!client) {
          throw new Error('Cliente não encontrado');
        }

        // Separar treinos por categoria
        const completedTrainings = trainings.filter((training: any) =>
          training.isCompleted === true
        );

        const expiredTrainings = trainings.filter((training: any) =>
          training.isActive === false && training.isCompleted !== true && this.isExpired(training.endDate)
        );

        const inactiveTrainings = trainings.filter((training: any) =>
          training.isActive === false && training.isCompleted !== true && !this.isExpired(training.endDate)
        );

        return {
          client,
          inactiveTrainings,
          completedTrainings,
          expiredTrainings
        };
      })
    );
  }

  private isExpired(endDate: string | Date | null): boolean {
    if (!endDate) return false;

    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const today = new Date();

    return end < today;
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

  reactivateTraining(trainingId: number) {
    // Implementar lógica para reativar treino
    console.log('Reativar treino:', trainingId);
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  }

  formatDateRange(startDate: string | Date | null | undefined, endDate: string | Date | null | undefined): string {
    const start = startDate ? this.formatDate(startDate) : '';
    const end = endDate ? this.formatDate(endDate) : '';

    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return `Iniciado em: ${start}`;
    } else if (end) {
      return `Finalizado em: ${end}`;
    }

    return 'Datas não informadas';
  }

  getTrainingStatus(training: any): string {
    if (training.isCompleted === true) {
      return 'Concluído';
    }

    if (this.isExpired(training.endDate)) {
      return 'Expirado';
    }

    return 'Inativo';
  }

  getStatusColor(training: any): string {
    if (training.isCompleted === true) {
      return 'primary';
    }

    if (this.isExpired(training.endDate)) {
      return 'warn';
    }

    return 'accent';
  }

  getTotalInactive(): number {
    return this.inactiveTrainings.length + this.completedTrainings.length + this.expiredTrainings.length;
  }
}
