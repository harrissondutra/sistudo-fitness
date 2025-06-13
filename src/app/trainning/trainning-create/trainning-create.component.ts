import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select'; // Para o campo de intensidade
import { MatDatepickerModule } from '@angular/material/datepicker'; // Para o campo de data
import { MatNativeDateModule } from '@angular/material/core'; // Necessário para MatDatepicker

import { TrainningService } from '../../services/trainning/trainning.service';
import { Trainning } from '../../models/trainning';
import { catchError, of } from 'rxjs'; // Importar 'of' para Observables vazios


@Component({
  selector: 'app-trainning-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSelectModule, // Adicionado
    MatDatepickerModule, // Adicionado
    MatNativeDateModule // Adicionado
  ],
  templateUrl: './trainning-create.component.html',
  styleUrls: ['./trainning-create.component.scss']
})
export class TrainningCreateComponent implements OnInit {
  trainingForm!: FormGroup;
  intensityLevels: string[] = ['LOW', 'MEDIUM', 'HIGH']; // Opções para o seletor de intensidade

  constructor(
    private fb: FormBuilder,
    private trainningService: TrainningService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Inicializa o FormGroup para o treino com validadores.
   */
  private initializeForm(): void {
    this.trainingForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      durationMinutes: [null, [Validators.min(1), Validators.max(1000)]], // Duração entre 1 e 1000 minutos
      intensityLevel: ['', Validators.required],
      date: [null, Validators.required],
      userId: [null, Validators.required] // Assumindo que o userId é necessário para criar um treino
    });
  }

  /**
   * Lida com a submissão do formulário para criar um novo treino.
   */
  onSubmit(): void {
    if (this.trainingForm.valid) {
      const formData = this.trainingForm.value;

      const newTraining: Trainning = {
        name: formData.name,
        userId: formData.userId,
        exercises: formData.exercises || [] // Garante que exercises está presente
      };

      this.trainningService.createTrainning(newTraining).pipe(
        catchError(error => {
          console.error('Erro ao criar treino:', error);
          this.snackBar.open('Erro ao criar treino. Verifique o console para mais detalhes.', 'Fechar', { duration: 5000 });
          return of(null); // Retorna um Observable de null para continuar a cadeia
        })
      ).subscribe(response => {
        if (response) {
          this.snackBar.open('Treino criado com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/trainings-list']); // Redireciona para a lista após sucesso
        }
      });
    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
      this.trainingForm.markAllAsTouched(); // Marca todos os campos como tocados para exibir erros
    }
  }

  /**
   * Cancela a operação e retorna para a lista de treinos.
   */
  cancel(): void {
    this.router.navigate(['/trainings-list']);
  }
}
