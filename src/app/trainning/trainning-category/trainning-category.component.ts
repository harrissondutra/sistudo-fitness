import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core'; // Adicionado TemplateRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Importe o serviço e o modelo
import { TrainningCategoryService } from '../../services/trainning-category/trainning-category.service';
import { TrainningCategory } from '../../models/trainning-category';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-trainning-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule // Importando MatDividerModule para divisores
  ],
  templateUrl: './trainning-category.component.html',
  styleUrls: ['./trainning-category.component.scss']
})
export class TrainningCategoryComponent implements OnInit, OnDestroy {
  trainningCategoryForm!: FormGroup;
  dataSource = new MatTableDataSource<TrainningCategory>();
  displayedColumns: string[] = ['name', 'description', 'actions']; // Colunas da tabela
  isLoading = false;
  isEditing = false;
  currentCategoryId: number | null = null;

  private destroy$ = new Subject<void>(); // Para gerenciar desinscrições de observables

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // NOVO: Referência ao template do diálogo de confirmação no HTML
  @ViewChild('confirmationDialogTemplate') confirmationDialogTemplate!: TemplateRef<any>;
  // NOVO: Propriedade para armazenar os dados do diálogo, acessíveis pelo ng-template
  dialogData: any;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private trainningCategoryService: TrainningCategoryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTrainningCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Inicializa o formulário reativo para categorias de treino.
   */
  private initForm(): void {
    this.trainningCategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  /**
   * Carrega todas as categorias de treino e as exibe na tabela.
   */
  loadTrainningCategories(): void {
    this.isLoading = true;
    this.trainningCategoryService.getAllTrainningCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.dataSource.data = categories;
          this.isLoading = false;
        },
        error: (error) => {
          this.handleError('Erro ao carregar categorias.', error); // Mensagem traduzida
          this.isLoading = false;
        }
      });
  }

  /**
   * Aplica o filtro na tabela de categorias.
   * @param event O evento de entrada do campo de filtro.
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Envia o formulário para criar ou atualizar uma categoria.
   */
  onSubmit(): void {
    if (this.trainningCategoryForm.invalid) {
      this.markFormGroupTouched(this.trainningCategoryForm);
      this.showMessage('Por favor, preencha todos os campos obrigatórios corretamente.', 'error'); // Mensagem traduzida
      return;
    }

    this.isLoading = true;
    const category: TrainningCategory = this.trainningCategoryForm.value;

    if (this.isEditing && this.currentCategoryId !== null) {
      this.trainningCategoryService.updateTrainningCategory(this.currentCategoryId, category)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMessage('Categoria atualizada com sucesso!', 'success'); // Mensagem traduzida
            this.resetForm();
            this.loadTrainningCategories();
          },
          error: (error) => {
            this.handleError('Erro ao atualizar categoria.', error); // Mensagem traduzida
          }
        })
        .add(() => this.isLoading = false);
    } else {
      this.trainningCategoryService.createTrainningCategory(category)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showMessage('Categoria criada com sucesso!', 'success'); // Mensagem traduzida
            this.resetForm();
            this.loadTrainningCategories();
          },
          error: (error) => {
            this.handleError('Erro ao criar categoria.', error); // Mensagem traduzida
          }
        })
        .add(() => this.isLoading = false);
    }
  }

  /**
   * Preenche o formulário com os dados da categoria selecionada para edição.
   * @param category A categoria a ser editada.
   */
  editCategory(category: TrainningCategory): void {
    this.isEditing = true;
    this.currentCategoryId = category.id || null; // Garante que seja number ou null
    this.trainningCategoryForm.patchValue(category);
  }

  /**
   * Abre um diálogo de confirmação para excluir uma categoria usando um template Material.
   * @param category A categoria a ser excluída.
   */
  deleteCategory(category: TrainningCategory): void {
    // PREENCHE os dados para o template do diálogo
    this.dialogData = {
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a categoria "${category.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    };

    const dialogRef = this.dialog.open(this.confirmationDialogTemplate, { // NOVO: Abrindo o template
      width: '350px',
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      // Verifica se o resultado é true (confirmou) e se o ID da categoria existe
      if (result && category.id !== undefined && category.id !== null) {
        this.isLoading = true;
        this.trainningCategoryService.deleteTrainningCategory(category.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showMessage('Categoria excluída com sucesso!', 'success'); // Mensagem traduzida
              this.loadTrainningCategories();
            },
            error: (error) => {
              this.handleError('Erro ao excluir categoria.', error); // Mensagem traduzida
            }
          })
          .add(() => this.isLoading = false);
      }
    });
  }

  /**
   * Reseta o formulário e o estado de edição.
   */
  resetForm(): void {
    this.trainningCategoryForm.reset();
    this.isEditing = false;
    this.currentCategoryId = null;
    // Garante que os erros de validação sejam limpos
    Object.keys(this.trainningCategoryForm.controls).forEach(key => {
      this.trainningCategoryForm.get(key)?.setErrors(null);
    });
  }

  /**
   * Marca todos os controles de um FormGroup como tocados para exibir mensagens de validação.
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
   * Exibe uma mensagem no snackbar.
   * @param message A mensagem a ser exibida.
   * @param type O tipo da mensagem ('success', 'error', 'info').
   */
  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Fechar', { // Alterado 'Close' para 'Fechar'
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

  /**
   * Lida com erros HTTP e exibe uma mensagem amigável.
   * @param defaultMessage A mensagem padrão a ser exibida.
   * @param error O objeto HttpErrorResponse.
   */
  private handleError(defaultMessage: string, error: HttpErrorResponse): void {
    console.error(defaultMessage, error);
    const backendMessage = error.error?.message || error.message || 'Erro desconhecido.';
    this.showMessage(`${defaultMessage} Detalhes: ${backendMessage}`, 'error');
  }
}
