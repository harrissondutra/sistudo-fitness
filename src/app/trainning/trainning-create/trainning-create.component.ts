import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrainningService } from '../../services/trainning/trainning.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExerciseService } from '../../services/exercise/exercise.service';
import { Exercise } from '../../models/exercise';
import { UserService } from '../../services/user/user.service';
import { User } from '../../models/user';
import { Trainning } from '../../models/trainning';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-trainning-create',
  templateUrl: './trainning-create.component.html',
  styleUrls: ['./trainning-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
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
      exercises: [[], [Validators.required, Validators.minLength(1)]],
      userId: [null, [Validators.required]]
    });
  }

  private loadInitialData(): void {
    this.loadExercises();
    this.loadUsers();
  }

  private loadExercises(): void {
    this.exerciseService.getAllExercises()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (exercises: Exercise[]) => {
          this.exercises = exercises;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar exercícios', error);
        }
      });
  }

  private loadUsers(): void {
    this.userService.getAllUsers()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (users: User[]) => {
          this.users = users;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar usuários', error);
        }
      });
  }

  onSubmit(): void {
    if (this.trainingForm.invalid) {
      this.markFormGroupTouched(this.trainingForm);
      this.showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const formValue = this.trainingForm.value;
    const selectedUser = this.users.find(u => u.id === formValue.userId);

    if (!selectedUser) {
      this.showMessage('Usuário não encontrado', 'error');
      return;
    }

    const userId = Number(selectedUser.id);
    if (isNaN(userId)) {
      this.showMessage('ID do usuário inválido', 'error');
      return;
    }

    const trainingData: Trainning = {
      name: formValue.name,
      exercises: formValue.exercises,
      user: selectedUser,
      active: true
    };

    this.isLoading = true;
    this.trainningService.createTrainningByUserId(userId, trainingData)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: Trainning) => {
          this.showMessage('Treino criado com sucesso!', 'success');
          this.router.navigate(['/trainning']);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao criar treino', error);
        }
      });
  }

  private handleError(message: string, error: HttpErrorResponse): void {
    console.error(`${message}:`, error);
    const backendMsg = error.error?.message || error.error || error.message || 'Erro desconhecido';
    this.showMessage(`${message}: ${backendMsg}`, 'error');
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
