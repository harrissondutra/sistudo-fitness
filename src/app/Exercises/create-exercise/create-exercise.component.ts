import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

// Importe as interfaces de modelo e serviços necessários
import { Exercise, ExerciseCategory } from '../../models/exercise'; // Certifique-se de que o caminho está correto e a interface 'Exercise' foi ajustada
import { ExerciseService } from '../../services/exercise/exercise.service'; // Ajuste o caminho e crie este serviço
import { ExerciseCategoryService } from '../../services/exercise/exercise-category.service'; // Importação do serviço de categoria

@Component({
    selector: 'app-create-exercise',
    templateUrl: './create-exercise.component.html',
    styleUrls: ['./create-exercise.component.scss'],
    standalone: true,
    imports: [
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
export class CreateExerciseComponent implements OnInit {
  exerciseForm!: FormGroup;
  categories: ExerciseCategory[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private exerciseService: ExerciseService,
    private exerciseCategory: ExerciseCategoryService, // Injeção do serviço de categoria
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCategories(); // Chama o método para carregar as categorias
  }

  /**
   * Inicializa o FormGroup com os controles e validadores para o formulário de exercício.
   */
  private initForm(): void {
    this.exerciseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      categoryId: [null, [Validators.required]], // categoryId para o select
      videoUrl: ['', [Validators.pattern(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)]]
    });
  }

  /**
   * Carrega a lista de categorias do serviço de categorias.
   */
  private loadCategories(): void {
    this.isLoading = true;
    this.exerciseCategory.getAllCategories() // Chamada ao método do serviço
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (categories: ExerciseCategory[]) => {
          this.categories = categories;
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar categorias.', error);
        }
      });
  }

  /**
   * Lida com o envio do formulário, validando os campos e enviando os dados para o serviço.
   */
  onSubmit(): void {
    if (this.exerciseForm.invalid) {
      this.markFormGroupTouched(this.exerciseForm);
      this.showMessage('Por favor, preencha todos os campos obrigatórios e válidos.', 'error');
      return;
    }

    this.isLoading = true;
    const formValue = this.exerciseForm.value;

    // A correção está aqui: enviando 'categoryId' diretamente, conforme a provável expectativa do backend ExerciseDto
    const exerciseToCreate: Exercise = {
      name: formValue.name,
      description: formValue.description,
      categoryId: formValue.categoryId, // Envia o ID da categoria diretamente
      videoUrl: formValue.videoUrl
    };

    this.exerciseService.createExercise(exerciseToCreate)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: Exercise) => {
          this.showMessage('Exercício criado com sucesso!', 'success');
          this.router.navigate(['/exercises']);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao criar exercício.', error);
        }
      });
  }

  /**
   * Função auxiliar para lidar com erros de requisição HTTP e exibir mensagens no snackbar.
   * @param message Mensagem amigável para o Cliente.
   * @param error O objeto HttpErrorResponse contendo detalhes do erro.
   */
  private handleError(message: string, error: HttpErrorResponse): void {
    console.error(`${message}:`, error);
    const errorMessage = error.error?.message || error.message;
    this.showMessage(`${message} Detalhes: ${errorMessage}`, 'error');
  }

  /**
   * Exibe uma mensagem de notificação usando MatSnackBar.
   * @param message Mensagem a ser exibida.
   * @param type Tipo da mensagem ('success' ou 'error') para aplicar estilos CSS (definidos no SCSS).
   */
  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'success' ? 3000 : 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }

  /**
   * Marca recursivamente todos os controles de um FormGroup como 'touched' para forçar a exibição de erros de validação.
   * @param formGroup O FormGroup a ser processado.
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
   * Navega de volta para a lista de exercícios ao clicar em "Cancelar".
   */
  cancel(): void {
    this.router.navigate(['/exercises']);
  }
}
