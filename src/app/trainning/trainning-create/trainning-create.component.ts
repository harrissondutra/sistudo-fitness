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
import { TrainningCategoryDto } from '../../models/trainning-category';

import { ExerciseService } from '../../services/exercise/exercise.service';
import { ExerciseDto } from '../../models/exercise';

import { ClientService } from '../../services/client/client.service';
import { ClientDto } from '../../models/client';

import { Trainning } from '../../models/trainning';
import { finalize, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Importe o ExerciseSelectionModalComponent se ainda não estiver
import { ExerciseSelectionModalComponent } from '../../Exercises/exercise-selection-modal/exercise-selection-modal.component';
import { MatDialog } from '@angular/material/dialog'; // Certifique-se de importar MatDialog
import { DatePipe } from '@angular/common';
import { inject } from '@angular/core';


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
    MatProgressSpinnerModule,
    // Se você usa o modal de seleção de exercícios em outros lugares,
    // ou se o modal é standalone, não precisa importá-lo aqui.
    // Mas se ele for um componente do módulo e você está em standalone,
    // ou se ele é standalone e você não o importou em app.config.ts,
    // pode ser necessário importá-lo no `imports` do componente pai.
    // MatDialogModule // Geralmente é importado no app.config.ts ou no NgModule raiz
  ],
  providers: [DatePipe]
})
export class TrainningCreateComponent implements OnInit {
  trainningForm!: FormGroup;
  exercises: ExerciseDto[] = [];
  clients: ClientDto[] = [];
  trainningCategories: TrainningCategoryDto[] = [];
  isLoading = false;
  isSaving = false; // Adicionado para controlar o estado do botão Salvar
  private datePipe = inject(DatePipe);


  constructor(
    private fb: FormBuilder,
    private trainningService: TrainningService,
    private exerciseService: ExerciseService,
    private clientService: ClientService,
    private trainningCategoryService: TrainningCategoryService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // Injetado MatDialog para o modal
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
      // CORRIGIDO: categories é um array, minLength(1) para ao menos uma categoria
      categories: [[], [Validators.required, Validators.minLength(1)]],
      // CORRIGIDO: exercises é um array, minLength(1) para ao menos um exercício
      exercises: [[], [Validators.required, Validators.minLength(1)]],
      // CORRIGIDO: client é um objeto ClientDto
      client: [null, [Validators.required]],
      // REATIVADO: startDate e endDate (opcionais, mas presentes no formulário)
      startDate: [new Date(), [Validators.required]], // Valor padrão para a data atual
      endDate: [null], // Valor inicial nulo
      // REATIVADO: active
      active: [true] // Valor padrão true
    });
  }

  /**
   * Carrega todos os dados iniciais necessários (exercícios, clientes, categorias)
   * em paralelo usando forkJoin.
   */
  private loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      exercises: this.exerciseService.getAllExercises().pipe(
        catchError(error => {
          this.handleError('Erro ao carregar exercícios disponíveis', error);
          return of([]);
        })
      ),
      clients: this.clientService.getAllClients().pipe(
        catchError(error => {
          this.handleError('Erro ao carregar clientes', error);
          return of([]);
        })
      ),
      categories: this.trainningCategoryService.getAllTrainningCategories().pipe(
        catchError(error => {
          this.handleError('Erro ao carregar categorias de treino', error);
          return of([]);
        })
      )
    })
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (results) => {
          // Filtrar por ID é uma boa prática caso algum item venha incompleto
          this.exercises = (results.exercises as ExerciseDto[]).filter(ex => typeof ex.id === 'number');
          this.clients = (results.clients as ClientDto[]).filter(client => typeof client.id === 'number');
          this.trainningCategories = (results.categories as TrainningCategoryDto[]).filter(cat => typeof cat.id === 'number');
        },
        error: (error) => {
          console.error('Erro geral no forkJoin de dados iniciais:', error);
          this.showMessage('Erro ao carregar dados essenciais para o formulário. Tente recarregar.', 'error');
        }
      });
  }

  /**
   * Abre o modal para selecionar exercícios.
   */
  openAddExerciseModal(): void {
    const dialogRef = this.dialog.open(ExerciseSelectionModalComponent, {
      width: '500px',
      data: { exercises: this.exercises } // Passa todos os exercícios disponíveis
    });

    dialogRef.afterClosed().subscribe((selectedExercises: ExerciseDto[]) => {
      if (selectedExercises) {
        const currentExercises = this.trainningForm.get('exercises')?.value || [];
        // Filtra para adicionar apenas exercícios que ainda não estão na lista
        const newExercisesToAdd = selectedExercises.filter(
          selectedEx => !currentExercises.some((existingEx: ExerciseDto) => existingEx.id === selectedEx.id)
        );

        if (newExercisesToAdd.length > 0) {
          this.trainningForm.get('exercises')?.setValue([...currentExercises, ...newExercisesToAdd]);
          // Marca o controle como tocado para que as validações sejam exibidas
          this.trainningForm.get('exercises')?.markAsTouched();
          this.trainningForm.get('exercises')?.updateValueAndValidity();
          this.showMessage(`${newExercisesToAdd.length} exercício(s) adicionado(s)!`, 'info');
        } else {
          this.showMessage('Nenhum novo exercício selecionado ou já adicionado.', 'info');
        }
      }
    });
  }

  onSubmit(): void {
    this.markFormGroupTouched(this.trainningForm);

    if (this.trainningForm.invalid) {
      this.showMessage('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
      console.warn('Formulário inválido. Verifique os campos obrigatórios.', this.trainningForm.errors);
      return;
    }

    this.isSaving = true; // Ativa o spinner no botão

    const formValue = this.trainningForm.value;

      // Formata as datas para formato ISO
  const formattedStartDate = formValue.startDate ?
    this.datePipe.transform(formValue.startDate, 'yyyy-MM-ddTHH:mm:ss') : undefined;

  const formattedEndDate = formValue.endDate ?
    this.datePipe.transform(formValue.endDate, 'yyyy-MM-ddTHH:mm:ss') : undefined;

  const trainningData: Trainning = {
    name: formValue.name,
    description: formValue.description,
    categories: formValue.categories,
    exercises: formValue.exercises,
    client: formValue.client,
    active: formValue.active,
    startDate: formattedStartDate as any,
    endDate: formattedEndDate as any
  };

    // Assumindo que createTrainningByClientId espera o ID do cliente e o objeto Trainning
    this.trainningService.createTrainningByClientId(trainningData.client.id!, trainningData)
      .pipe(finalize(() => this.isSaving = false)) // Desativa o spinner no final
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
    const currentExercises = this.trainningForm.get('exercises')?.value as ExerciseDto[];
    if (currentExercises) {
      const updatedExercises = currentExercises.filter(ex => ex.id !== exerciseId);
      this.trainningForm.get('exercises')?.setValue(updatedExercises);
      this.trainningForm.get('exercises')?.markAsDirty(); // Marca como dirty para que a validação atualize
      this.trainningForm.get('exercises')?.updateValueAndValidity(); // Força a revalidação
      this.showMessage('Exercício removido da seleção.', 'info');
    }
  }

  /**
   * Função comparadora para mat-select, útil para comparar objetos por ID.
   */
  compareObjectsById(o1: any, o2: any): boolean {
    return o1 && o2 && typeof o1 === 'object' && typeof o2 === 'object' ? o1.id === o2.id : o1 === o2;
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

    this.showMessage(`${finalMessage}`, 'error'); // Removido contextMessage duplicado no início.
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

  /**
   * Marca todos os controles de um FormGroup como 'touched' para exibir validações.
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
   * Navega de volta para a lista de treinos.
   */
  cancel(): void {
    this.router.navigate(['/trainnings']);
  }
}

