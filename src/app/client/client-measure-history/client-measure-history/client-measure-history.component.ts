import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MeasureService } from '../../../services/measure/measure.service';
import { ClientService } from '../../../services/client/client.service';
import { Measure } from '../../../models/measure';
import { Client } from '../../../models/client';

@Component({
  selector: 'app-client-measure-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './client-measure-history.component.html',
  styleUrl: './client-measure-history.component.scss'
})
export class ClientMeasureHistoryComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();

  clientId!: number;
  client: Client | null = null;
  measures: Measure[] = [];
  dataSource = new MatTableDataSource<Measure>();
  loading = true;
  error = false;

  displayedColumns: string[] = [
    'data',
    'ombro',
    'peitoral',
    'cintura',
    'quadril',
    'braco_direito',
    'braco_esquerdo',
    'coxa_direita',
    'coxa_esquerda',
    'panturrilha_direita',
    'panturrilha_esquerda',
    'subescapular',
    'triceps',
    'abdominal',
    'suprailiaca',
    'axilar'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private measureService: MeasureService,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.clientId = +params['id'];
      if (this.clientId) {
        this.loadClientData();
        this.loadMeasuresHistory();
      } else {
        this.error = true;
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadClientData(): void {
    this.clientService.getClientById(this.clientId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (client) => {
          this.client = client;
        },
        error: (error) => {
          console.error('Erro ao carregar dados do cliente:', error);
          this.error = true;
          this.showSnackBar('Erro ao carregar dados do cliente.');
        }
      });
  }

  private loadMeasuresHistory(): void {
    this.measureService.getMeasureHistoryByUserId(this.clientId)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (measures) => {
          this.measures = measures || [];
          // Ordena por data decrescente (mais recente primeiro)
          if (this.measures.length > 0) {
            this.measures.sort((a, b) => {
              const dateA = new Date(a.data || 0);
              const dateB = new Date(b.data || 0);
              return dateB.getTime() - dateA.getTime();
            });
          }
          this.dataSource.data = this.measures;
        },
        error: (error) => {
          console.error('Erro ao carregar histórico de medidas:', error);
          this.measures = [];
          this.dataSource.data = [];
          this.showSnackBar('Erro ao carregar histórico de medidas.');
        }
      });
  }

  formatMeasure(value: number | null | undefined, unit: string): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return `${value} ${unit}`;
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';

    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      return parsedDate.toLocaleDateString('pt-BR');
    }

    if (date instanceof Date) {
      return date.toLocaleDateString('pt-BR');
    }

    return '-';
  }

  onBack(): void {
    this.router.navigate(['/client-dashboard', this.clientId]);
  }

  navigateToCurrentMeasures(): void {
    this.router.navigate(['/client-measure', this.clientId]);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
