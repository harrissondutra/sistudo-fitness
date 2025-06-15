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
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatSortModule,
    MatTooltipModule
  ],
  templateUrl: './trainning.component.html',
  styleUrls: ['./trainning.component.scss']
})
export class TrainningComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Trainning> = new MatTableDataSource();
  displayedColumns: string[] = ['id', 'name', 'description', 'durationMinutes', 'intensityLevel', 'date', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  totalTrainings: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  searchControl = new FormControl('');

  constructor(
    private trainingService: TrainningService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.listAllTrainings();
    this.setupFilterPredicate();
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Configura o filterPredicate personalizado para a fonte de dados da tabela.
   * Permite buscar por texto em todas as colunas ou por userId específico.
   */
  private setupFilterPredicate(): void {
    this.dataSource.filterPredicate = (data: Trainning, filter: string): boolean => {
      const searchStr = filter.toLowerCase();
      return (
        (data.name?.toLowerCase() || '').includes(searchStr) ||
        (data.id?.toString() || '').includes(searchStr) ||
        (data.active?.toString() || '').includes(searchStr)
      );
    };
  }

  /**
   * Configura o mecanismo de busca com base no valor de busca.
   */
  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => this.applyFilter(value || ''))
    ).subscribe();
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
    this.router.navigate(['/trainning/edit', id]);
  }

  /**
   * Lida com a exclusão de um treino após confirmação.
   * @param id O ID do treino a ser apagado.
   */
  deleteTraining(id: number): void {
    if (confirm('Tem certeza que deseja apagar este treino? Esta ação é irreversível.')) {
      this.trainingService.deleteTrainning(id).subscribe({
        next: () => {
          this.listAllTrainings();
        },
        error: (error) => {
          console.error('Erro ao apagar treino:', error);
        }
      });
    }
  }

  /**
   * Navega para a tela de criação de um novo treino.
   * CORREÇÃO: Implementado para navegar para a rota de criação de treino.
   */
  createTraining(): void {
    this.router.navigate(['/trainning/create']);
  }
}
