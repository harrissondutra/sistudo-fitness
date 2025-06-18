import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
// REMOVIDO FormsModule:
// import { FormsModule } from '@angular/forms';
// ADICIONADO FormBuilder, FormGroup, Validators, ReactiveFormsModule
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // <--- ATUALIZADO
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

// Importa os serviços e modelos necessários
import { TrainningService } from '../../../services/trainning/trainning.service';
import { ExerciseService } from '../../../services/exercise/exercise.service';
import { ClientService } from '../../../services/client/client.service';
import { TrainningCategoryService } from '../../../services/trainning-category/trainning-category.service';

import { Trainning } from '../../../models/trainning';
import { Exercise } from '../../../models/exercise';
import { Client } from '../../../models/client';
import { TrainningCategory } from '../../../models/trainning-category';

// Importa o componente correto para seleção de exercícios
import { ExerciseSelectionModalComponent } from '../../../Exercises/exercise-selection-modal/exercise-selection-modal.component';

import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-trainning-edit',
  standalone: true,
  imports: [
    CommonModule,
    // REMOVIDO FormsModule, ADICIONADO ReactiveFormsModule
    ReactiveFormsModule, // <--- ATUALIZADO
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSelectModule,
    MatDialogModule,
  ],
  templateUrl: './trainning-edit.component.html',
  styleUrl: './trainning-edit.component.scss'
})
export class TrainningEditComponent implements OnInit {

  trainningForm!: FormGroup; // <--- ATUALIZADO: Usará FormGroup para gerenciar o formulário
  // REMOVIDO: trainning: Trainning | null = null; // Não será mais usado diretamente para o formulário
  isLoading = true;
  isSaving = false;
  allAvailableExercises: Exercise[] = [];
  trainningCategories: TrainningCategory[] = [];
  clients: Client[] = [];

  private currentTrainningId: number | null = null; // <--- NOVO: Para guardar o ID do treino sendo editado

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder, // <--- ATUALIZADO: Injetado FormBuilder
    private trainningService: TrainningService,
    private exerciseService: ExerciseService,
    private clientService: ClientService,
    private trainningCategoryService: TrainningCategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initForm(); // <--- ATUALIZADO: Inicializa o formulário no construtor
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const trainningIdParam = params.get('id');
      if (trainningIdParam) {
        this.currentTrainningId = Number(trainningIdParam); // <--- ATUALIZADO
        this.loadAllData(this.currentTrainningId); // <--- ATUALIZADO
      } else {
        console.error('ID do treino não fornecido na rota.');
        this.snackBar.open('Erro: ID do treino não encontrado.', 'Fechar', { duration: 3000 });
        this.goBack();
      }
    });
  }

  // <--- NOVO MÉTODO: Inicializa o FormGroup
  private initForm(): void {
    this.trainningForm = this.fb.group({
      id: [null], // Pode ser útil ter o ID no formulário para o patchValue
      name: ['', Validators.required],
      description: [''],
      category: [null, Validators.required], // Para objetos TrainningCategory
      exercises: [[], Validators.required], // Para array de objetos Exercise
      clientId: [null, Validators.required], // Para ID do Cliente
      startDate: [null, Validators.required], // Data inicial como Date object
      endDate: [null], // Data final como Date object ou null
      active: [true]
    });
  }

  /**
   * Carrega todos os dados necessários (treino, exercícios, categorias, clientes) em paralelo.
   */
  private loadAllData(id: number): void {
    this.isLoading = true;
    forkJoin([
      this.trainningService.getTrainningById(id).pipe(
        catchError(error => {
          console.error('Erro ao carregar treino:', error);
          this.snackBar.open('Erro ao carregar treino.', 'Fechar', { duration: 3000 });
          this.router.navigate(['/trainnings']);
          return of(null);
        })
      ),
      this.exerciseService.getAllExercises().pipe(
        catchError(error => {
          console.error('Erro ao carregar lista de exercícios disponíveis:', error);
          this.snackBar.open('Erro ao carregar exercícios disponíveis.', 'Fechar', { duration: 3000 });
          return of([]);
        })
      ),
      this.trainningCategoryService.getAllTrainningCategories().pipe(
        catchError(error => {
          console.error('Erro ao carregar categorias de treino:', error);
          this.snackBar.open('Erro ao carregar categorias de treino.', 'Fechar', { duration: 3000 });
          return of([]);
        })
      ),
      this.clientService.getAllClients().pipe(
        catchError(error => {
          console.error('Erro ao carregar clientes:', error);
          this.snackBar.open('Erro ao carregar clientes.', 'Fechar', { duration: 3000 });
          return of([]);
        })
      )
    ]).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ([trainningData, exercisesData, categoriesData, clientsData]) => {
        if (trainningData) {
          // Atribua os dados carregados ao FormGroup usando patchValue
          this.trainningForm.patchValue({
            id: trainningData.id,
            name: trainningData.name,
            // Encontra o objeto category correspondente na lista de categorias
            category: categoriesData.find(cat => {
              if (trainningData.category && typeof trainningData.category === 'object' && 'id' in trainningData.category) {
                return cat.id === (trainningData.category as { id: number }).id;
              } else {
                return cat.id === Number(trainningData.category);
              }
            }),
            // Filtra os exercícios carregados para incluir apenas os que estão no treino
            exercises: exercisesData.filter(ex => trainningData.exercises?.some(tEx => tEx.id === ex.id)),
            clientId: trainningData.clientId,
            // Converte strings de data para objetos Date para o datepicker
            startDate: trainningData.startDate && typeof trainningData.startDate === 'string' ? new Date(trainningData.startDate) : null,
            endDate: trainningData.endDate && typeof trainningData.endDate === 'string' ? new Date(trainningData.endDate) : null,
            active: trainningData.active
          });

          // Popula as listas para os mat-selects
          this.allAvailableExercises = exercisesData;
          this.trainningCategories = categoriesData;
          this.clients = clientsData;

        } else {
          this.router.navigate(['/trainnings']);
        }
      },
      error: (error) => {
        console.error('Erro geral no carregamento de dados:', error);
        this.snackBar.open('Erro ao carregar todos os dados necessários.', 'Fechar', { duration: 3000 });
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

    dialogRef.afterClosed().subscribe((selectedExercises: Exercise[]) => {
      if (selectedExercises) { // Não precisa mais de this.trainning, pois o formulário gerencia
        const currentExercises = this.trainningForm.get('exercises')?.value || []; // Pega os exercícios atuais do formulário
        const newExercisesToAdd = selectedExercises.filter(
          selectedEx => !currentExercises.some((existingEx: Exercise) => existingEx.id === selectedEx.id)
        );

        if (newExercisesToAdd.length > 0) {
          this.trainningForm.get('exercises')?.setValue([...currentExercises, ...newExercisesToAdd]); // Atualiza o formControl
          this.snackBar.open(`${newExercisesToAdd.length} exercício(s) adicionado(s)!`, 'Fechar', { duration: 2000 });
        } else {
          this.snackBar.open('Nenhum novo exercício selecionado ou já adicionado.', 'Fechar', { duration: 2000 });
        }
      }
    });
  }

  /**
   * Salva as alterações no treino atual.
   */
  onSave(): void {
    // ATUALIZADO: Validação do FormGroup
    if (this.trainningForm.invalid) {
      this.markFormGroupTouched(this.trainningForm); // Marcar campos como touched para mostrar erros
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;

    // Pega o valor do formulário
    const trainningToSave = { ...this.trainningForm.value }; // <--- ATUALIZADO: Pega valor do FormGroup

    // Formata as datas para string 'DD/MM/YYYY' para enviar ao backend
    if (trainningToSave.startDate instanceof Date) {
      const day = String(trainningToSave.startDate.getDate()).padStart(2, '0');
      const month = String(trainningToSave.startDate.getMonth() + 1).padStart(2, '0');
      const year = trainningToSave.startDate.getFullYear();
      trainningToSave.startDate = `${day}/${month}/${year}`;
    } else {
      trainningToSave.startDate = undefined; // Ou null se o backend aceitar null para startDate opcional
    }

    if (trainningToSave.endDate instanceof Date && trainningToSave.endDate) {
      const day = String(trainningToSave.endDate.getDate()).padStart(2, '0');
      const month = String(trainningToSave.endDate.getMonth() + 1).padStart(2, '0');
      const year = trainningToSave.endDate.getFullYear();
      trainningToSave.endDate = `${day}/${month}/${year}`;
    } else {
      trainningToSave.endDate = undefined; // Ou null, dependendo do backend
    }

    // Certifica-se de que o ID do treino está incluído para a atualização
    // O ID deve vir da rota ou do formulário se ele foi patchValue
    trainningToSave.id = this.currentTrainningId; // <--- ATUALIZADO: Usa o ID guardado da rota

    this.trainningService.updateTrainning(trainningToSave.id!, trainningToSave).subscribe({
      next: (updatedTrainning: Trainning) => {
        this.snackBar.open('Treino atualizado com sucesso!', 'Fechar', { duration: 3000 });
        this.isSaving = false;
        this.router.navigate(['/trainning-view', updatedTrainning.id]);
      },
      error: (error: any) => {
        console.error('Erro ao salvar treino:', error);
        this.snackBar.open('Erro ao salvar treino. Tente novamente.', 'Fechar', { duration: 3000 });
        this.isSaving = false;
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
  removeExerciseFromSelection(exerciseId: number): void { // <--- ATUALIZADO: Nome do método para Reactive Forms
    const currentExercises = this.trainningForm.get('exercises')?.value as Exercise[];
    if (currentExercises) {
      const updatedExercises = currentExercises.filter(ex => ex.id !== exerciseId);
      this.trainningForm.get('exercises')?.setValue(updatedExercises); // <--- ATUALIZADO: Atualiza o formControl
      this.snackBar.open('Exercício removido do treino.', 'Fechar', { duration: 2000 });
    } else {
      this.snackBar.open('Erro ao remover exercício. Treino não encontrado.', 'Fechar', { duration: 3000 });
    }
  }


  /**
   * Método para comparar objetos por ID, essencial para mat-select que usa objetos como valor.
   * Usado para comparar objetos TrainningCategory no mat-select e também em `ExerciseSelectionModalComponent`.
   */
  compareObjectsById(o1: any, o2: any): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
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
}
