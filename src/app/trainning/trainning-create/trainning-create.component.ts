import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Adicionado CommonModule para standalone
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker'; // Para datepickers
import { MatNativeDateModule } from '@angular/material/core'; // Necessário para MatDatepicker

import { TrainningService } from '../../services/trainning/trainning.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExerciseService } from '../../services/exercise/exercise.service';
import { Exercise } from '../../models/exercise'; // Certifique-se de que Exercise tem 'repetitions' e 'series' (ou 'sets')
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { Trainning } from '../../models/trainning'; // Certifique-se de que o modelo Trainning foi ajustado
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-trainning-create',
  templateUrl: './trainning-create.component.html',
  styleUrls: ['./trainning-create.component.scss'],
  standalone: true, // Componente definido como standalone
  imports: [
    CommonModule, // Importa CommonModule
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDatepickerModule, // Importa MatDatepickerModule
    MatNativeDateModule // Importa MatNativeDateModule
  ]
})
export class TrainningCreateComponent implements OnInit {
  trainingForm!: FormGroup;
  exercises: Exercise[] = [];
  users: User[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private trainningService: TrainningService,
    private exerciseService: ExerciseService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private initForm(): void {
    this.trainingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      // Adicionado campo de descrição conforme o modelo Trainning
      description: [''],
      // Adicionado campo de categoria conforme o modelo Trainning
      category: ['', [Validators.required]],
      exercises: [[], [Validators.required, Validators.minLength(1)]],
      userId: [null, [Validators.required]],
      // Adicionados campos de data de início e fim
      startDate: [new Date(), [Validators.required]], // Preenche com a data atual por padrão
      endDate: [null]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true; // Inicia o carregamento
    this.loadExercises();
    this.loadUsers();
  }

  private loadExercises(): void {
    this.exerciseService.getAllExercises()
      // O finalize() deve ser chamado apenas uma vez após todos os carregamentos, ou individualmente
      // Ajuste o `isLoading = false` para um ponto onde todos os dados iniciais tenham carregado
      .subscribe({
        next: (exercises: Exercise[]) => {
          this.exercises = exercises;
          // Se este for o último carregamento, defina isLoading como false aqui
          // Ou gerencie com um contador de carregamentos pendentes
          this.checkAllDataLoaded();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar exercícios', error);
          this.checkAllDataLoaded(); // Também chame em caso de erro para parar o spinner
        }
      });
  }

  private loadUsers(): void {
    this.userService.getAllUsers()
      .subscribe({
        next: (users: User[]) => {
          this.users = users;
          this.checkAllDataLoaded();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar clientes', error);
          this.checkAllDataLoaded(); // Também chame em caso de erro para parar o spinner
        }
      });
  }

  private loadCount = 0;
  private checkAllDataLoaded(): void {
    this.loadCount++;
    // Assumindo 2 carregamentos: exercícios e usuários
    if (this.loadCount === 2) {
      this.isLoading = false;
      this.loadCount = 0; // Reseta o contador
    }
  }

  onSubmit(): void {
    if (this.trainingForm.invalid) {
      this.markFormGroupTouched(this.trainingForm);
      return;
    }

    const formValue = this.trainingForm.value;

    // Constrói o corpo da requisição conforme o modelo JSON Trainning
    const trainingData: Trainning = {
      name: formValue.name,
      exercises: formValue.exercises,
      userId: formValue.userId,
      active: true, // Assumindo que novos treinos são ativos por padrão
      category: formValue.category, // Adicionado
      startDate: formValue.startDate, // Adicionado
      endDate: formValue.endDate // Adicionado
    };

    this.isLoading = true; // Inicia o spinner de salvamento
    this.trainningService.createTrainningByUserId(trainingData.userId, trainingData)
      .pipe(finalize(() => this.isLoading = false)) // Finaliza o spinner após a requisição
      .subscribe({
        next: (response: Trainning) => {
          this.showMessage('Treino criado com sucesso!', 'success');
          this.router.navigate(['/trainning']); // Redireciona para a página de treinos
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao criar treino', error);
        }
      });
  }

  private handleError(message: string, error: HttpErrorResponse): void {
    console.error(`${message}:`, error);
    const backendMsg = error.error?.message || error.error || error.message || 'Erro desconhecido';
    this.showMessage(`${message}. Detalhes: ${backendMsg}`, 'error');
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'success' ? 3000 : 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/trainning']);
  }
}
