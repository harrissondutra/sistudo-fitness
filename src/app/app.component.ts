import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav'; // Importa MatSidenav
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'; // Para isHandset$
import { Observable } from 'rxjs';
import { map, shareReplay, take } from 'rxjs/operators'; // Adiciona 'take' para subscrições pontuais
import { RouterModule, Router } from '@angular/router'; // Para router-outlet e navegação
 // Para *ngIf e async pipe

// Importa os módulos do Angular Material e seus componentes filhos (se for standalone)
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidenavComponent } from './shared/sidenav/sidenav.component'; // Seu componente de navegação
import { ToolbarComponent } from './shared/toolbar/toolbar.component'; // Seu componente da toolbar


@Component({
    selector: 'app-root', // Ou o seletor do seu componente de layout
    templateUrl: './app.component.html', // O HTML que você forneceu
    styleUrls: ['./app.component.scss'], // Indica que é um componente standalone
    imports: [
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    SidenavComponent,
    ToolbarComponent
]
})
export class AppComponent implements OnInit {
  // Obtém uma referência à mat-sidenav usando o #sidenav do seu HTML
  @ViewChild('sidenav') sidenav!: MatSidenav;

  // Observable para detectar se o dispositivo é um "handset" (tela pequena)
  // Utiliza shareReplay para evitar múltiplas subscrições e compartilhar o último valor
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    public router: Router // Injeta o Router para usar router.url no template
  ) { }

  ngOnInit(): void {
    // Lógica de inicialização do componente, se houver.
  }

  /**
   * Este método é chamado quando um link dentro do componente <app-sidenav> é clicado.
   * Ele verifica o estado atual do 'isHandset$' e fecha a sidenav se estiver no modo 'over'
   * (tipicamente em dispositivos móveis ou telas pequenas).
   */
  onSidenavLinkClicked(): void {
    // Usa take(1) para obter o valor atual do Observable e automaticamente completar a subscrição.
    this.isHandset$.pipe(
      take(1)
    ).subscribe(isHandset => {
      if (isHandset && this.sidenav) {
        this.sidenav.close(); // Fecha a sidenav
      }
    });
  }

  /**
   * Alterna o estado da sidenav (abrir ou fechar).
   * Este método é tipicamente acionado por um botão na barra de ferramentas.
   */
  toggleSidenav(): void {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }
}
