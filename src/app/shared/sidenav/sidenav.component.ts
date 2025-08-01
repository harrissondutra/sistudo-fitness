import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MenuService, MenuItem, LinkItem, SubLinkItem } from '../../services/menu-visibility/menu.service';

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
  ) { }

  ngOnInit(): void {
    // Obter os menus do serviço
    this.expandableMenuItems = this.menuService.getMenuItems();

    // Inscrever-se para atualizações
    this.menuService.menuItems$.subscribe(menuItems => {
      this.expandableMenuItems = menuItems;
    });
  }

  get visibleMenuItems(): MenuItem[] {
  console.log('Menus disponíveis:', this.expandableMenuItems);

  // Simplificando a lógica para garantir que itens visíveis sejam mostrados
  return this.expandableMenuItems
    .filter(menu => menu.visible)
    .map(menu => {
      // Criar uma cópia profunda para evitar modificação dos objetos originais
      const filteredMenu = JSON.parse(JSON.stringify(menu)) as MenuItem;

      // Filtrar apenas links visíveis
      if (filteredMenu.links) {
        filteredMenu.links = filteredMenu.links
          .filter((link: LinkItem) => link.visible === true)
          .map((link: LinkItem) => {
            // Tratar sublinks se existirem
            if (link.sublinks && link.sublinks.length > 0) {
              link.sublinks = link.sublinks.filter((sublink: SubLinkItem) => sublink.visible === true);
            }
            return link;
          });
      }

      return filteredMenu;
    })
    .filter(menu => menu.links && menu.links.length > 0);
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
