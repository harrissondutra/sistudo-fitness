import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common'; // Adicionado DatePipe
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
    selector: 'app-trainning-list',
    standalone: true,
    imports: [
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    IonicModule,
    DatePipe
],
    templateUrl: './trainning.component.html',
    styleUrls: ['./trainning.component.scss'],
    providers: [DatePipe]
})
export class TrainningComponent implements OnInit { // Mantido o nome `TrainningComponent` conforme o componente original

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
    this.TrainningService.listAllActiveTrainnings() // Assumindo que seu TrainningService tem um método getTrainnings()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (Trainnings: Trainning[]) => {
          this.allTrainnings = Trainnings; // Armazena todos os treinos
          this.applyFilter(this.searchControl.value || ''); // Aplica o filtro inicial ou o filtro atual
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error.error?.message);
        }
      });
  }

  // Versão mais robusta do método applyFilter
applyFilter(filterValue: string): void {
  const lowerCaseFilter = filterValue.trim().toLowerCase();

  if (!lowerCaseFilter) {
    this.filteredTrainnings = [...this.allTrainnings];
    return;
  }

  this.filteredTrainnings = this.allTrainnings.filter(trainning => {
    // Verificação segura para o nome do treino
    const trainingName = trainning.name || '';
    const nameMatches = trainingName.toLowerCase().includes(lowerCaseFilter);

    // Verificação segura para o cliente e nome do cliente
    let clientNameMatches = false;
    if (trainning.client && typeof trainning.client === 'object') {
      const clientName = trainning.client.name || '';
      clientNameMatches = clientName.toLowerCase().includes(lowerCaseFilter);
    }

    return nameMatches || clientNameMatches;
  });
}

  /**
   * Navega para a tela de criação de treino.
   */
  createTrainning(): void {
    this.router.navigate(['/trainning-create/:id']); // Rota para a tela de criação de treino
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
              this.handleError(error);
            }
          });
      }
    });
  }

   /**
   * Lida com erros de requisição HTTP e exibe uma mensagem no snackbar.
   * Prioriza a propriedade "message" do JSON enviado pelo backend.
   * @param error O objeto HttpErrorResponse completo.
   */
  private handleError(error: HttpErrorResponse): void {
    console.error('Ocorreu um erro na requisição:', error);

    let errorMessage: string;

    // Cenário 1: Erro do lado do cliente (ex: rede, CORS, erro no código Angular)
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro de conexão ou cliente: ${error.error.message}`;
    }
    // Cenário 2: Erro retornado pelo servidor
    else {
      // **PRIORIDADE MÁXIMA: Buscar a propriedade 'message' do objeto error.error**
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      }
      // Outras verificações para diferentes formatos de erro do backend
      else if (typeof error.error === 'string' && error.error.trim() !== '') {
        // Se o corpo do erro for uma string pura do backend
        errorMessage = error.error;
      } else if (error.error && typeof error.error === 'object' && error.error.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
        // Para erros de validação com lista de erros (ex: Spring Validation com "errors" array)
        errorMessage = error.error.errors.map((err: any) => err.defaultMessage || err.message || 'Erro de validação').join('; ');
      } else if (error.error && typeof error.error === 'object' && error.error.error && typeof error.error.error === 'string' && error.error.error.trim() !== '') {
        // Para o caso em que o "message" está dentro de uma propriedade "error"
        errorMessage = error.error.error;
      }
      // Fallback para mensagens baseadas no status HTTP ou genéricas se o backend não fornecer um "message" claro
      else {
        switch (error.status) {
          case 0:
            errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.';
            break;
          case 400:
            errorMessage = 'Requisição inválida. Verifique os dados enviados.';
            break;
          case 401:
            errorMessage = 'Não autorizado. Faça login novamente.';
            break;
          case 403:
            errorMessage = 'Acesso negado. Você não tem permissão para esta ação.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
            break;
          default:
            errorMessage = `Erro do servidor (${error.status}): ${error.statusText || 'Ocorreu um erro inesperado.'}`;
            break;
        }
      }
    }

    this.showMessage(errorMessage, 'error');
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

   getTrainningById(id: string) {
    this.router.navigate(['/trainning-view', id]);
  }


}
