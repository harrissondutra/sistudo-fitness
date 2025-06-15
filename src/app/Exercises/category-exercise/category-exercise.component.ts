import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryExerciseService } from '../../services/category-exercise/category-exercise.service'; // ajuste o caminho conforme seu projeto
import { ExerciseCategory } from '../../models/exercise-category'; // ajuste o caminho conforme seu projeto

@Component({
  selector: 'app-category-exercise',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './category-exercise.component.html',
  styleUrl: './category-exercise.component.scss'
})
export class CategoryExerciseComponent implements OnInit {
  categoryForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private categoryService: CategoryExerciseService // INJETADO O SERVICE
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm);
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    const newCategory: ExerciseCategory = this.categoryForm.value;

    // CHAMADA REAL AO SERVICE
    this.categoryService.createCategory(newCategory).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Categoria salva com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/exercises/categories']);
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao salvar categoria. Tente novamente.', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
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
    this.router.navigate(['/exercises/categories']);
  }
}
