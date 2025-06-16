import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, of } from 'rxjs';
import { map, shareReplay, take, catchError, tap } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Importe os módulos do Angular Material e seus componentes filhos
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card'; // Certifique-se de que MatCardModule está importado
import { SidenavComponent } from '../shared/sidenav/sidenav.component';
import { ToolbarComponent } from '../shared/toolbar/toolbar.component';

// Importe o UserService e o modelo User
import { UserService } from '../services/user/user.service';
import { User } from '../models/user';

// CORREÇÃO: Importe o TrainningService e o modelo Trainning
import { TrainningService } from '../services/trainning/trainning.service';
import { Trainning } from '../models/trainning';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
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
    MatProgressSpinnerModule // Certifique-se de que MatProgressSpinnerModule está importado
  ]
})
// ...existing imports...

export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  totalUsersCount: number = 0;
  totalTrainingsCount: number = 0;
  totalTrainingsInactiveCount: number = 0;

  loading: boolean = false; // Propriedade para controle de loading

  constructor(
    private breakpointObserver: BreakpointObserver,
    public router: Router,
    private userService: UserService,
    private trainningService: TrainningService
  ) { }

  ngOnInit(): void {
    this.loadTotalUsersCount();
    this.loadTotalTrainingsCount();
    this.loadTotalTrainingsInactiveCount()
  }

  loadTotalUsersCount(): void {
    this.loading = true;
    this.userService.getAllUsers().pipe(
      tap(users => {
        this.totalUsersCount = users.length;
        this.loading = false;
      }),
      catchError(error => {
        console.error('Erro ao carregar a contagem total de clientes:', error);
        this.totalUsersCount = 0;
        this.loading = false;
        return of([]);
      })
    ).subscribe();
  }

  loadTotalTrainingsCount(): void {
    this.loading = true;
    this.trainningService.listAllTrainningsActive().pipe(
      tap(trainings => {
        this.totalTrainingsCount = trainings.length;
        this.totalTrainingsInactiveCount = trainings.filter(t => t.active).length;
        this.loading = false;
      }),
      catchError(error => {
        console.error('Erro ao carregar a contagem total de treinos:', error);
        this.totalTrainingsCount = 0;
        this.totalTrainingsInactiveCount = 0;
        this.loading = false;
        return of([]);
      })
    ).subscribe();
  }

  loadTotalTrainingsInactiveCount(): void {
  this.loading = true;
  this.trainningService.listAllTrainnings().pipe(
    tap(trainings => {
      // Considera inativos os que têm active === false
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
