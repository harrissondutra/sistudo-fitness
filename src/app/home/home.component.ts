import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, of } from 'rxjs';
import { map, shareReplay, take, catchError, tap } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Importe os módulos do Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Importado

// Importe os componentes compartilhados
import { SidenavComponent } from '../shared/sidenav/sidenav.component';
import { ToolbarComponent } from '../shared/toolbar/toolbar.component';

// Importe o ClientService e o modelo Client (Substituindo UserService e User)
import { ClientService } from '../services/client/client.service';
import { Client } from '../models/client';

// Importe o TrainingService e o modelo Training (Substituindo TrainningService e Trainning)
import { TrainningService } from '../services/trainning/trainning.service';
import { Trainning } from '../models/trainning';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true, // Adicionado standalone, se o seu projeto estiver usando
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    SidenavComponent,
    ToolbarComponent,
    MatProgressSpinnerModule
  ]
})
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  totalClientsCount: number = 0; // Renomeado para totalClientsCount
  totalTrainingsCount: number = 0; // Mantido, representa treinos totais (ativos + inativos)
  totalTrainingsInactiveCount: number = 0; // Mantido

  loading: boolean = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public router: Router,
    private clientService: ClientService, // Injetado ClientService
    private trainningService: TrainningService // Injetado TrainingService
  ) { }

  ngOnInit(): void {
    this.loadTotalClientsCount(); // Chamando loadTotalClientsCount
    this.loadTotalTrainingsCount();
    this.loadTotalTrainingsInactiveCount();
  }

  loadTotalClientsCount(): void { // Renomeado para loadTotalClientsCount
    this.loading = true;
    this.clientService.getAllClients().pipe( // Usando clientService.getAllClients()
      tap((clients: Client[]) => { // Tipando como Client[]
        this.totalClientsCount = clients.length;
        this.loading = false;
      }),
      catchError(error => {
        console.error('Erro ao carregar a contagem total de clientes:', error);
        this.totalClientsCount = 0;
        this.loading = false;
        return of([]);
      })
    ).subscribe();
  }

  loadTotalTrainingsCount(): void {
    this.loading = true;
    this.trainningService.listAllTrainnings().pipe( // Usando trainingService.listAllTrainings()
      tap((trainings: Trainning[]) => { // Tipando como Training[]
        this.totalTrainingsCount = trainings.length; // Total de todos os treinos
        this.loading = false;
      }),
      catchError(error => {
        console.error('Erro ao carregar a contagem total de treinos:', error);
        this.totalTrainingsCount = 0;
        this.loading = false;
        return of([]);
      })
    ).subscribe();
  }

  loadTotalTrainingsInactiveCount(): void {
    this.loading = true;
    this.trainningService.listAllTrainnings().pipe( // Usando trainingService.listAllTrainings()
      tap((trainings: Trainning[]) => { // Tipando como Training[]
        const inactiveTrainings = trainings.filter(t => !t.active);
        this.totalTrainingsInactiveCount = inactiveTrainings.length;
        this.loading = false;
      }),
      catchError(error => {
        console.error('Erro ao carregar a contagem de treinos inativos:', error);
        this.totalTrainingsInactiveCount = 0;
        this.loading = false;
        return of([]);
      })
    ).subscribe();
  }


  onSidenavLinkClicked(): void {
    this.isHandset$.pipe(
      take(1)
    ).subscribe(isHandset => {
      if (isHandset && this.sidenav) {
        this.sidenav.close();
      }
    });
  }

  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }
}
