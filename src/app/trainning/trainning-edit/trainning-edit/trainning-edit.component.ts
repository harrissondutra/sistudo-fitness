import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core'; // Reativado
import { MatDatepickerModule } from '@angular/material/datepicker'; // Reativado

// Importa os serviços e modelos necessários
import { TrainningService } from '../../../services/trainning/trainning.service';
import { ExerciseService } from '../../../services/exercise/exercise.service';
import { ClientService } from '../../../services/client/client.service';
import { TrainningCategoryService } from '../../../services/trainning-category/trainning-category.service';

import { Trainning } from '../../../models/trainning'; // Interface Trainning
import { ExerciseDto } from '../../../models/exercise'; // DTO
import { ClientDto } from '../../../models/client';     // DTO
import { TrainningCategoryDto } from '../../../models/trainning-category'; // DTO

// Importa o componente correto para seleção de exercícios
import { ExerciseSelectionModalComponent } from '../../../Exercises/exercise-selection-modal/exercise-selection-modal.component';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-trainning-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatNativeDateModule, // Reativado
    MatDatepickerModule, // Reativado
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './trainning-edit.component.html',
  styleUrl: './trainning-edit.component.scss'
})
export class TrainningEditComponent implements OnInit {

  trainningForm!: FormGroup;
  isLoading = true;
  isSaving = false;
  allAvailableExercises: ExerciseDto[] = [];
  trainningCategories: TrainningCategoryDto[] = [];
  clients: ClientDto[] = [];

  private currentTrainningId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private trainningService: TrainningService,
    private exerciseService: ExerciseService,
    private clientService: ClientService,
    private trainningCategoryService: TrainningCategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const trainningIdParam = params.get('id');
      if (trainningIdParam) {
        this.currentTrainningId = Number(trainningIdParam);
        this.loadAllData(this.currentTrainningId);
      } else {
        console.error('ID do treino não fornecido na rota.');
        this.showMessage('Erro: ID do treino não encontrado.', 'error');
        this.goBack();
      }
    });
  }

  /**
   * Inicializa o FormGroup para o formulário de treino.
   */
  private initForm(): void {
    this.trainningForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      categories: [[], [Validators.required, Validators.minLength(1)]],
      exercises: [[], [Validators.required, Validators.minLength(1)]],
      client: [null, [Validators.required]], // Assumindo que client é um ClientDto completo
      startDate: [null, Validators.required], // Reativado
      endDate: [null], // Reativado
      active: [true]
    });
  }

  /**
   * Carrega todos os dados necessários (treino, exercícios, categorias, clientes) em paralelo.
   */
  private loadAllData(id: number): void {
    this.isLoading = true;
    forkJoin({
      trainning: this.trainningService.getTrainningById(id).pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar os dados do treino', error);
          this.router.navigate(['/trainnings']);
          return of(null);
        })
      ),
      exercises: this.exerciseService.getAllExercises().pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar lista de exercícios disponíveis', error);
          return of([]);
        })
      ),
      categories: this.trainningCategoryService.getAllTrainningCategories().pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar categorias de treino', error);
          return of([]);
        })
      ),
      clients: this.clientService.getAllClients().pipe(
        catchError((error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar clientes', error);
          return of([]);
        })
      )
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (results) => {
        const { trainning, exercises, categories, clients } = results;

        this.allAvailableExercises = (exercises as ExerciseDto[]).filter(ex => ex && typeof ex.id === 'number');
        this.trainningCategories = (categories as any[]).filter((cat): cat is TrainningCategoryDto => cat && typeof cat.id === 'number');
        this.clients = (clients as any[]).filter((c): c is ClientDto => c && typeof c.id === 'number');

        if (trainning) {
          // Preenche o formulário com os dados do treino carregado
          this.trainningForm.patchValue({
            id: trainning.id,
            name: trainning.name,
            description: trainning.description,
            categories: trainning.categories.map(tc =>
                this.trainningCategories.find(cat => cat.id === tc.id)
            ).filter(Boolean) as TrainningCategoryDto[],
            exercises: trainning.exercises.map(ex =>
                this.allAvailableExercises.find(aEx => aEx.id === ex.id)
            ).filter(Boolean) as ExerciseDto[],
            client: this.clients.find(c => c.id === trainning.client.id) || null,
            startDate: trainning.startDate ? new Date(trainning.startDate) : null, // Converte string para Date
            endDate: trainning.endDate ? new Date(trainning.endDate) : null,     // Converte string para Date
            active: trainning.active
          });
        } else {
          this.router.navigate(['/trainnings']);
        }
      },
      error: (error) => {
        this.showMessage('Erro ao carregar todos os dados necessários para edição.', 'error');
        this.router.navigate(['/trainnings']);
      }
    });
  }

  /**
   * Abre o modal para selecionar exercícios.
   */
  openAddExerciseModal(): void {
    const dialogRef = this.dialog.open(ExerciseSelectionModalComponent, {
      width: '500px',
      data: { exercises: this.allAvailableExercises }
    });

    dialogRef.afterClosed().subscribe((selectedExercises: ExerciseDto[]) => {
      if (selectedExercises) {
        const currentExercises = this.trainningForm.get('exercises')?.value || [];
        const newExercisesToAdd = selectedExercises.filter(
          selectedEx => !currentExercises.some((existingEx: ExerciseDto) => existingEx.id === selectedEx.id)
        );

        if (newExercisesToAdd.length > 0) {
          this.trainningForm.get('exercises')?.setValue([...currentExercises, ...newExercisesToAdd]);
          this.showMessage(`${newExercisesToAdd.length} exercício(s) adicionado(s)!`, 'info');
        } else {
          this.showMessage('Nenhum novo exercício selecionado ou já adicionado.', 'info');
        }
      }
    });
  }

  /**
   * Salva as alterações no treino atual.
   */
  onSave(): void {
    this.markFormGroupTouched(this.trainningForm);

    if (this.trainningForm.invalid) {
      this.showMessage('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
      return;
    }

    this.isSaving = true;

    // Pega o valor do formulário
    const formData = this.trainningForm.value;

    // Formata as datas para string 'DD/MM/YYYY' para enviar ao backend
    const formattedStartDate = formData.startDate instanceof Date
      ? `${String(formData.startDate.getDate()).padStart(2, '0')}/${String(formData.startDate.getMonth() + 1).padStart(2, '0')}/${formData.startDate.getFullYear()}`
      : undefined;

    const formattedEndDate = formData.endDate instanceof Date
      ? `${String(formData.endDate.getDate()).padStart(2, '0')}/${String(formData.endDate.getMonth() + 1).padStart(2, '0')}/${formData.endDate.getFullYear()}`
      : undefined;

    // Constrói o objeto Trainning para enviar ao backend
    const trainningToSave: Trainning = {
      id: this.currentTrainningId!,
      name: formData.name,
      description: formData.description,
      categories: formData.categories,
      exercises: formData.exercises,
      client: formData.client,
      startDate: formattedStartDate as any, // Cast para string, se necessário, ou ajuste o tipo no model
      endDate: formattedEndDate as any,     // Cast para string, se necessário, ou ajuste o tipo no model
      active: formData.active
    };

    this.trainningService.updateTrainning(trainningToSave.id!, trainningToSave)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: (updatedTrainning: Trainning) => {
          this.showMessage('Treino atualizado com sucesso!', 'success');
          this.router.navigate(['/trainning-view', updatedTrainning.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao salvar treino', error);
        }
      });
  }

  /**
   * Retorna à página anterior (geralmente a lista ou a visualização).
   */
  goBack(): void {
    this.router.navigate(['/trainnings']);
  }

  /**
   * Remove um exercício do treino da seleção atual do formulário.
   * @param exerciseId O ID do exercício a ser removido.
   */
  removeExerciseFromSelection(exerciseId: number): void {
    const currentExercises = this.trainningForm.get('exercises')?.value as ExerciseDto[];
    if (currentExercises) {
      const updatedExercises = currentExercises.filter(ex => ex.id !== exerciseId);
      this.trainningForm.get('exercises')?.setValue(updatedExercises);
      this.trainningForm.get('exercises')?.markAsDirty();
      this.trainningForm.get('exercises')?.updateValueAndValidity();
      this.showMessage('Exercício removido do treino.', 'info');
    } else {
      this.showMessage('Erro ao remover exercício. Treino não encontrado ou seleção vazia.', 'error');
    }
  }


  /**
   * Método para comparar objetos por ID, essencial para mat-select que usa objetos como valor.
   */
  compareObjectsById(o1: any, o2: any): boolean {
    return o1 && o2 && typeof o1 === 'object' && typeof o2 === 'object' ? o1.id === o2.id : o1 === o2;
  }

  /**
   * Marca todos os campos de um FormGroup como 'touched' para exibir mensagens de validação.
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Lida com erros de requisição HTTP e exibe uma mensagem no snackbar.
   */
  private handleError(contextMessage: string, error: HttpErrorResponse): void {
    console.error(`${contextMessage}:`, error);

    let backendMessage: string | undefined;

    if (error.error) {
      if (typeof error.error === 'string') {
        backendMessage = error.error;
      } else if (typeof error.error === 'object') {
        if (error.error.message) {
          backendMessage = error.error.message;
        } else if (Array.isArray(error.error.errors) && error.error.errors.length > 0) {
          backendMessage = error.error.errors.map((err: any) => err.defaultMessage || err.message || 'Erro de validação').join('; ');
        } else if (error.error.error && typeof error.error.error === 'string') {
          backendMessage = error.error.error;
        }
      }
    }

    let finalMessage = backendMessage || error.message;

    if (!backendMessage) {
      switch (error.status) {
        case 0:
          finalMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
          break;
        case 400:
          finalMessage = 'Requisição inválida. Verifique os dados enviados.';
          break;
        case 401:
          finalMessage = 'Sessão expirada ou não autorizado. Faça login novamente.';
          break;
        case 403:
          finalMessage = 'Acesso negado. Você não tem permissão para esta ação.';
          break;
        case 404:
          finalMessage = 'Recurso não encontrado.';
          break;
        case 500:
          finalMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        default:
          finalMessage = `Erro (${error.status}): Ocorreu um problema inesperado.`;
          break;
      }
    }

    this.showMessage(`${contextMessage}. Detalhes: ${finalMessage}`, 'error');
  }

  /**
   * Exibe uma mensagem de notificação (snackbar).
   */
  private showMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'success' ? 3000 : 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : (type === 'error' ? ['error-snackbar'] : ['info-snackbar'])
    });
  }
}
