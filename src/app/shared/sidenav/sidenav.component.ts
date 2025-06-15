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

  // Novo item para o link Home direto
  homeLink = { label: 'Home', route: '/' };

  // Itens de menu que terão painéis de expansão (anteriormente 'menuItems')
  expandableMenuItems: MenuItem[] = [
    {
      title: 'Usuários',
      links: [
        { label: 'Listar Usuários', route: '/users-list' },
        { label: 'Criar Novo Usuário', route: '/register' },
      ]
    },
    {
      title: 'Treinos',
      links: [
        { label: 'Listar Treinos', route: '/trainning' },
        { label: 'Criar Novo Treino', route: '/trainning-create' },
      ]
    },
    {
      title: 'Exercícios',
      links: [
        { label: 'Listar Exercícios', route: '/exercises' },
        { label: 'Criar Novo Exercício', route: '/create-exercise' },
        { label: 'Criar Categoria', route: 'category-exercise' },
      ]
    },
  ];

  onLinkClick() {
    this.linkClicked.emit();
  }
}
