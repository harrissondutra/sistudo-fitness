import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Models
import { Doctor } from '../../../models/doctor';
import { Personal } from '../../../models/personal';
import { Nutritionist } from '../../../models/nutritionist';
import { Client } from '../../../models/client';

// Services
import { ClientService } from '../../../services/client/client.service';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { PersonalService } from '../../../services/personal/personal.service';
import { NutritionistService } from '../../../services/nutritionist/nutritionist.service';

interface ClientProfessionalsData {
  client: Client;
  doctors: Doctor[];
  personals: Personal[];
  nutritionists: Nutritionist[];
}

@Component({
  selector: 'app-client-professionals',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    RouterModule
  ],
  templateUrl: './client-professionals.component.html',
  styleUrl: './client-professionals.component.scss'
})
export class ClientProfessionalsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private clientService = inject(ClientService);
  private doctorService = inject(DoctorService);
  private personalService = inject(PersonalService);
  private nutritionistService = inject(NutritionistService);

  clientId!: number;
  professionalsData: ClientProfessionalsData | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clientId = +params['id'];
      if (this.clientId) {
        this.loadProfessionalsData();
      }
    });
  }

  loadProfessionalsData(): void {
    this.loading = true;
    this.error = null;

    // Load client data and all associated professionals
    const client$ = this.clientService.getClientById(this.clientId).pipe(
      catchError(() => of(null))
    );

    const doctors$ = this.doctorService.getDoctorByClientId(this.clientId).pipe(
      catchError(() => of([]))
    );

    const personals$ = this.personalService.getPersonalByClientId(this.clientId).pipe(
      catchError(() => of([]))
    );

    const nutritionists$ = this.nutritionistService.getNutritionistByClientId(this.clientId).pipe(
      catchError(() => of([]))
    );

    forkJoin({
      client: client$,
      doctors: doctors$,
      personals: personals$,
      nutritionists: nutritionists$
    }).subscribe({
      next: (data) => {
        if (data.client) {
          this.professionalsData = {
            client: data.client,
            doctors: data.doctors,
            personals: data.personals,
            nutritionists: data.nutritionists
          };
        } else {
          this.error = 'Cliente não encontrado';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados dos profissionais:', error);
        this.error = 'Erro ao carregar dados dos profissionais';
        this.loading = false;
      }
    });
  }

  // Navigation methods
  navigateToDoctorView(doctorId: number): void {
    if (doctorId) {
      this.router.navigate(['/doctor-view', doctorId]);
    }
  }

  navigateToPersonalView(personalId: number): void {
    if (personalId) {
      this.router.navigate(['/personal-view', personalId]);
    }
  }

  navigateToNutritionistView(nutritionistId: number): void {
    if (nutritionistId) {
      this.router.navigate(['/nutritionist-view', nutritionistId]);
    }
  }

  navigateToClientDashboard(): void {
    this.router.navigate(['/client-dashboard', this.clientId]);
  }

  onBack(): void {
    this.navigateToClientDashboard();
  }

  // Utility methods
  formatCRM(crm: string): string {
    return crm ? `CRM: ${crm}` : 'CRM não informado';
  }

  formatCREF(cref: string): string {
    return cref ? `CREF: ${cref}` : 'CREF não informado';
  }

  formatCRN(crn: string): string {
    return crn ? `CRN: ${crn}` : 'CRN não informado';
  }

  getTotalProfessionals(): number {
    if (!this.professionalsData) return 0;
    return this.professionalsData.doctors.length +
           this.professionalsData.personals.length +
           this.professionalsData.nutritionists.length;
  }

  // Methods for opening associate dialogs
  openAssociateDoctorDialog() {
    this.openAssociateProfessionalDialog('doctor');
  }

  openAssociatePersonalDialog() {
    this.openAssociateProfessionalDialog('personal');
  }

  openAssociateNutritionistDialog() {
    this.openAssociateProfessionalDialog('nutritionist');
  }

  private openAssociateProfessionalDialog(type: 'doctor' | 'personal' | 'nutritionist') {
    if (!this.clientId || !this.professionalsData) {
      console.error('Client ID or professionals data not found');
      return;
    }

    // Get current associated IDs based on type
    let currentAssociatedIds: number[] = [];
    switch (type) {
      case 'doctor':
        currentAssociatedIds = this.professionalsData.doctors.map(d => d.id).filter(id => id !== undefined);
        break;
      case 'personal':
        currentAssociatedIds = this.professionalsData.personals.map(p => p.id).filter(id => id !== undefined);
        break;
      case 'nutritionist':
        currentAssociatedIds = this.professionalsData.nutritionists.map(n => n.id).filter(id => id !== undefined);
        break;
    }

    // Import the dialog component dynamically
    import('../../client-dashboard/associate-professional-dialog/associate-professional-dialog.component').then(
      ({ AssociateProfessionalDialogComponent }) => {
        const dialogRef = this.dialog.open(AssociateProfessionalDialogComponent, {
          width: '600px',
          maxWidth: '90vw',
          data: {
            clientId: this.clientId,
            clientName: this.professionalsData?.client?.name || 'Cliente',
            professionalType: type,
            currentAssociatedIds: currentAssociatedIds
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result?.success) {
            // Reload professionals data to reflect changes
            this.loadProfessionalsData();
          }
        });
      }
    ).catch(error => {
      console.error('Error loading dialog component:', error);
    });
  }
}
