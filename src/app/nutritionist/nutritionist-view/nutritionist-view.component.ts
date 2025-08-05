import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { IonicModule } from '@ionic/angular';
import { environment } from '../../../environments/environment';
import { Nutritionist } from '../../models/nutritionist';
import { Client } from '../../models/client';
import { NutritionistService } from '../../services/nutritionist/nutritionist.service';

@Component({
  selector: 'app-nutritionist-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    IonicModule
  ],
  templateUrl: './nutritionist-view.component.html',
  styleUrl: './nutritionist-view.component.scss'
})
export class NutritionistViewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  router = inject(Router); // Made public for template access
  private snackBar = inject(MatSnackBar);
  private nutritionistService = inject(NutritionistService);

  nutritionistForm!: FormGroup;
  nutritionist: Nutritionist | null = null;
  nutritionistClients: Client[] = [];
  isLoading = false;
  isEditing = false;
  isSaving = false;
  nutritionistId: string = '';

  ngOnInit() {
    this.initializeForm();
    this.loadNutritionistData();
  }

  private initializeForm() {
    this.nutritionistForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      specialty: ['', [Validators.required]],
      registry: ['', [Validators.required]]
    });
  }

  private loadNutritionistData() {
    this.nutritionistId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.nutritionistId) {
      this.showMessage('ID do nutricionista não fornecido', 'error');
      this.onBack();
      return;
    }

    this.isLoading = true;

    this.nutritionistService.getNutritionistById(this.nutritionistId).subscribe({
      next: (nutritionist: Nutritionist) => {
        this.nutritionist = nutritionist;
        this.populateForm();
        this.loadNutritionistClients();
      },
      error: (error: any) => {
        console.error('Erro ao carregar nutricionista:', error);
        this.showMessage('Erro ao carregar dados do nutricionista', 'error');
        this.isLoading = false;
      }
    });
  }

  private populateForm() {
    if (this.nutritionist) {
      this.nutritionistForm.patchValue({
        name: this.nutritionist.name || '',
        email: this.nutritionist.email || '',
        phone: this.nutritionist.phone || '',
        specialty: this.nutritionist.specialty || '',
        registry: this.nutritionist.registry || ''
      });
    }
  }

  private loadNutritionistClients() {
    if (!this.nutritionistId) return;

    // Buscar clientes associados ao nutricionista usando o endpoint específico
    this.nutritionistService.getClientsByNutritionistId(parseInt(this.nutritionistId)).subscribe({
      next: (clients: Client[]) => {
        this.nutritionistClients = clients || [];
        this.isLoading = false;
        console.log('Clientes carregados para nutricionista ID', this.nutritionistId, ':', this.nutritionistClients);
      },
      error: (error: any) => {
        console.error('Erro ao carregar clientes do nutricionista:', error);
        this.nutritionistClients = [];
        this.isLoading = false;
        this.showMessage('Erro ao carregar clientes associados', 'error');
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      this.nutritionistForm.enable();
    } else {
      this.nutritionistForm.disable();
      this.populateForm();
    }
  }

  onSave() {
    if (this.nutritionistForm.invalid || !this.nutritionist) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    const formData = this.nutritionistForm.value;

    const updatedNutritionist: Nutritionist = {
      ...this.nutritionist,
      ...formData
    };

    this.nutritionistService.updateNutritionist(updatedNutritionist).subscribe({
      next: (updated: Nutritionist) => {
        this.nutritionist = updated;
        this.isEditing = false;
        this.isSaving = false;
        this.nutritionistForm.disable();
        this.showMessage('Nutricionista atualizado com sucesso!', 'success');
      },
      error: (error: any) => {
        console.error('Erro ao atualizar nutricionista:', error);
        this.showMessage('Erro ao atualizar nutricionista', 'error');
        this.isSaving = false;
      }
    });
  }

  onCancel() {
    this.isEditing = false;
    this.nutritionistForm.disable();
    this.populateForm();
  }

  onDelete() {
    if (!this.nutritionist?.id) return;

    if (confirm('Tem certeza que deseja excluir este nutricionista?')) {
      this.nutritionistService.deleteNutritionist(this.nutritionist.id.toString()).subscribe({
        next: () => {
          this.showMessage('Nutricionista excluído com sucesso!', 'success');
          this.onBack();
        },
        error: (error: any) => {
          console.error('Erro ao excluir nutricionista:', error);
          this.showMessage('Erro ao excluir nutricionista', 'error');
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['/nutritionist-list']);
  }

  // Método de debug - pode ser chamado no console do browser
  debugClients() {
    console.log('=== DEBUG CLIENTS INFO ===');
    console.log('nutritionistId:', this.nutritionistId);
    console.log('nutritionist:', this.nutritionist);
    console.log('nutritionistClients:', this.nutritionistClients);
    console.log('URL being called:', `${environment.apiUrl}/nutritionists/getClientsByNutritionistId/${this.nutritionistId}`);

    // Força uma nova chamada da API
    if (this.nutritionistId) {
      console.log('🔄 Forçando nova chamada da API...');
      this.loadNutritionistClients();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.nutritionistForm.controls).forEach(key => {
      const control = this.nutritionistForm.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.nutritionistForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors?.['minlength']?.requiredLength} caracteres`;
    }
    if (field?.hasError('pattern')) {
      return `${this.getFieldLabel(fieldName)} deve estar no formato (99) 99999-9999`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      registry: 'Registro',
      specialty: 'Especialidade',
      email: 'Email',
      phone: 'Telefone'
    };
    return labels[fieldName] || fieldName;
  }
}
