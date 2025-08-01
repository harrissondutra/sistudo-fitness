import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { UserRole, USER_ROLE_LABELS } from '../../models/user_role';
import { MenuVisibilityService } from '../../services/menu-visibility/menuVisibility.service';
import { Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem } from '../../services/menu-visibility/menu.service';


@Component({
  selector: 'app-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSnackBarModule,
    MatDividerModule,
    MatIconModule,
    MatExpansionModule,
    FormsModule,
  ],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  roles = Object.values(UserRole);
  roleLabels = USER_ROLE_LABELS;
  selectedRole: UserRole | null = null;
  menuItems: MenuItem[] = [];



  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private menuVisibilityService: MenuVisibilityService,
    private menuService: MenuService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Obter os itens de menu do serviço compartilhado
    this.menuItems = this.menuService.getMenuItems();

    // Pré-seleciona a role ADMIN
    if (this.roles.length > 0) {
      this.selectedRole = this.roles.includes(UserRole.ADMIN) ?
                          UserRole.ADMIN :
                          this.roles[0];
      this.onRoleChange();
    }

    // Assinar às mudanças no menu compartilhado
    this.menuService.menuItems$.subscribe(menuItems => {
      this.menuItems = menuItems;
      this.cd.detectChanges();
    });
  }


  onRoleChange(): void {
    if (this.selectedRole) {
      this.loadMenuPermissions(this.selectedRole);
    }
  }

  loadMenuPermissions(role: UserRole): void {
    // Obtém as permissões salvas para a role selecionada
    const permissions = this.menuVisibilityService.getMenuPermissions(role);

    if (permissions) {
      // Atualiza a visibilidade dos menus com as permissões salvas
      this.updateMenuVisibility(permissions);
    } else {
      // Se não houver permissões salvas, define visibilidade padrão
      this.resetToDefaultPermissions(role);
    }
  }

  updateMenuVisibility(permissions: any): void {
    // Percorre todos os itens de menu e define a visibilidade conforme as permissões salvas
    this.menuItems.forEach(menu => {
      const menuPermission = permissions[menu.id];
      if (menuPermission !== undefined) {
        menu.visible = menuPermission.visible;

        // Atualiza visibilidade dos links
        if (menu.links) {
          menu.links.forEach(link => {
            const linkId = link.id || '';
            if (menuPermission.links && menuPermission.links[linkId] !== undefined) {
              link.visible = menuPermission.links[linkId].visible;
            }

            // Atualiza visibilidade dos sublinks, se existirem
            if ('sublinks' in link && link.sublinks) {
              link.sublinks.forEach(sublink => {
                const sublinkId = sublink.id || '';
                if (menuPermission.links &&
                  menuPermission.links[linkId] &&
                  menuPermission.links[linkId].sublinks &&
                  menuPermission.links[linkId].sublinks[sublinkId] !== undefined) {
                  sublink.visible = menuPermission.links[linkId].sublinks[sublinkId].visible;
                }
              });
            }
          });
        }
      }
    });
  }

  resetToDefaultPermissions(role: UserRole): void {
    // Definir permissões padrão baseadas na role
    switch (role) {
      case UserRole.CLIENT:
        // Cliente só vê o menu de Clientes
        this.menuItems.forEach(menu => {
          menu.visible = menu.id === 'clients';
          if (menu.links) {
            menu.links.forEach(link => link.visible = menu.visible);
          }
        });
        break;

      case UserRole.DOCTOR:
        // Médico vê menus relevantes à sua função
        this.menuItems.forEach(menu => {
          menu.visible = ['clients', 'doctors'].includes(menu.id);
          if (menu.links) {
            menu.links.forEach(link => link.visible = menu.visible);
          }
        });
        break;

      case UserRole.PERSONAL:
        // Personal vê menus relevantes à sua função
        this.menuItems.forEach(menu => {
          menu.visible = ['clients', 'personal', 'trainings', 'exercises'].includes(menu.id);
          if (menu.links) {
            menu.links.forEach(link => link.visible = menu.visible);
          }
        });
        break;

      case UserRole.NUTRITIONIST:
        // Nutricionista vê menus relevantes à sua função
        this.menuItems.forEach(menu => {
          menu.visible = ['clients', 'nutritionists'].includes(menu.id);
          if (menu.links) {
            menu.links.forEach(link => link.visible = menu.visible);
          }
        });
        break;

      case UserRole.ADMIN:
      default:
        // Admin vê tudo
        this.menuItems.forEach(menu => {
          menu.visible = true;
          if (menu.links) {
            menu.links.forEach(link => {
              link.visible = true;
              if ('sublinks' in link && link.sublinks) {
                link.sublinks.forEach(sublink => sublink.visible = true);
              }
            });
          }
        });
        break;
    }
  }


  // Alterna a visibilidade de um menu principal
  toggleMenu(menu: any): void {
  menu.visible = !menu.visible;
  // Não altera links automaticamente
}

  // Alterna a visibilidade de um link
  // Alterna a visibilidade de um link
  toggleLink(link: any): void {
  link.visible = !link.visible;
  // Não altera o menu pai ou sublinks automaticamente
}

  // Alterna a visibilidade de um sublink
  toggleSublink(sublink: any): void {
  sublink.visible = !sublink.visible;
  // Não altera links pais ou menu automaticamente
}

  // Salva as configurações de visibilidade
  // Salva as configurações de visibilidade
  savePermissions(): void {
    if (!this.selectedRole) {
      this.snackBar.open('Selecione uma role para salvar as permissões', 'Fechar', {
        duration: 3000
      });
      return;
    }

    // Prepara o objeto de permissões para salvar
    const permissions: any = {};
    this.menuItems.forEach(menu => {
      // Resto do código permanece igual...
    });

    // Salva as permissões
    try {
      this.menuVisibilityService.saveMenuPermissions(this.selectedRole, permissions);

      this.snackBar.open(`Permissões para ${USER_ROLE_LABELS[this.selectedRole]} salvas com sucesso!`, 'Fechar', {
        duration: 3000
      });
    } catch (error) {
      this.snackBar.open(`Erro ao salvar permissões: ${error}`, 'Fechar', {
        duration: 5000
      });
    }
  }
  // Reseta todas as permissões para os valores padrão da role selecionada
  resetPermissions(): void {
    if (this.selectedRole) {
      this.resetToDefaultPermissions(this.selectedRole);
      this.snackBar.open('Permissões resetadas para os valores padrão', 'Fechar', {
        duration: 3000
      });
    }
  }
  checkStoredPermissions(): void {
    if (!this.selectedRole) {
      this.snackBar.open('Selecione uma role primeiro', 'Fechar', { duration: 2000 });
      return;
    }

    const key = `menu_permissions_${this.selectedRole}`;
    const stored = localStorage.getItem(key);
    console.log(`Permissões armazenadas para ${this.selectedRole}:`, stored);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Objeto parseado:', parsed);
      } catch (e) {
        console.error('Erro ao parsear dados:', e);
      }
    } else {
      console.log('Nenhuma permissão encontrada');
    }
  }
  // Ativar todos os links de um menu
  enableAllLinks(menu: any): void {
    if (menu.links) {
      menu.links.forEach((link: any) => {
        link.visible = true;
        if ('sublinks' in link && link.sublinks) {
          link.sublinks.forEach((sublink: any) => sublink.visible = true);
        }
      });
    }
  }

  // Desativar apenas links de um menu específico
  disableMenuLinks(menu: any): void {
    if (menu.links) {
      menu.links.forEach((link: any) => {
        link.visible = false;
        if ('sublinks' in link && link.sublinks) {
          link.sublinks.forEach((sublink: any) => sublink.visible = false);
        }
      });
    }
  }
}
