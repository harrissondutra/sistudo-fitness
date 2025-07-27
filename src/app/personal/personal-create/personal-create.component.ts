import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PersonalService } from '../../services/personal/personal.service';
import { Personal } from '../../models/personal';
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
  selector: 'app-personal-create',
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
  templateUrl: './personal-create.component.html',
  styleUrl: './personal-create.component.scss'
})
export class PersonalCreateComponent implements OnInit {
  personalForm!: FormGroup;

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
    private snackBar: MatSnackBar,
    private location: Location
  ) { }

  // Adicione ao ngOnInit
  ngOnInit(): void {
    this.initializeForm();

    // Monitor de status do formulário para debugging
    this.personalForm.statusChanges.subscribe(status => {
      console.log('Status do formulário:', status);
      if (status === 'INVALID') {
        const controls = this.personalForm.controls;
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
    this.personalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      specialty: ['', Validators.required],
      registry: ['', [
        Validators.required,
        // Modificado para aceitar números no lugar das letras
        Validators.pattern(/^\d{1,6}[-]\d{1}[/]\d{2}$/)
      ]]
    });
  }

  // No onSubmit, antes de enviar o formulário
  onSubmit(): void {
  if (this.personalForm.valid) {
    const formData = { ...this.personalForm.value };

    // Limpar formato do telefone antes de enviar
    formData.phone = formData.phone?.replace(/\D/g, '');

    // Mantenha os caracteres especiais no registry!
    // NÃO faça formData.registry = formData.registry?.replace(/\D/g, '');

    console.log('Dados a serem enviados:', formData);

    this.personalService.createPersonal(formData).subscribe({
      next: (response) => {
        console.log('Personal cadastrado com sucesso!', response);
        this.snackBar.open('Personal cadastrado com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/personals']);
      },
      error: (error) => {
        console.error('Erro ao cadastrar Personal:', error);
        this.snackBar.open('Erro ao cadastrar Personal. Verifique os dados.', 'Fechar', { duration: 5000 });
      }
    });
  } else {
    console.error('Formulário inválido:', this.personalForm);
    this.snackBar.open('Por favor, preencha todos os campos corretamente.', 'Fechar', { duration: 3000 });
    this.personalForm.markAllAsTouched();
  }
}

  goBack(): void {
    this.location.back();
  }
}
