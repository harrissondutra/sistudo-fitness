import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  title: string;
  icon?: string;
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
  @Output() expandClicked = new EventEmitter<void>();
  @Input() collapsed = false;

  // Novo item para o link Home direto
  homeLink = { label: 'Home', route: '/', icon: 'home' };

  // Itens de menu que terão painéis de expansão
  expandableMenuItems: MenuItem[] = [
    {
      title: 'Clientes',
      icon: 'person',
      links: [
        { label: 'Listar Clientes', route: '/clients-list' },
        { label: 'Criar Novo Cliente', route: '/register' },
      ]
    },
    {
      title: 'Treinos',
      icon: 'fitness_center',
      links: [
        { label: 'Exibir Treinos', route: '/trainning' },
        { label: 'Inativos', route: '/inactive-trainning' },
        { label: 'Criar Novo Treino', route: '/trainning-create' },
        { label: 'Criar Categoria de Treino', route: '/create-category-trainning' },
      ]
    },
    {
      title: 'Exercícios',
      icon: 'sports_gymnastics',
      links: [
        { label: 'Listar Exercícios', route: '/exercises' },
        { label: 'Inserir Categoria', route: '/category-exercise' },
        { label: 'Criar Novo Exercício', route: '/create-exercise' },
      ]
    },
  ];

  toggleSidenav() {
    this.collapsed = !this.collapsed;
  }

  onLinkClick() {
    this.linkClicked.emit();
  }

  expandSidenav() {
    this.expandClicked.emit();
  }
}
