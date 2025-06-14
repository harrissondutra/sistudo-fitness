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
    ToolbarComponent
  ]
})
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  totalUsersCount: number = 0;
  totalTrainingsCount: number = 0; // CORREÇÃO: Nova propriedade para armazenar a contagem total de treinos
  totalTrainingsActiveCount: number = 0; // CORREÇÃO: Nova propriedade para armazenar a contagem de treinos ativos


  constructor(
    private breakpointObserver: BreakpointObserver,
    public router: Router,
    private userService: UserService, // Injeta UserService
    private trainningService: TrainningService // CORREÇÃO: Injeta TrainningService
  ) { }

  ngOnInit(): void {
    // Lógica de inicialização do HomeComponent
    this.loadTotalUsersCount(); // Carrega a contagem total de usuários
    this.loadTotalTrainingsCount(); // CORREÇÃO: Carrega a contagem total de treinos e treinos ativos
  }

  /**
   * Carrega a contagem total de usuários do serviço e atualiza a propriedade.
   */
  loadTotalUsersCount(): void {
    this.userService.getAllUsers().pipe(
      tap(users => {
        this.totalUsersCount = users.length; // Atualiza a contagem com o número de usuários
      }),
      catchError(error => {
        console.error('Erro ao carregar a contagem total de usuários:', error);
        this.totalUsersCount = 0; // Define como 0 em caso de erro
        return of([]); // Retorna um Observable vazio para que a subscription continue
      })
    ).subscribe();
  }

  /**
   * CORREÇÃO: Carrega a contagem total de treinos e treinos ativos do serviço.
   */
  loadTotalTrainingsCount(): void {
    this.trainningService.listAllTrainnings().pipe( // Assumindo que getAllTrainings existe no TrainningService
      tap(trainings => {
        this.totalTrainingsCount = trainings.length; // Contagem total de treinos
        // Assumindo que o modelo Trainning tem uma propriedade 'active' (boolean)
        this.totalTrainingsActiveCount = trainings.filter(t => t.active).length;
      }),
      catchError(error => {
        console.error('Erro ao carregar a contagem total de treinos:', error);
        this.totalTrainingsCount = 0;
        this.totalTrainingsActiveCount = 0;
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
