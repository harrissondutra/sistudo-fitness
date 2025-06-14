import { Component, Input } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importe o Router
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    RouterModule // <-- Adicionado RouterModule para navegação
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  @Input() sidenav!: MatSidenav;

  // CORREÇÃO: Injete o Router no construtor
  constructor(private router: Router) { }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  goToHome(): void {
    this.router.navigate(['/']); // Navega para a rota raiz
  }
}
