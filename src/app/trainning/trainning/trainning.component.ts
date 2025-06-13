import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { TrainningService } from '../../services/trainning/trainning.service';
import { Trainning } from '../../models/trainning';
import { Observable, catchError, tap, of } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-trainning',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './trainning.component.html',
  styleUrls: ['./trainning.component.scss']
})
export class TrainningComponent implements OnInit, AfterViewInit {
  // A propriedade 'dataSource' é declarada e inicializada corretamente aqui.
  // Se este erro ainda aparecer, pode ser um problema de cache do ambiente de desenvolvimento.
  dataSource: MatTableDataSource<Trainning> = new MatTableDataSource();
  displayedColumns: string[] = ['id', 'name', 'userId', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  totalTrainings: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  searchControl = new FormControl('');

  constructor(private trainingService: TrainningService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.listAllTrainings();
    this.setupFilterPredicate(); // Ensure filter predicate is set up

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => this.applyFilter(value || ''))
    ).subscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Configura o filterPredicate personalizado para a fonte de dados da tabela.
   * Permite buscar por texto em todas as colunas ou por userId específico.
   */
  private setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (data: Trainning, filter: string): boolean => {
      // Converte o filtro para minúsculas e remove espaços em branco extras
      const searchString = filter.trim().toLowerCase();

      // Tenta converter o filtro para um número para comparar com userId
      const searchNumber = Number(searchString);
      const isNumericSearch = !isNaN(searchNumber) && searchString.length > 0;

      // Se for uma busca numérica, tenta comparar com userId
      if (isNumericSearch && data.userId === searchNumber) {
        return true;
      }

      // Comparando apenas com as propriedades que existem no modelo Trainning
      const dataStr = (data.name || '') + (data.id || ''); // Assumindo que você pode querer buscar por ID também

      return dataStr.toLowerCase().includes(searchString);
    };
  }

  /**
   * Carrega todos os treinos da API usando o TrainingService.
   */
  listAllTrainings(): void {
    this.trainingService.listAllTrainnings().pipe(
      tap(trainings => {
        this.dataSource.data = trainings;
        this.totalTrainings = trainings.length;
        if (this.paginator) {
          this.paginator.length = trainings.length;
        }
      }),
      catchError(error => {
        console.error('Erro ao carregar treinos:', error);
        this.snackBar.open('Erro ao carregar treinos. Por favor, tente novamente mais tarde.', 'Fechar', { duration: 5000 });
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Aplica o filtro aos dados da tabela com base no valor de busca.
   * @param filterValue O valor do filtro.
   */
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Navega para a tela de edição de um treino específico.
   * @param id O ID do treino a ser editado.
   */
  editTraining(id: number): void {
    // Implemente a navegação para a tela de edição de treinos
    // Exemplo: this.router.navigate(['/trainings-edit', id]);
    this.snackBar.open(`Funcionalidade de edição para o treino ${id} não implementada.`, 'Fechar', { duration: 3000 });
    console.log('Editar treino com ID:', id);
  }

  /**
   * Lida com a exclusão de um treino após confirmação.
   * @param id O ID do treino a ser apagado.
   */
  deleteTraining(id: number): void {
    if (confirm('Tem certeza que deseja apagar este treino? Esta ação é irreversível.')) {
      this.trainingService.deleteTrainning(id).subscribe({
        next: () => {
          this.snackBar.open('Treino apagado com sucesso!', 'Fechar', { duration: 3000 });
          this.listAllTrainings(); // Recarrega a lista após a exclusão
        },
        error: (error) => {
          console.error('Erro ao apagar treino:', error);
          this.snackBar.open('Erro ao apagar treino. Verifique o console para mais detalhes.', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  /**
   * Navega para a tela de criação de um novo treino.
   */
  createTraining(): void {
    // Implemente a navegação para a tela de criação de treinos
    // Exemplo: this.router.navigate(['/trainings-register']);
    this.snackBar.open('Funcionalidade de criação de treino não implementada.', 'Fechar', { duration: 3000 });
    console.log('Criar novo treino');
  }
}
