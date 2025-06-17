import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Adicionar MatDialogModule aqui para reconhecer os elementos do diálogo no template
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list'; // Para mat-selection-list
import { MatCheckboxModule } from '@angular/material/checkbox'; // Para checkboxes dentro da lista

import { Exercise } from '../../models/exercise'; // Importa a interface Exercise

@Component({
  selector: 'app-exercise-selection-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCheckboxModule,
    MatDialogModule, // <--- CORREÇÃO: Adicionado MatDialogModule aqui
  ],
  templateUrl: './exercise-selection-modal.component.html',
  styleUrl: './exercise-selection-modal.component.scss'
})
export class ExerciseSelectionModalComponent implements OnInit {

  // Lista de todos os exercícios disponíveis para seleção, injetada via MAT_DIALOG_DATA
  availableExercises: Exercise[] = [];
  // Lista de exercícios que foram selecionados pelo usuário no modal
  selectedExercises: Exercise[] = [];

  constructor(
    public dialogRef: MatDialogRef<ExerciseSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { exercises: Exercise[] }
  ) {
    // Recebe a lista de exercícios disponíveis do componente pai
    if (data && data.exercises) {
      this.availableExercises = data.exercises;
    }
  }

  ngOnInit(): void {
    // Inicialmente, nenhum exercício está selecionado
  }

  /**
   * Verifica se um exercício está atualmente selecionado.
   * @param exercise O exercício a ser verificado.
   * @returns Verdadeiro se o exercício estiver na lista de selecionados, falso caso contrário.
   */
  isExerciseSelected(exercise: Exercise): boolean {
    return this.selectedExercises.some(e => e.id === exercise.id);
  }

  /**
   * Adiciona ou remove um exercício da lista de selecionados.
   * @param exercise O exercício a ser adicionado/removido.
   */
  toggleExerciseSelection(exercise: Exercise): void {
    const index = this.selectedExercises.findIndex(e => e.id === exercise.id);
    if (index > -1) {
      // Se já estiver selecionado, remove
      this.selectedExercises.splice(index, 1);
    } else {
      // Se não estiver selecionado, adiciona
      this.selectedExercises.push(exercise);
    }
  }

  /**
   * Fecha o modal e retorna os exercícios selecionados.
   */
  onAddSelected(): void {
    this.dialogRef.close(this.selectedExercises);
  }

  /**
   * Fecha o modal sem retornar dados (cancela a seleção).
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}
