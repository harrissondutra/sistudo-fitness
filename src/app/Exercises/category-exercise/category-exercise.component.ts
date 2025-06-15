import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule para diretivas como ngIf, ngFor
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Módulos para formulários reativos
import { Router } from '@angular/router'; // Para navegação
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Para exibir mensagens
import { MatFormFieldModule } from '@angular/material/form-field'; // Campo de formulário Material
import { MatInputModule } from '@angular/material/input'; // Input Material
import { MatButtonModule } from '@angular/material/button'; // Botões Material
import { MatIconModule } from '@angular/material/icon'; // Ícones Material
import { MatTooltipModule } from '@angular/material/tooltip'; // Tooltip Material

// Interface para a categoria de exercício, conforme fornecido anteriormente
export interface ExerciseCategory {
  id?: number;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-category-exercise',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // Necessário para usar FormGroup
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule, // Adicionado para o snackbar
    MatTooltipModule // Adicionado para tooltips nos botões
  ],
  templateUrl: './category-exercise.component.html',
  styleUrl: './category-exercise.component.scss' // Usando styleUrl para o arquivo SCSS
})
export class CategoryExerciseComponent implements OnInit {
  categoryForm!: FormGroup; // Declaração do FormGroup para o formulário
  isLoading = false; // Flag para controlar o estado de carregamento

  constructor(
    private fb: FormBuilder, // Injeta FormBuilder para construir o formulário
    private router: Router, // Injeta Router para navegação
    private snackBar: MatSnackBar // Injeta MatSnackBar para exibir mensagens
  ) {}

  ngOnInit(): void {
    this.initForm(); // Inicializa o formulário quando o componente é criado
  }

  /**
   * Inicializa o FormGroup com os controles e suas validações.
   */
  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Campo 'name' obrigatório com minLength
      description: [''] // Campo 'description' opcional
    });
  }

  /**
   * Manipula a submissão do formulário.
   */
  onSubmit(): void {
    // Verifica se o formulário é válido
    if (this.categoryForm.invalid) {
      this.markFormGroupTouched(this.categoryForm); // Marca os campos como 'touched' para exibir erros de validação
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', {
        duration: 3000,
        panelClass: ['error-snackbar'] // Classe CSS para estilo de erro no snackbar
      });
      return; // Interrompe a função se o formulário for inválido
    }

    this.isLoading = true; // Ativa o estado de carregamento

    const newCategory: ExerciseCategory = this.categoryForm.value; // Pega os valores do formulário

    // TODO: Implementar a lógica de envio para o serviço (API) aqui.
    // Exemplo simulado de sucesso/erro:
    console.log('Dados da nova categoria:', newCategory);

    // Simulação de chamada de API
    setTimeout(() => {
      this.isLoading = false; // Desativa o estado de carregamento

      // Simular sucesso
      this.snackBar.open('Categoria salva com sucesso!', 'Fechar', {
        duration: 3000,
        panelClass: ['success-snackbar'] // Classe CSS para estilo de sucesso no snackbar
      });
      this.router.navigate(['/exercises/categories']); // Redireciona para a lista de categorias (ou outra rota)
      // Simular erro
      // this.snackBar.open('Erro ao salvar categoria. Tente novamente.', 'Fechar', {
      //   duration: 5000,
      //   panelClass: ['error-snackbar']
      // });
    }, 1500); // Simula um atraso de 1.5 segundos para a chamada de API
  }

  /**
   * Marca todos os controles de um FormGroup como 'touched' recursivamente.
   * Útil para exibir mensagens de validação antes da submissão.
   * @param formGroup O FormGroup a ser marcado.
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
   * Cancela a operação e navega de volta para a lista de categorias.
   */
  cancel(): void {
    this.router.navigate(['/exercises/categories']); // Redireciona para a lista de categorias
  }
}
