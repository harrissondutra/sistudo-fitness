import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PersonalService } from '../../services/personal/personal.service';
import { Personal } from '../../models/personal';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-personal-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    IonicModule
  ],
  templateUrl: './personal-create.component.html',
  styleUrl: './personal-create.component.scss'
})
export class PersonalCreateComponent implements OnInit {
  personalForm!: FormGroup;
  isLoading = false;

  // Lista de especialidades para o select
  especialidades = [
    { value: 'musculacao', viewValue: 'Musculação' },
    { value: 'funcional', viewValue: 'Treinamento Funcional' },
    { value: 'pilates', viewValue: 'Pilates' },
    { value: 'crossfit', viewValue: 'CrossFit' },
    { value: 'yoga', viewValue: 'Yoga' },
    { value: 'natacao', viewValue: 'Natação' },
    { value: 'corrida', viewValue: 'Corrida' }
  ];

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.personalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      specialty: ['', Validators.required],
      registry: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.personalForm.valid) {
      this.isLoading = true;
      const formData = { ...this.personalForm.value };

      console.log('Dados a serem enviados:', formData);

      this.personalService.createPersonal(formData).subscribe({
        next: (response) => {
          console.log('Personal cadastrado com sucesso!', response);
          this.snackBar.open('Personal trainer cadastrado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/personal-list']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao cadastrar Personal:', error);
          this.snackBar.open('Erro ao cadastrar personal trainer. Tente novamente.', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      console.error('Formulário inválido:', this.personalForm);
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', { duration: 3000 });
      this.personalForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/personal-list']);
  }
}
