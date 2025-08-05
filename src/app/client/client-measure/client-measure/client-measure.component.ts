import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../services/client/client.service';
import { MeasureService } from '../../../services/measure/measure.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Models
import { Client } from '../../../models/client';
import { Measure } from '../../../models/measure';

@Component({
  selector: 'app-client-measure',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './client-measure.component.html',
  styleUrl: './client-measure.component.scss'
})
export class ClientMeasureComponent implements OnInit {
  private clientService = inject(ClientService);
  private measureService = inject(MeasureService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clientId: number | null = null;
  client: Client | null = null;
  measures: Measure | null = null;
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
        return this.loadClientMeasures(clientId);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.client = data.client;
          this.measures = data.measures;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar medidas do cliente:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private loadClientMeasures(clientId: number): Observable<{ client: Client; measures: Measure | null }> {
    return forkJoin({
      client: this.clientService.getClientById(clientId).pipe(catchError(() => of(null))),
      measures: this.measureService.getMeasureByClientId(clientId).pipe(catchError(() => of(null)))
    }).pipe(
      map(({ client, measures }) => {
        if (!client) {
          throw new Error('Cliente não encontrado');
        }
        return { client, measures };
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

  navigateToEditMeasures() {
    if (this.clientId) {
      this.router.navigate(['/edit-measures', this.clientId]);
    }
  }

  calculateBMI(): number | null {
    if (!this.client?.weight || !this.client?.height) return null;

    const heightInMeters = this.client.height / 100;
    return Number((this.client.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  getBMICategory(): string {
    const bmi = this.calculateBMI();
    if (!bmi) return 'N/A';

    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidade';
  }

  getBMIColor(): string {
    const bmi = this.calculateBMI();
    if (!bmi) return 'gray';

    if (bmi < 18.5) return '#FF9800'; // Orange
    if (bmi < 25) return '#4CAF50'; // Green
    if (bmi < 30) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }
}
