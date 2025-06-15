import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpErrorResponse, HttpClientModule } from '@angular/common/http'; // Necessário para HttpErrorResponse e injeção do HttpClient
import { finalize } from 'rxjs/operators';

// Importe as interfaces de modelo e serviços necessários
import { Exercise, ExerciseCategory } from '../../models/exercise'; // Ajuste o caminho conforme sua estrutura de pastas
import { ExerciseService } from '../../services/exercise/exercise.service'; // Ajuste o caminho e crie este serviço
import { ExerciseCategoryService } from '../../services/exercise/exercise-category.service';

@Component({
  selector: 'app-create-exercise', // Mantém o seletor original do seu esboço
  templateUrl: './create-exercise.component.html', // Usa o HTML que você forneceu
  styleUrls: ['./create-exercise.component.scss'], // Você precisará criar este arquivo SCSS
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
    HttpClientModule // Importe se este componente ou seus serviços injetarem diretamente o HttpClient
  ]
})
export class CreateExerciseComponent implements OnInit {
  exerciseForm!: FormGroup;
  categories: ExerciseCategory[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private exerciseService: ExerciseService,
    private exerciseCategory: ExerciseCategoryService, // Serviço para buscar as categorias
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initForm(); // Inicializa o formulário no construtor
  }

  ngOnInit(): void {
    this.loadCategories(); // Carrega as categorias quando o componente é inicializado
  }

  /**
   * Inicializa o FormGroup com os controles e validadores para o formulário de exercício.
   */
  private initForm(): void {
    this.exerciseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''], // Campo de descrição é opcional
      categoryId: [null, [Validators.required]], // O ID da categoria é obrigatório
      // Validação de URL de vídeo: permite URLs do YouTube e similares, sendo opcional
      videoUrl: ['', [Validators.pattern(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)]]
    });
  }

  /**
   * Carrega a lista de categorias do serviço de categorias.
   */
  private loadCategories(): void {
    this.isLoading = true;
    this.exerciseCategory.getAllCategories() // Assumindo que CategoryService.getCategories() retorna Observable<ExerciseCategory[]>
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
    // Marca todos os campos como 'touched' para que as mensagens de erro de validação apareçam
    if (this.exerciseForm.invalid) {
      this.markFormGroupTouched(this.exerciseForm);
      this.showMessage('Por favor, preença todos os campos obrigatórios e válidos.', 'error');
      return;
    }

    this.isLoading = true;
    const formValue = this.exerciseForm.value;

    // Busca o objeto completo da categoria selecionada com base no ID
    const selectedCategory = this.categories.find(cat => cat.id === formValue.categoryId);

    // Constrói o objeto Exercise a ser enviado ao backend
    const exerciseToCreate: Exercise = {
      name: formValue.name,
      description: formValue.description,
      category: selectedCategory, // Envia o objeto de categoria completo
      videoUrl: formValue.videoUrl
    };

    // Chama o serviço de exercício para criar o novo exercício
    this.exerciseService.createExercise(exerciseToCreate)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: Exercise) => {
          this.showMessage('Exercício criado com sucesso!', 'success');
          this.router.navigate(['/exercises']); // Redireciona para a lista de exercícios após o sucesso
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao criar exercício.', error);
        }
      });
  }

  /**
   * Função auxiliar para lidar com erros de requisição HTTP e exibir mensagens no snackbar.
   * @param message Mensagem amigável para o usuário.
   * @param error O objeto HttpErrorResponse contendo detalhes do erro.
   */
  private handleError(message: string, error: HttpErrorResponse): void {
    console.error(`${message}:`, error); // Loga o erro completo para depuração
    const errorMessage = error.error?.message || error.message; // Tenta obter uma mensagem de erro mais detalhada do backend
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
