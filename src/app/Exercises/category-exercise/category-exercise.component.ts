import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoryExerciseService } from '../../services/category-exercise/category-exercise.service';
import { ExerciseCategory } from '../../models/exercise-category';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { finalize } from 'rxjs/operators'; // Import finalize operator
import { CommonModule } from '@angular/common'; // Usually needed for *ngIf, etc.
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import for loading spinner

@Component({
  selector: 'app-category-exercise',
  standalone: true,
  imports: [
    CommonModule, // Added CommonModule for general directives
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule // Import for loading spinner
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
    private categoryService: CategoryExerciseService
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
      this.showMessage('Please fill in all required fields correctly.', 'error');
      return;
    }

    this.isLoading = true;
    const newCategory: ExerciseCategory = this.categoryForm.value;

    this.categoryService.createCategory(newCategory).pipe(
      finalize(() => this.isLoading = false) // Ensures isLoading is false after completion (success or error)
    ).subscribe({
      next: () => {
        this.showMessage('Category saved successfully!', 'success');
        this.router.navigate(['/exercises/categories']);
      },
      error: (error: HttpErrorResponse) => { // Type the error as HttpErrorResponse
        this.handleError('Error saving category', error); // Use a dedicated error handler
      }
    });
  }

  /**
   * Marks all controls in a FormGroup as touched.
   * @param formGroup The FormGroup to mark as touched.
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
   * Handles HTTP errors and displays a user-friendly message.
   * @param message A custom message to display before the backend error.
   * @param error The HttpErrorResponse object.
   */
  private handleError(message: string, error: HttpErrorResponse): void {
    console.error(`${message}:`, error); // Log the full error for debugging
    const backendMsg = error.error?.message || error.message || 'Unknown error occurred.';
    this.showMessage(`${message}. Details: ${backendMsg}`, 'error');
  }

  /**
   * Displays a Material Design snackbar message.
   * @param message The message to display.
   * @param type The type of message ('success', 'error', 'info').
   */
  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: type === 'success' ? 3000 : 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [
        type === 'success' ? 'success-snackbar' :
        type === 'error' ? 'error-snackbar' :
        'info-snackbar'
      ]
    });
  }

  cancel(): void {
    this.router.navigate(['/exercises/categories']);
  }
}
