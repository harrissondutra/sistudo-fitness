import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ExerciseService } from '../../services/exercise/exercise.service'; // Ajuste o caminho conforme sua estrutura
import { Exercise } from '../../models/exercise'; // Ajuste o caminho conforme sua estrutura
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http'; // Necessário para usar o HttpClient

@Component({
  selector: 'app-list-exercise',
  templateUrl: './list-exercise.component.html',
  styleUrls: ['./list-exercise.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTooltipModule,
    MatSnackBarModule, // Para usar o MatSnackBar
    HttpClientModule // Para permitir injeção do HttpClient no serviço
  ]
})
export class ListExerciseComponent implements OnInit, AfterViewInit {
  // Colunas a serem exibidas na tabela
  displayedColumns: string[] = ['id', 'name', 'description', 'series', 'repetitions', 'actions'];

  // DataSource para a tabela do Material Angular
  dataSource = new MatTableDataSource<Exercise>([]);

  // Controle para o campo de busca
  searchControl = new FormControl('');

  // Referências para o paginador e o sort (ordenador) da tabela
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = false;
  totalExercises = 0; // Será atualizado após carregar os dados
  pageSize = 10; // Tamanho padrão da página

  constructor(
    private exerciseService: ExerciseService,
    private router: Router,
    private snackBar: MatSnackBar
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

  ngAfterViewInit(): void {
    // Conecta o DataSource ao paginador e ao sort após a view ser inicializada
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Carrega a lista de exercícios do serviço.
   */
  private loadExercises(): void {
    this.isLoading = true;
    this.exerciseService.getExercises() // Assumindo que seu ExerciseService tem um método getExercises()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (exercises: Exercise[]) => {
          this.dataSource.data = exercises; // Atribui os dados ao dataSource
          this.totalExercises = exercises.length; // Atualiza o total de exercícios
          this.showMessage('Exercícios carregados com sucesso!', 'success');
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar exercícios.', error);
        }
      });
  }

  /**
   * Aplica o filtro de busca ao DataSource.
   * @param filterValue O valor a ser filtrado.
   */
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    // Se o filtro resultar em dados vazios, volta para a primeira página
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Navega para a tela de criação de exercício.
   */
  createExercise(): void {
    this.router.navigate(['/exercises/create']); // Rota para a tela de criação
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
   * Exclui um exercício.
   * @param id O ID do exercício a ser excluído.
   */
  deleteExercise(id: string | undefined): void {
    if (!id) {
      this.showMessage('ID do exercício inválido para exclusão.', 'error');
      return;
    }

    if (confirm('Tem certeza que deseja excluir este exercício?')) {
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
