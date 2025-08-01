import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MenuService, MenuItem } from '../../services/menu-visibility/menu.service';

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
export class SidenavComponent implements OnInit {
  @Output() linkClicked = new EventEmitter<void>();
  @Output() expandClicked = new EventEmitter<void>();
  @Input() collapsed = false;

  // Novo item para o link Home direto
  homeLink = { label: 'Home', route: '/', icon: 'home' };

  // Use os menus do serviço compartilhado
  expandableMenuItems: MenuItem[] = [];

  constructor(
    public authService: AuthService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    // Obter os menus do serviço
    this.expandableMenuItems = this.menuService.getMenuItems();

    // Inscrever-se para atualizações
    this.menuService.menuItems$.subscribe(menuItems => {
      this.expandableMenuItems = menuItems;
    });
  }

  get visibleMenuItems(): MenuItem[] {
    const userRole = this.authService.getUserRole();

    // Para admin, não filtra nada
    if (this.authService.isAdmin()) {
      return this.expandableMenuItems;
    }

    // Para outros papéis, mostra apenas os itens visíveis
    return this.expandableMenuItems
      .filter(menu => menu.visible)
      .map(menu => {
        const filteredMenu = { ...menu };

        // Filtra links visíveis
        if (filteredMenu.links) {
          filteredMenu.links = filteredMenu.links.filter(link => link.visible)
            .map(link => {
              // Se tem sublinks, filtra os visíveis
              if (link.sublinks) {
                return {
                  ...link,
                  sublinks: link.sublinks.filter(sublink => sublink.visible)
                };
              }
              return link;
            });
        }

        return filteredMenu;
      });
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
