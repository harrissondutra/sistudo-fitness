import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';

interface MenuItem {
  title: string;
  links: {
    label: string;
    route: string;
  }[];
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    RouterModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @Output() linkClicked = new EventEmitter<void>();

  // Refatorado para corresponder às rotas definidas em seu app.routes.ts
  menuItems: MenuItem[] = [
    {
      title: 'Usuários',
      links: [
        { label: 'Listar Usuários', route: '/users-list' },   // Nova rota para listar usuários
        { label: 'Criar Novo Usuário', route: '/register' }, // Rota existente
      ]
    },
    {
      title: 'Navegação Principal',
      links: [
        { label: 'Home', route: '/' },
        { label: 'Perfil', route: '/profile' },
        { label: 'Configurações', route: '/settings' },
        { label: 'Sair', route: '/logout' }
      ]
    },

  ];

  onLinkClick() {
    this.linkClicked.emit();
  }
}
