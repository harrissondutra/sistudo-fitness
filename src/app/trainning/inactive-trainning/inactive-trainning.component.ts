import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Adicionado DatePipe
// Removido: MatTableDataSource, MatTableModule, MatPaginator, MatPaginatorModule, MatSort, MatSortModule
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { TrainningService } from '../../services/trainning/trainning.service'; // Ajuste o caminho e o nome do serviço (TrainningService)
import { Trainning } from '../../models/trainning'; // Ajuste o caminho e o nome do modelo (Trainning)
import { Observable, catchError, tap, of } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Para mensagens
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // Para diálogos de confirmação
// import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component'; // Ajuste o caminho

// TODO: Ajuste o caminho abaixo para onde ConfirmDialogComponent realmente está localizado
// Exemplo:
// import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para o spinner de carregamento
import {} from '@angular/common/http'; // Para permitir injeção do HttpClient no serviço

// Módulo Ionic (necessário para ion-list, ion-item, ion-button)
import { IonicModule } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-trainning-list', // Mantido 'app-trainning-list' conforme o HTML mais recente
  standalone: true,
  imports: [
    CommonModule,
    // Removido MatTableModule, MatPaginatorModule, MatSortModule
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    
// TODO: `HttpClientModule` should not be imported into a component directly.
// Please refactor the code to add `provideHttpClient()` call to the provider list in the
// application bootstrap logic and remove the `HttpClientModule` import from this component.
HttpClientModule, // Necessário para a injeção do HttpClient
    IonicModule, // Adicionado IonicModule
    DatePipe // Adicionado DatePipe para o pipe de data no HTML
  ],
  templateUrl: './inactive-trainning.component.html',
  styleUrl: './inactive-trainning.component.scss'
})
export class InactiveTrainningComponent implements OnInit { // Mantido o nome `TrainningComponent` conforme o componente original

  // Lista original de todos os treinos
  allTrainnings: Trainning[] = [];
  // Lista de treinos filtrados (exibida no HTML)
  filteredTrainnings: Trainning[] = [];

  isLoading = false; // Para controlar o indicador de carregamento

  searchControl = new FormControl('');

  constructor(
    private TrainningService: TrainningService,
    private router: Router,
    private snackBar: MatSnackBar, // Injetado MatSnackBar
    private dialog: MatDialog // Injetado MatDialog
  ) { }

  ngOnInit(): void {
    this.loadTrainnings(); // Chamada para carregar os treinos

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

  // Removido ngAfterViewInit pois MatTableDataSource, MatPaginator e MatSort não são mais usados.
  // Removido setupFilterPredicate pois a filtragem agora é manual.
  // Removido setupSearch pois a lógica foi movida para ngOnInit.

  /**
   * Carrega a lista de treinos do serviço e aplica o filtro atual (se houver).
   */
  private loadTrainnings(): void {
    this.isLoading = true;
    this.TrainningService.listAllTrainningsInactive() // Assumindo que seu TrainningService tem um método getTrainnings()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (Trainnings: Trainning[]) => {
          this.allTrainnings = Trainnings; // Armazena todos os treinos
          this.applyFilter(this.searchControl.value || ''); // Aplica o filtro inicial ou o filtro atual
        },
        error: (error: HttpErrorResponse) => {
          this.handleError('Erro ao carregar treinos.', error);
        }
      });
  }

  /**
   * Aplica o filtro de busca na lista de treinos.
   * Filtra `allTrainnings` e atualiza `filteredTrainnings`.
   * @param filterValue O valor a ser filtrado.
   */
  applyFilter(filterValue: string): void {
    const lowerCaseFilter = filterValue.trim().toLowerCase();

    if (!lowerCaseFilter) {
      this.filteredTrainnings = [...this.allTrainnings]; // Se não houver filtro, mostra todos os treinos
      return;
    }

    this.filteredTrainnings = this.allTrainnings.filter(Trainning => {
      // Adapte os campos conforme seu modelo Trainning
      return (
        (Trainning.name?.toLowerCase() || '').includes(lowerCaseFilter)
        // Adicione outros campos de busca se necessário, como:
        // (Trainning.id?.toString() || '').includes(lowerCaseFilter)
      );
    });
  }

  /**
   * Navega para a tela de criação de treino.
   */
  createTrainning(): void {
    this.router.navigate(['/trainning-create']); // Rota para a tela de criação de treino
  }

  /**
   * Navega para a tela de edição de um treino específico.
   * @param id O ID do treino a ser editado.
   */
  editTrainning(id: string | undefined): void { // Usando `string | undefined` para IDs
    if (id) {
      this.router.navigate(['/trainning-edit', id]); // Rota para a tela de edição
    } else {
      this.showMessage('ID do treino inválido para edição.', 'error');
    }
  }

  /**
   * Exclui um treino após confirmação usando o ConfirmDialogComponent.
   * @param id O ID do treino a ser apagado.
   */
  deleteTrainning(id: string | undefined): void { // Usando `string | undefined` para IDs
    if (!id) {
      this.showMessage('ID do treino inválido para exclusão.', 'error');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja excluir este treino?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.TrainningService.deleteTrainning(Number(id)) // Assumindo que seu TrainningService tem um método deleteTrainning(id: string)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.showMessage('Treino excluído com sucesso!', 'success');
              this.loadTrainnings(); // Recarrega a lista após a exclusão
            },
            error: (error: HttpErrorResponse) => {
              this.handleError('Erro ao excluir treino.', error);
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
