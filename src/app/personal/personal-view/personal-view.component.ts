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
import { Personal } from '../../models/personal';
import { Client } from '../../models/client';
import { PersonalService } from '../../services/personal/personal.service';

@Component({
  selector: 'app-personal-view',
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
  templateUrl: './personal-view.component.html',
  styleUrl: './personal-view.component.scss'
})
export class PersonalViewComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private personalService = inject(PersonalService);

  personalForm!: FormGroup;
  personal: Personal | null = null;
  personalClients: Client[] = [];
  isLoading = false;
  isEditing = false;
  isSaving = false;
  personalId: string = '';

  ngOnInit() {
    this.initializeForm();
    this.loadPersonalData();
  }

  private initializeForm() {
    this.personalForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      specialty: ['', [Validators.required]],
      registry: ['', [Validators.required]]
    });
  }

  private loadPersonalData() {
    this.personalId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.personalId) {
      this.showMessage('ID do personal trainer não fornecido', 'error');
      this.goBack();
      return;
    }

    this.isLoading = true;

    // Carregamento real dos dados do banco
    this.personalService.getPersonalById(parseInt(this.personalId)).subscribe({
      next: (personal: Personal) => {
        this.personal = personal;
        this.populateForm();
        this.loadPersonalClients();
      },
      error: (error: any) => {
        console.error('Erro ao carregar personal trainer:', error);
        this.showMessage('Erro ao carregar dados do personal trainer', 'error');
        this.isLoading = false;
      }
    });
  }

  private populateForm() {
    if (this.personal) {
      this.personalForm.patchValue({
        name: this.personal.name || '',
        email: this.personal.email || '',
        phone: this.personal.phone || '',
        specialty: this.personal.specialty || '',
        registry: this.personal.registry || ''
      });
    }
  }

  private loadPersonalClients() {
    if (!this.personalId) return;

    // Buscar clientes associados ao personal trainer usando o endpoint específico
    this.personalService.getClientsByPersonalId(parseInt(this.personalId)).subscribe({
      next: (clients: Client[]) => {
        this.personalClients = clients || [];
        this.isLoading = false;
        console.log('Clientes carregados para personal ID', this.personalId, ':', this.personalClients);
      },
      error: (error: any) => {
        console.error('Erro ao carregar clientes do personal trainer:', error);
        this.personalClients = [];
        this.isLoading = false;
        this.showMessage('Erro ao carregar clientes associados', 'error');
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      this.personalForm.enable();
    } else {
      this.personalForm.disable();
      this.populateForm(); // Resetar para valores originais
    }
  }

  onSave() {
    if (this.personalForm.invalid || !this.personal) {
      this.markFormGroupTouched();
      return;
    }

    this.isSaving = true;
    const formData = this.personalForm.value;

    // Preparar dados para atualização
    const updatedPersonal: Personal = {
      ...this.personal,
      ...formData,
      updatedAt: new Date().toISOString()
    };

    // Atualização real usando o serviço
    this.personalService.updatePersonal(updatedPersonal).subscribe({
      next: (updated: Personal) => {
        this.personal = updated;
        this.isEditing = false;
        this.isSaving = false;
        this.personalForm.disable();
        this.showMessage('Personal trainer atualizado com sucesso!', 'success');
      },
      error: (error: any) => {
        console.error('Erro ao atualizar personal trainer:', error);
        this.showMessage('Erro ao atualizar personal trainer', 'error');
        this.isSaving = false;
      }
    });
  }

  onCancel() {
    this.isEditing = false;
    this.personalForm.disable();
    this.populateForm(); // Resetar para valores originais
  }

  viewClient(clientId: string) {
    if (clientId) {
      this.router.navigate(['/client', clientId]);
    }
  }

  goBack() {
    this.router.navigate(['/personal-list']);
  }

  private markFormGroupTouched() {
    Object.keys(this.personalForm.controls).forEach(key => {
      const control = this.personalForm.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(message: string, type: 'success' | 'error' = 'success') {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snack-success' : 'snack-error'
    });
  }
}
