import { Component, Output, EventEmitter, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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

  constructor(public authService: AuthService) {}

  // Novo item para o link Home direto
  homeLink = { label: 'Home', route: '/', icon: 'home' };

  // Itens de menu que terão painéis de expansão
  expandableMenuItems: MenuItem[] = [
    {
      title: 'Usuários',
      icon: 'person',
      links: [
        { label: 'Listar Usuários', route: '/user-list' },
        { label: 'Criar Novo Usuário', route: '/user-create' },
      ]
    },
    {
      title: 'Clientes',
      icon: 'group',
      links: [
        { label: 'Listar Clientes', route: '/clients-list' },
        { label: 'Criar Novo Cliente', route: '/register' },
      ]
    },
     {
      title: 'Médicos',
      icon: 'stethoscope',

      links: [
        { label: 'Listar Médicos', route: '/doctor-list' },
        { label: 'Criar Novo Médico', route: '/doctor-create' },
        { label: 'Editar Médico', route: '/doctor-update/:id' },
      ]
    },
     {
      title: 'Personal Trainers',
      icon: 'body_system',

      links: [
        { label: 'Listar Personal', route: '/personal-list' },
        { label: 'Criar Novo Personal', route: '/personal-create' },
        { label: 'Editar Personal', route: '/personal-update/:id' },
      ]
    },
     {
      title: 'Nutricionistas',
      icon: 'body_fat',

      links: [
        { label: 'Listar Nutricionistas', route: '/nutritionist-list' },
        { label: 'Criar Novo Nutricionista', route: '/nutritionist-create' },
        { label: 'Editar Nutricionista', route: '/nutritionist-update/:id' },
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

  get visibleMenuItems(): MenuItem[] {
    if (this.authService.isAdmin()) {
      return this.expandableMenuItems;
    }
    // Aqui você pode filtrar por outras roles, se desejar
    // Exemplo: return this.expandableMenuItems.filter(item => !item.adminOnly);
    return this.expandableMenuItems;
  }

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
