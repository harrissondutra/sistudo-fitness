import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { PersonalService } from '../../../services/personal/personal.service';
import { NutritionistService } from '../../../services/nutritionist/nutritionist.service';

export interface AssociateProfessionalDialogData {
  clientId: number;
  clientName: string;
  professionalType: 'doctor' | 'personal' | 'nutritionist';
  currentAssociatedIds: number[];
}

interface Professional {
  id: number;
  name: string;
  registry?: string;
  crm?: string;
  specialty?: string;
  email?: string;
  phone?: string;
  selected?: boolean;
}

@Component({
  selector: 'app-associate-professional-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatCardModule,
    FormsModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>{{ getIcon() }}</mat-icon>
          Associar {{ getProfessionalTypeName() }}
        </h2>
        <p class="dialog-subtitle">Cliente: {{ data.clientName }}</p>
      </div>

      <div mat-dialog-content class="dialog-content">
        @if (loading) {
          <div class="loading-container">
            <mat-progress-spinner diameter="50"></mat-progress-spinner>
            <p>Carregando {{ getProfessionalTypeName(true) }}...</p>
          </div>
        } @else if (error) {
          <div class="error-container">
            <mat-icon class="error-icon">error</mat-icon>
            <p class="error-message">{{ error }}</p>
            <button mat-button color="primary" (click)="loadProfessionals()">
              <mat-icon>refresh</mat-icon>
              Tentar Novamente
            </button>
          </div>
        } @else if (professionals.length === 0) {
          <div class="empty-container">
            <mat-icon class="empty-icon">{{ getIcon() }}</mat-icon>
            <p class="empty-message">Nenhum {{ getProfessionalTypeName(true).toLowerCase() }} disponível</p>
          </div>
        } @else {
          <div class="professionals-list">
            @for (professional of professionals; track professional.id) {
              <div class="professional-item" [class.selected]="professional.selected">
                <mat-checkbox
                  [(ngModel)]="professional.selected"
                  [disabled]="isCurrentlyAssociated(professional.id)"
                  (change)="onSelectionChange()">
                </mat-checkbox>

                <div class="professional-info">
                  <div class="professional-main">
                    <h4 class="professional-name">{{ formatProfessionalName(professional) }}</h4>
                    <p class="professional-registry">{{ formatRegistry(professional) }}</p>
                  </div>

                  @if (professional.specialty) {
                    <p class="professional-specialty">{{ professional.specialty }}</p>
                  }

                  @if (isCurrentlyAssociated(professional.id)) {
                    <div class="already-associated">
                      <mat-icon>check_circle</mat-icon>
                      <span>Já associado</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <div class="selection-summary">
            <p>{{ getSelectedCount() }} {{ getProfessionalTypeName(true).toLowerCase() }} selecionado(s)</p>
          </div>
        }
      </div>

      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!hasSelection() || saving"
          (click)="onConfirm()">
          @if (saving) {
            Associando...
          } @else {
            Associar Selecionados
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      width: 600px;
      max-width: 90vw;
    }

    .dialog-header {
      margin-bottom: 20px;

      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 8px 0;
        color: #333;
        font-size: 1.5rem;

        mat-icon {
          color: #00A86B;
        }
      }

      .dialog-subtitle {
        margin: 0;
        color: #666;
        font-size: 0.95rem;
      }
    }

    .dialog-content {
      max-height: 500px;
      overflow-y: auto;
    }

    .loading-container,
    .error-container,
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      gap: 16px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;

        &.error-icon {
          color: #f44336;
        }

        &.empty-icon {
          color: #999;
        }
      }

      p {
        margin: 0;
        color: #666;
      }
    }

    .professionals-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .professional-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:hover:not(.selected) {
        border-color: #00A86B;
        background-color: #f8fcfa;
      }

      &.selected {
        border-color: #00A86B;
        background-color: #f0f9f4;
      }

      mat-checkbox {
        margin-top: 4px;
      }
    }

    .professional-info {
      flex: 1;

      .professional-main {
        margin-bottom: 8px;

        .professional-name {
          margin: 0 0 4px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .professional-registry {
          margin: 0;
          font-size: 0.9rem;
          color: #00A86B;
          font-weight: 500;
        }
      }

      .professional-specialty {
        margin: 0;
        font-size: 0.85rem;
        color: #666;
      }

      .already-associated {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
        color: #4caf50;
        font-size: 0.85rem;
        font-weight: 500;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .selection-summary {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      text-align: center;

      p {
        margin: 0;
        color: #666;
        font-weight: 500;
      }
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;

      button[mat-raised-button] {
        background-color: #00A86B;

        &:disabled {
          background-color: #e0e0e0;
        }

        mat-progress-spinner {
          margin-right: 8px;

          ::ng-deep circle {
            stroke: white;
          }
        }
      }
    }
  `]
})
export class AssociateProfessionalDialogComponent implements OnInit {
  professionals: Professional[] = [];
  loading = true;
  saving = false;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<AssociateProfessionalDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssociateProfessionalDialogData,
    private doctorService: DoctorService,
    private personalService: PersonalService,
    private nutritionistService: NutritionistService
  ) {}

  ngOnInit() {
    this.loadProfessionals();
  }

  loadProfessionals() {
    this.loading = true;
    this.error = null;

    let service$;
    switch (this.data.professionalType) {
      case 'doctor':
        service$ = this.doctorService.getAllDoctors();
        break;
      case 'personal':
        service$ = this.personalService.getAllPersonal();
        break;
      case 'nutritionist':
        service$ = this.nutritionistService.getAllNutritionists();
        break;
    }

    service$.subscribe({
      next: (professionals) => {
        this.professionals = professionals.map(p => ({
          ...p,
          selected: false
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar profissionais:', error);
        this.error = 'Erro ao carregar profissionais. Tente novamente.';
        this.loading = false;
      }
    });
  }

  getIcon(): string {
    switch (this.data.professionalType) {
      case 'doctor': return 'local_hospital';
      case 'personal': return 'fitness_center';
      case 'nutritionist': return 'restaurant';
      default: return 'person';
    }
  }

  getProfessionalTypeName(plural = false): string {
    switch (this.data.professionalType) {
      case 'doctor': return plural ? 'Médicos' : 'Médico';
      case 'personal': return plural ? 'Personal Trainers' : 'Personal Trainer';
      case 'nutritionist': return plural ? 'Nutricionistas' : 'Nutricionista';
      default: return plural ? 'Profissionais' : 'Profissional';
    }
  }

  formatProfessionalName(professional: Professional): string {
    if (this.data.professionalType === 'doctor') {
      return `Dr. ${professional.name}`;
    }
    return professional.name;
  }

  formatRegistry(professional: Professional): string {
    switch (this.data.professionalType) {
      case 'doctor':
        return professional.crm ? `CRM: ${professional.crm}` : '';
      case 'personal':
        return professional.registry ? `CREF: ${professional.registry}` : '';
      case 'nutritionist':
        return professional.registry ? `CRN: ${professional.registry}` : '';
      default:
        return '';
    }
  }

  isCurrentlyAssociated(professionalId: number): boolean {
    return this.data.currentAssociatedIds.includes(professionalId);
  }

  onSelectionChange() {
    // Method called when checkbox selection changes
  }

  hasSelection(): boolean {
    return this.professionals.some(p => p.selected && !this.isCurrentlyAssociated(p.id));
  }

  getSelectedCount(): number {
    return this.professionals.filter(p => p.selected && !this.isCurrentlyAssociated(p.id)).length;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onConfirm() {
    const selectedIds = this.professionals
      .filter(p => p.selected && !this.isCurrentlyAssociated(p.id))
      .map(p => p.id);

    if (selectedIds.length === 0) {
      return;
    }

    this.saving = true;

    let service$;
    switch (this.data.professionalType) {
      case 'doctor':
        service$ = this.doctorService.associateDoctorToClient(this.data.clientId, selectedIds);
        break;
      case 'personal':
        service$ = this.personalService.associatePersonalToClient(this.data.clientId, selectedIds);
        break;
      case 'nutritionist':
        service$ = this.nutritionistService.associateNutritionistToClient(this.data.clientId, selectedIds);
        break;
      default:
        return;
    }

    service$.subscribe({
      next: (result) => {
        this.dialogRef.close({ success: true, associatedIds: selectedIds });
      },
      error: (error) => {
        console.error('Erro ao associar profissionais:', error);
        this.error = 'Erro ao associar profissionais. Tente novamente.';
        this.saving = false;
      }
    });
  }
}
