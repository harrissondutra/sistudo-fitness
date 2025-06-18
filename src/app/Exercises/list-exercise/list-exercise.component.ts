import { Component, OnInit } from '@angular/core'; // Removido ViewChild, AfterViewInit

// Removido: MatTableDataSource, MatTableModule, MatPaginator, MatPaginatorModule, MatSort, MatSortModule
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ExerciseService } from '../../services/exercise/exercise.service'; // Ajuste o caminho conforme sua estrutura
import { Exercise } from '../../models/exercise'; // Ajuste o caminho conforme sua estrutura
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http'; // Necessário para usar o HttpClient
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Para diálogos de confirmação
// TODO: Ajuste o caminho conforme a localização real do ConfirmDialogComponent
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
// Certifique-se de que o caminho acima está correto para o seu projeto.

// Módulo Ionic (necessário para ion-list, ion-item, ion-button)
import { IonicModule } from '@ionic/angular';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
    selector: 'app-exercise-list', // Mantido 'app-exercise-list' conforme o HTML
    templateUrl: './list-exercise.component.html',
    styleUrls: ['./list-exercise.component.scss'],
    imports: [
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatSnackBarModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    IonicModule
]
})
export class ListExerciseComponent implements OnInit { // Removido AfterViewInit

  // Lista original de todos os exercícios
  allExercises: Exercise[] = [];
  // Lista de exercícios filtrados (exibida no HTML)
  filteredExercises: Exercise[] = [];

  // Controle para o campo de busca
  searchControl = new FormControl('');

  isLoading = false;
  // totalExercises não é mais necessário com ion-list sem paginador do Material

  constructor(
    private exerciseService: ExerciseService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog // Injetado MatDialog
  ) { }

  ngOnInit(): void {
    // Carrega os exercícios quando o componente é inicializado
    this.loadExercises();

    // Adiciona um listener para o campo de busca
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), // Espera 300ms após a última digitação
        distinctUntilChanged() // Garante que só emite se o valor for diferente do anterior
      )
      .subscribe(value => {
        this.applyFilter(value || ''); // Aplica o filtro
      });
  }

  // Removido ngAfterViewInit pois MatPaginator e MatSort não são mais usados.

  /**
   * Carrega a lista de exercícios do serviço e popula a lista filtrada.
   */
  private loadExercises(): void {
    this.isLoading = true;
    this.exerciseService.getAllExercises() // Assumindo que seu ExerciseService tem um método getAllExercises()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (exercises: Exercise[]) => {
          this.allExercises = exercises; // Atribui os dados à lista completa
          this.applyFilter(this.searchControl.value || ''); // Aplica o filtro inicial
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar exercícios.', error);
        }
      });
  }

  /**
   * Aplica o filtro de busca na lista de exercícios.
   * Filtra `allExercises` e atualiza `filteredExercises`.
   * @param filterValue O valor a ser filtrado.
   */
  applyFilter(filterValue: string): void {
    const lowerCaseFilter = filterValue.trim().toLowerCase();

    if (!lowerCaseFilter) {
      this.filteredExercises = [...this.allExercises]; // Se não houver filtro, mostra todos
      return;
    }

    this.filteredExercises = this.allExercises.filter(exercise => {
      // Adapte os campos conforme seu modelo Exercise
      return (
        (exercise.name?.toLowerCase() || '').includes(lowerCaseFilter) ||
        (exercise.description?.toLowerCase() || '').includes(lowerCaseFilter)
        // Adicione outros campos de busca se necessário, como:
        // (exercise.id?.toString() || '').includes(lowerCaseFilter)
      );
    });
  }

  /**
   * Navega para a tela de criação de exercício.
   */
  createExercise(): void {
    this.router.navigate(['/create-exercise']); // Rota para a tela de criação
  }

  /**
   * Navega para a tela de visualização de um exercício específico.
   * @param exercise O exercício a ser visualizado.
   */
  onView(exercise: Exercise): void {
    this.router.navigate(['/exercises/view', exercise.id]); // Rota para a tela de visualização
  }

  /**
   * Navega para a tela de edição de um exercício específico.
   * @param exercise O exercício a ser editado.
   */
  onEdit(exercise: Exercise): void {
    this.router.navigate(['/exercises/edit', exercise.id]); // Rota para a tela de edição
  }

  /**
   * Exclui um exercício após confirmação usando o ConfirmDialogComponent.
   * @param id O ID do exercício a ser excluído.
   */
  deleteExercise(id: string | undefined): void {
    if (!id) {
      this.showMessage('ID do exercício inválido para exclusão.', 'error');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja excluir este exercício?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.exerciseService.deleteExercise(id)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.showMessage('Exercício excluído com sucesso!', 'success');
              this.loadExercises(); // Recarrega a lista após a exclusão
            },
            error: (error: HttpErrorResponse) => {
              this.handleError('Erro ao excluir exercício.', error);
            }
          });
      }
    });
  }

  /**
   * Lida com erros de requisição HTTP e exibe uma mensagem.
   * @param message Mensagem a ser exibida.
   * @param error Objeto de erro HTTP.
   */
  private handleError(message: string, error: HttpErrorResponse): void {
    console.error(`${message}:`, error);
    this.showMessage(message + ' Detalhes: ' + (error.error?.message || error.message), 'error');
  }

  /**
   * Exibe uma mensagem de notificação (snackbar).
   * @param message Mensagem a ser exibida.
   * @param type Tipo da mensagem ('success' ou 'error').
   */
  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'success' ? 3000 : 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}
