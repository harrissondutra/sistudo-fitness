import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NutritionistService } from '../../services/nutritionist/nutritionist.service';
import { Nutritionist } from '../../models/nutritionist';
import { Router } from '@angular/router';
import { Location, CommonModule } from '@angular/common';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

// NgxMaskDirective
import { NgxMaskDirective } from 'ngx-mask';

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
    MatCardModule,
    MatIconModule,
    NgxMaskDirective,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  providers: [
    MatDatepickerModule,
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {
      provide: MAT_DATE_FORMATS, useValue: {
        parse: { dateInput: 'DD/MM/YYYY' },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY'
        }
      }
    }
  ],
  templateUrl: './nutritionist-create.component.html',
  styleUrl: './nutritionist-create.component.scss'
})
export class NutritionistCreateComponent implements OnInit {
  nutritionistForm!: FormGroup;

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
    private snackBar: MatSnackBar,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.initializeForm();

    // Monitor de status do formulário para debugging
    this.nutritionistForm.statusChanges.subscribe(status => {
      console.log('Status do formulário:', status);
      if (status === 'INVALID') {
        const controls = this.nutritionistForm.controls;
        Object.keys(controls).forEach(key => {
          const control = controls[key];
          console.log(`Campo ${key} - status: ${control.status}, errors:`, control.errors);
        });
      }
    });
  }

  /**
   * Inicializa o FormGroup com todos os controles e validadores
   */
  private initializeForm(): void {
    this.nutritionistForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      specialty: ['', Validators.required],
      registry: ['', [
        Validators.required,
        // Padrão para CRN: 00000/X (5 números, barra, e um dígito)
        Validators.pattern(/^\d{5}[/][0-9A-Z]$/)
      ]]
    });
  }

  onSubmit(): void {
    if (this.nutritionistForm.valid) {
      const formData = { ...this.nutritionistForm.value };

      // Limpar formato do telefone antes de enviar
      formData.phone = formData.phone?.replace(/\D/g, '');

      console.log('Dados a serem enviados:', formData);

      this.nutritionistService.createNutritionist(formData).subscribe({
        next: (response) => {
          console.log('Nutricionista cadastrado com sucesso!', response);
          this.snackBar.open('Nutricionista cadastrado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/nutritionists']);
        },
        error: (error) => {
          console.error('Erro ao cadastrar Nutricionista:', error);
          this.snackBar.open('Erro ao cadastrar Nutricionista. Verifique os dados.', 'Fechar', { duration: 5000 });
        }
      });
    } else {
      console.error('Formulário inválido:', this.nutritionistForm);
      this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', { duration: 3000 });
      this.nutritionistForm.markAllAsTouched();
    }
  }

  goBack(): void {
    this.location.back();
  }
}
