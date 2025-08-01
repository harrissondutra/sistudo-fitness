import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
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
  private _visibleMenuItems: MenuItem[] = [];

  constructor(
    public authService: AuthService,
    private menuService: MenuService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Obter os menus do serviço inicialmente como array vazio
    this.expandableMenuItems = [];

    // Inscrever-se para atualizações
    this.menuService.menuItems$.subscribe(menuItems => {
      this.expandableMenuItems = menuItems || [];
      // Pré-calcular os menus visíveis
      this.updateVisibleMenuItems();
      // Forçar uma detecção de mudanças após os dados estarem prontos
      this.cdr.detectChanges();
    });

    // Carregar os menus iniciais
    this.expandableMenuItems = this.menuService.getMenuItems() || [];
    // Pré-calcular os menus visíveis
    this.updateVisibleMenuItems();
  }


   get visibleMenuItems(): MenuItem[] {
    return this._visibleMenuItems;
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
  private updateVisibleMenuItems(): void {
    if (!this.expandableMenuItems || this.expandableMenuItems.length === 0) {
      this._visibleMenuItems = [];
      return;
    }

    this._visibleMenuItems = this.expandableMenuItems
      .filter(menu => menu && menu.visible === true)
      .map(menu => {
        const filteredMenu = JSON.parse(JSON.stringify(menu)) as MenuItem;

        if (filteredMenu.links) {
          filteredMenu.links = filteredMenu.links
            .filter((link: LinkItem) => link && link.visible === true)
            .map((link: LinkItem) => {
              if (link.sublinks && link.sublinks.length > 0) {
                link.sublinks = link.sublinks.filter((sublink: SubLinkItem) =>
                  sublink && sublink.visible === true
                );
              }
              return link;
            })
            .filter(link => link !== null);
        }

        return filteredMenu;
      })
      .filter(menu => menu && menu.links && menu.links.length > 0);
  }
}
