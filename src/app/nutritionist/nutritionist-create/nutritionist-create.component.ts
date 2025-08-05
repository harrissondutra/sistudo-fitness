import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NutritionistService } from '../../services/nutritionist/nutritionist.service';
import { Nutritionist } from '../../models/nutritionist';
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
  selector: 'app-nutritionist-create',
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
  templateUrl: './nutritionist-create.component.html',
  styleUrl: './nutritionist-create.component.scss'
})
export class NutritionistCreateComponent implements OnInit {
  nutritionistForm!: FormGroup;
  isLoading = false;

  // Lista de especialidades para o select
  especialidades = [
    { value: 'clinica', viewValue: 'Nutrição Clínica' },
    { value: 'esportiva', viewValue: 'Nutrição Esportiva' },
    { value: 'funcional', viewValue: 'Nutrição Funcional' },
    { value: 'comportamental', viewValue: 'Nutrição Comportamental' },
    { value: 'pediatrica', viewValue: 'Nutrição Pediátrica' },
    { value: 'geriatrica', viewValue: 'Nutrição Geriátrica' },
    { value: 'hospitalar', viewValue: 'Nutrição Hospitalar' }
  ];

  constructor(
    private fb: FormBuilder,
    private nutritionistService: NutritionistService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.nutritionistForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      specialty: ['', Validators.required],
      registry: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.nutritionistForm.valid) {
      this.isLoading = true;
      const formData = { ...this.nutritionistForm.value };

      console.log('Dados a serem enviados:', formData);

      this.nutritionistService.createNutritionist(formData).subscribe({
        next: (response) => {
          console.log('Nutricionista cadastrado com sucesso!', response);
          this.snackBar.open('Nutricionista cadastrado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/nutritionist-list']);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erro ao cadastrar Nutricionista:', error);
          this.snackBar.open('Erro ao cadastrar nutricionista. Tente novamente.', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      console.error('Formulário inválido:', this.nutritionistForm);
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', { duration: 3000 });
      this.nutritionistForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/nutritionist-list']);
  }
}
