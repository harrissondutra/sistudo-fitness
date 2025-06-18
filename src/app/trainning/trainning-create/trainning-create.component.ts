import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { TrainningService } from '../../services/trainning/trainning.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TrainningCategoryService } from '../../services/trainning-category/trainning-category.service';
import { TrainningCategory } from '../../models/trainning-category';

import { ExerciseService } from '../../services/exercise/exercise.service';
import { Exercise } from '../../models/exercise';

import { ClientService } from '../../services/client/client.service';
import { Client } from '../../models/client';

import { Trainning } from '../../models/trainning';
import { finalize } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

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
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ]
})
export class TrainningCreateComponent implements OnInit {
  trainningForm!: FormGroup;
  exercises: Exercise[] = [];
  clients: Client[] = [];
  trainningCategories: TrainningCategory[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private trainningService: TrainningService,
    private exerciseService: ExerciseService,
    private clientService: ClientService,
    private trainningCategoryService: TrainningCategoryService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private initForm(): void {
    this.trainningForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      // 'category' deve ser inicializado como null ou um objeto padrão, se não for null
      category: [null, [Validators.required]],
      // 'exercises' como um array vazio, mas com validador para minLength(1)
      exercises: [[], [Validators.required, Validators.minLength(1)]],
      clientId: [null, [Validators.required]],
      startDate: [new Date(), [Validators.required]], // Valor padrão para a data atual
      endDate: [null]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    // Usar Promise.all ou forkJoin para carregar tudo em paralelo e gerenciar isLoading melhor
    Promise.all([
      this.loadExercises(),
      this.loadClients(),
      this.loadTrainningCategories()
    ]).finally(() => {
      this.isLoading = false; // Define isLoading como false apenas quando todas as chamadas terminarem
    });
  }

  private async loadExercises(): Promise<void> {
    try {
      this.exercises = (await this.exerciseService.getAllExercises().toPromise()) ?? [];
    } catch (error: any) {
      this.handleError('Erro ao carregar exercícios', error);
    }
  }

  private async loadClients(): Promise<void> {
    try {
      this.clients = (await this.clientService.getAllClients().toPromise()) ?? [];
    } catch (error: any) {
      this.handleError('Erro ao carregar clientes', error);
    }
  }

  private async loadTrainningCategories(): Promise<void> {
    try {
      this.trainningCategories = (await this.trainningCategoryService.getAllTrainningCategories().toPromise()) ?? [];
    } catch (error: any) {
      this.handleError('Erro ao carregar categorias de treino', error);
    }
  }

  onSubmit(): void {
    if (this.trainningForm.invalid) {
      this.markFormGroupTouched(this.trainningForm);
      this.showMessage('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
      return;
    }

    const formValue = this.trainningForm.value;

    const trainningData: Trainning = {
      name: formValue.name,
      category: formValue.category,
      exercises: formValue.exercises,
      clientId: formValue.clientId,
      active: true,
      // Formata as datas para 'YYYY-MM-DD' para o backend
      startDate: formValue.startDate.toISOString().split('T')[0],
      endDate: formValue.endDate ? formValue.endDate.toISOString().split('T')[0] : null
    };

    this.isLoading = true; // Define isLoading para true antes de enviar a requisição
    this.trainningService.createTrainningByClientId(trainningData.clientId!, trainningData)
      .pipe(finalize(() => this.isLoading = false)) // Define isLoading como false no final, independentemente do sucesso/erro
      .subscribe({
        next: (response: Trainning) => {
          this.showMessage('Treino criado com sucesso!', 'success');
          this.router.navigate(['/trainnings']);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao criar treino', error);
        }
      });
  }

  /**
   * Remove um exercício da seleção atual do formulário.
   * @param exerciseId O ID do exercício a ser removido.
   */
  removeExerciseFromSelection(exerciseId: number): void {
    const currentExercises = this.trainningForm.get('exercises')?.value as Exercise[];
    if (currentExercises) {
      const updatedExercises = currentExercises.filter(ex => ex.id !== exerciseId);
      this.trainningForm.get('exercises')?.setValue(updatedExercises); // Atualiza o formControl
      // Se necessário, revalidar o campo após a remoção
      this.trainningForm.get('exercises')?.markAsDirty();
      this.trainningForm.get('exercises')?.updateValueAndValidity();
      this.showMessage('Exercício removido da seleção.', 'info');
    }
  }

  compareObjectsById(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  private handleError(message: string, error: HttpErrorResponse): void {
    console.error(`${message}:`, error);
    const backendMsg = error.error?.message || error.error || error.message || 'Erro desconhecido';
    this.showMessage(`${message}. Detalhes: ${backendMsg}`, 'error');
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'success' ? 3000 : 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : (type === 'error' ? ['error-snackbar'] : ['info-snackbar'])
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
    this.router.navigate(['/trainnings']);
  }
}
