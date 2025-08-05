import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../services/client/client.service';
import { TrainningService } from '../../../services/trainning/trainning.service';
import { MeasureService } from '../../../services/measure/measure.service';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { PersonalService } from '../../../services/personal/personal.service';
import { NutritionistService } from '../../../services/nutritionist/nutritionist.service';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Models
import { Client } from '../../../models/client';
import { Measure } from '../../../models/measure';
import { Doctor } from '../../../models/doctor';
import { Personal } from '../../../models/personal';
import { Nutritionist } from '../../../models/nutritionist';
import { Trainning } from '../../../models/trainning';

interface ClientDashboardData {
  client: Client;
  clientTrainings: Trainning[];
  clientMeasures: Measure | null;
  associatedDoctors: Doctor[];
  associatedPersonals: Personal[];
  associatedNutritionists: Nutritionist[];
  totalTrainings: number;
  activeTrainings: number;
  completedTrainings: number;
  recentActivities: any[];
}

interface PanelState {
  measures: boolean;
  doctors: boolean;
  personals: boolean;
  nutritionists: boolean;
  trainings: boolean;
  history: boolean;
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent implements OnInit {
  private clientService = inject(ClientService);
  private trainingService = inject(TrainningService);
  private measureService = inject(MeasureService);
  private doctorService = inject(DoctorService);
  private personalService = inject(PersonalService);
  private nutritionistService = inject(NutritionistService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clientId: number | null = null;
  dashboardData: ClientDashboardData = {
    client: null as any,
    clientTrainings: [],
    clientMeasures: null,
    associatedDoctors: [],
    associatedPersonals: [],
    associatedNutritionists: [],
    totalTrainings: 0,
    activeTrainings: 0,
    completedTrainings: 0,
    recentActivities: []
  };

  // Panel states for expansion panels
  panelOpenState: PanelState = {
    measures: true,
    doctors: false,
    personals: false,
    nutritionists: false,
    trainings: true,
    history: false
  };

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
        return this.loadClientDashboardData(clientId);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.dashboardData = data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dashboard do cliente:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private loadClientDashboardData(clientId: number): Observable<ClientDashboardData> {
    return forkJoin({
      client: this.clientService.getClientById(clientId).pipe(catchError(() => of(null))),
      trainings: this.trainingService.getTrainningByClientId(clientId).pipe(catchError(() => of([]))),
      measures: this.measureService.getMeasureByClientId(clientId).pipe(catchError(() => of(null))),
      doctors: this.doctorService.getDoctorByClientId(clientId).pipe(catchError(() => of([]))),
      personals: this.personalService.getPersonalByClientId(clientId).pipe(catchError(() => of([]))),
      nutritionists: this.nutritionistService.getNutritionistByClientId(clientId).pipe(catchError(() => of([])))
    }).pipe(
      map(({ client, trainings, measures, doctors, personals, nutritionists }) => {
        if (!client) {
          throw new Error('Cliente não encontrado');
        }

        // Calcular métricas de treinos
        const totalTrainings = trainings.length;
        const activeTrainings = trainings.filter((training: any) => training.isActive !== false).length;
        const completedTrainings = trainings.filter((training: any) => training.isCompleted === true).length;

        // Atividades recentes (últimos treinos ou medidas)
        const recentActivities = trainings
          .sort((a: any, b: any) => new Date(b.startDate || b.createdAt).getTime() - new Date(a.startDate || a.createdAt).getTime())
          .slice(0, 5);

        return {
          client,
          clientTrainings: trainings,
          clientMeasures: measures,
          associatedDoctors: Array.isArray(doctors) ? doctors : [],
          associatedPersonals: Array.isArray(personals) ? personals : [],
          associatedNutritionists: Array.isArray(nutritionists) ? nutritionists : [],
          totalTrainings,
          activeTrainings,
          completedTrainings,
          recentActivities
        };
      })
    );
  }

  calculateAge(dateOfBirth: string | Date | number[] | undefined): number | null {
    if (!dateOfBirth) return null;

    let birth: Date;
    if (Array.isArray(dateOfBirth)) {
      // Se for array [year, month, day], converter para Date
      birth = new Date(dateOfBirth[0], dateOfBirth[1] - 1, dateOfBirth[2]);
    } else {
      birth = new Date(dateOfBirth);
    }

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  getBMI(): number | null {
    const client = this.dashboardData.client;
    if (!client?.height || !client?.weight) return null;

    const heightInMeters = client.height / 100;
    return Number((client.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  onBack() {
    this.router.navigate(['/clients-list']);
  }

  navigateToClientView() {
    if (this.clientId) {
      this.router.navigate(['/client', this.clientId]);
    }
  }

  navigateToTrainingCreate() {
    if (this.clientId) {
      this.router.navigate(['/trainning-create', this.clientId]);
    }
  }

  navigateToEditClient() {
    if (this.clientId) {
      this.router.navigate(['/clients-edit', this.clientId]);
    }
  }

  navigateToTrainingHistory() {
    if (this.clientId) {
      this.router.navigate(['/trainnings'], {
        queryParams: { clientId: this.clientId }
      });
    }
  }

  navigateToActiveTrainings() {
    if (this.clientId) {
      this.router.navigate(['/client-trainning-active', this.clientId]);
    }
  }

  navigateToInactiveTrainings() {
    if (this.clientId) {
      this.router.navigate(['/client-trainning-inactive', this.clientId]);
    }
  }

  navigateToClientMeasures() {
    if (this.clientId) {
      this.router.navigate(['/client-measure', this.clientId]);
    }
  }

  navigateToClientMeasureHistory() {
    if (this.clientId) {
      this.router.navigate(['/client-measure-history', this.clientId]);
    }
  }

  navigateToAssociatedDoctors() {
    if (this.clientId) {
      this.router.navigate(['/doctor-list'], {
        queryParams: { clientId: this.clientId }
      });
    }
  }

  navigateToAssociatedPersonals() {
    if (this.clientId) {
      this.router.navigate(['/personal-list'], {
        queryParams: { clientId: this.clientId }
      });
    }
  }

  navigateToAssociatedNutritionists() {
    if (this.clientId) {
      this.router.navigate(['/nutritionist-list'], {
        queryParams: { clientId: this.clientId }
      });
    }
  }

  navigateToDoctorView(doctorId: number | undefined) {
    if (doctorId) {
      this.router.navigate(['/doctor-view', doctorId]);
    }
  }

  navigateToPersonalView(personalId: number | undefined) {
    if (personalId) {
      this.router.navigate(['/personal-view', personalId]);
    }
  }

  navigateToNutritionistView(nutritionistId: number | undefined) {
    if (nutritionistId) {
      this.router.navigate(['/nutritionist-view', nutritionistId]);
    }
  }

  navigateToAllProfessionals() {
    if (this.clientId) {
      this.router.navigate(['/client-professionals', this.clientId]);
    }
  }

  // Panel control methods
  expandAllPanels() {
    Object.keys(this.panelOpenState).forEach(key => {
      this.panelOpenState[key as keyof PanelState] = true;
    });
  }

  collapseAllPanels() {
    Object.keys(this.panelOpenState).forEach(key => {
      this.panelOpenState[key as keyof PanelState] = false;
    });
  }

  // Utility methods for displaying professional data
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    // Format phone number: (XX) XXXXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  }

  formatCRM(crm: string): string {
    return crm ? `CRM: ${crm}` : '';
  }

  formatCREF(registry: string): string {
    return registry ? `CREF: ${registry}` : '';
  }

  formatCRN(registry: string): string {
    return registry ? `CRN: ${registry}` : '';
  }
}
