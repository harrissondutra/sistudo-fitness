// exercise-selection-modal.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExerciseDto } from '../../models/exercise';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-exercise-selection-modal',
  templateUrl: './exercise-selection-modal.component.html',
  styleUrls: ['./exercise-selection-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule
  ]
})
export class ExerciseSelectionModalComponent implements OnInit {
  availableExercises: ExerciseDto[] = [];
  selectedExercises: ExerciseDto[] = [];
  filteredExercises: ExerciseDto[] = [];
  searchTerm: string = '';

  constructor(
    public dialogRef: MatDialogRef<ExerciseSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { exercises: ExerciseDto[] }
  ) { }

  ngOnInit(): void {
    this.availableExercises = this.data.exercises || [];
    this.filteredExercises = [...this.availableExercises];
  }

  filterExercises(): void {
    if (!this.searchTerm.trim()) {
      this.filteredExercises = [...this.availableExercises];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredExercises = this.availableExercises.filter(exercise =>
      exercise.name?.toLowerCase().includes(searchTermLower) ||
      (exercise.description && exercise.description.toLowerCase().includes(searchTermLower))
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterExercises();
  }

  toggleExerciseSelection(exercise: ExerciseDto): void {
    const index = this.selectedExercises.findIndex(e => e.id === exercise.id);

    if (index === -1) {
      this.selectedExercises.push(exercise);
    } else {
      this.selectedExercises.splice(index, 1);
    }
  }

  isExerciseSelected(exercise: ExerciseDto): boolean {
    return this.selectedExercises.some(e => e.id === exercise.id);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAddSelected(): void {
    this.dialogRef.close(this.selectedExercises);
  }
}
