import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Importa MatDialog e MatDialogModule

import { TrainningService } from '../../../services/trainning/trainning.service';
import { ExerciseService } from '../../../services/exercise/exercise.service'; // Importa o ExerciseService
import { Trainning } from '../../../models/trainning';
import { Exercise } from '../../../models/exercise'; // Importa a interface Exercise
// Importa o componente correto para seleção de exercícios
import { ExerciseSelectionModalComponent } from '../../../Exercises/exercise-selection-modal/exercise-selection-modal.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-trainning-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    MatDatepickerModule,

    MatDialogModule, // Garante que MatDialogModule está disponível
  ],
  templateUrl: './trainning-edit.component.html',
  styleUrl: './trainning-edit.component.scss'
})
export class TrainningEditComponent implements OnInit {

  trainning: Trainning | null = null;
  isLoading = true;
  isSaving = false;
  allAvailableExercises: Exercise[] = []; // Propriedade para armazenar todos os exercícios disponíveis

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trainningService: TrainningService,
    private exerciseService: ExerciseService, // Injeta o ExerciseService
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const trainningId = params.get('id');
      if (trainningId) {
        this.loadTrainning(trainningId);
        this.loadAllAvailableExercises(); // Carrega todos os exercícios disponíveis ao inicializar
      } else {
        console.error('ID do treino não fornecido na rota.');
        this.snackBar.open('Erro: ID do treino não encontrado.', 'Fechar', { duration: 3000 });
        this.goBack();
      }
    });
  }

  /**
   * Carrega os dados de um treino específico usando o serviço.
   * @param id O ID do treino a ser carregado.
   */
  private loadTrainning(id: string): void {
    this.isLoading = true;
    this.trainningService.getTrainningById(Number(id)).subscribe({
      next: (trainningData: Trainning) => {
        this.trainning = trainningData;
        if (!this.trainning.exercises) {
          this.trainning.exercises = [];
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar treino:', error);
        this.snackBar.open('Erro ao carregar treino.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  /**
   * Carrega todos os exercícios disponíveis do serviço.
   */
  private loadAllAvailableExercises(): void {
    // CORREÇÃO: Chama o método getAllExercises() do ExerciseService
    this.exerciseService.getAllExercises().subscribe({
      next: (exercises: Exercise[]) => {
        this.allAvailableExercises = exercises;
      },
      error: (error: any) => {
        console.error('Erro ao carregar lista de exercícios disponíveis:', error);
        this.snackBar.open('Erro ao carregar exercícios disponíveis.', 'Fechar', { duration: 3000 });
      }
    });
  }

  /**
   * Abre o modal para selecionar exercícios.
   */
  openAddExerciseModal(): void {
    const dialogRef = this.dialog.open(ExerciseSelectionModalComponent, {
      width: '500px', // Largura ajustada para a lista
      data: { exercises: this.allAvailableExercises } // Passa a lista de exercícios disponíveis
    });

    dialogRef.afterClosed().subscribe((selectedExercises: Exercise[]) => {
      if (selectedExercises && this.trainning) {
        // Filtra para adicionar apenas exercícios que ainda não estão no treino
        const newExercisesToAdd = selectedExercises.filter(
          selectedEx => !this.trainning?.exercises.some(existingEx => existingEx.id === selectedEx.id)
        );

        if (newExercisesToAdd.length > 0) {
          this.trainning.exercises.push(...newExercisesToAdd);
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
    if (this.trainning && this.trainning.id) {
      this.isSaving = true;
      this.trainningService.updateTrainning(this.trainning.id, this.trainning).subscribe({
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
    } else {
      this.snackBar.open('Nenhum treino para salvar.', 'Fechar', { duration: 3000 });
    }
  }

  /**
   * Retorna à página anterior (geralmente a lista ou a visualização).
   */
  goBack(): void {
    this.router.navigate(['/trainnings']);
  }

  deleteExercise(exerciseId: number): void {
    if (this.trainning) {
      this.trainning.exercises = this.trainning.exercises.filter(ex => ex.id !== exerciseId);
      this.snackBar.open('Exercício removido do treino.', 'Fechar', { duration: 2000 });
    } else {
      this.snackBar.open('Erro ao remover exercício. Treino não encontrado.', 'Fechar', { duration: 3000 });
    }
  }
}
