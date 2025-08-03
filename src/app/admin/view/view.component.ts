import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserRole, USER_ROLE_LABELS } from '../../models/user_role';
import { MenuVisibilityService } from '../../services/menu-visibility/menuVisibility.service';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem } from '../../services/menu-visibility/menu.service';
import {LinkItem, SubLinkItem } from '../../models/linkItem';

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
    MatSlideToggleModule, // Adicionado para o toggle de menus escondidos
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
  showHiddenMenus: boolean = true; // Por padrão, mostra todos os menus
  saveInProgress = false;

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
    console.log('Menus carregados inicialmente:', this.menuItems);

    // Pré-seleciona a role ADMIN
    if (this.roles.length > 0) {
      this.selectedRole = this.roles.includes(UserRole.ADMIN) ?
        UserRole.ADMIN :
        this.roles[0];

      // Executar depois que o componente estiver completamente inicializado
      setTimeout(() => {
        console.log('Selecionando role inicial:', this.selectedRole);
        this.loadMenuPermissions(this.selectedRole!);
      }, 0);
    }

    // Assinar às mudanças no menu compartilhado
    this.menuService.menuItems$.subscribe(menuItems => {
      console.log('Atualização de menus recebida:', menuItems);
      this.menuItems = menuItems;

      // Se já tiver uma role selecionada, reaplica as permissões
      if (this.selectedRole) {
        this.loadMenuPermissions(this.selectedRole);
      }

      this.cd.detectChanges();
    });
  }

  onRoleChange(): void {
    if (this.selectedRole) {
      this.loadMenuPermissions(this.selectedRole);
    }
  }

  // Getter para filtrar os menus conforme a opção de exibição
  get filteredMenuItems(): MenuItem[] {
    if (this.showHiddenMenus) {
      return this.menuItems; // Retorna todos, incluindo ocultos
    } else {
      return this.menuItems.filter(menu => menu.visible);
    }
  }

  loadMenuPermissions(role: UserRole): void {
    console.log(`Carregando permissões para a role: ${USER_ROLE_LABELS[role]}`);

    // Obtém as permissões salvas para a role selecionada
    const permissions = this.menuVisibilityService.getMenuPermissions(role);
    console.log('Permissões recuperadas:', permissions);

    if (permissions && Object.keys(permissions).length > 0) {
      console.log('Aplicando permissões salvas anteriormente');
      this.updateMenuVisibility(permissions);

      // Mostrar feedback ao usuário
      this.snackBar.open(`Permissões de ${USER_ROLE_LABELS[role]} carregadas`, 'OK', {
        duration: 2000,
        panelClass: ['info-snackbar']
      });
    } else {
      console.log('Nenhuma permissão salva encontrada, aplicando valores padrão');
      this.resetToDefaultPermissions(role);

      // Mostrar feedback ao usuário
      this.snackBar.open(`Configuração padrão aplicada para ${USER_ROLE_LABELS[role]}`, 'OK', {
        duration: 2000
      });
    }

    // Forçar detecção de mudanças para atualizar a UI
    setTimeout(() => this.cd.detectChanges(), 0);
  }

  updateMenuVisibility(permissions: any): void {
    try {
      // Resetar todos os menus para um estado conhecido antes de aplicar permissões
      this.menuItems.forEach(menu => {
        menu.visible = false;
        if (menu.links) {
          menu.links.forEach(link => {
            link.visible = false;
            if (link.sublinks) {
              link.sublinks.forEach(sublink => sublink.visible = false);
            }
          });
        }
      });

      // Agora aplicar as permissões carregadas
      this.menuItems.forEach(menu => {
        if (!menu || !menu.id || !permissions[menu.id]) return;

        const menuPermission = permissions[menu.id];
        menu.visible = !!menuPermission.visible;
        console.log(`Menu ${menu.title} (${menu.id}): ${menu.visible ? 'visível' : 'oculto'}`);

        // Atualiza visibilidade dos links
        if (menu.links && menuPermission.links) {
          menu.links.forEach(link => {
            if (!link || !link.id) return;

            const linkId = link.id;
            if (menuPermission.links[linkId]) {
              link.visible = !!menuPermission.links[linkId].visible;
              console.log(`  Link ${link.label}: ${link.visible ? 'visível' : 'oculto'}`);

              // Atualiza visibilidade dos sublinks, se existirem
              if (link.sublinks && menuPermission.links[linkId].sublinks) {
                link.sublinks.forEach(sublink => {
                  if (!sublink || !sublink.id) return;

                  const sublinkId = sublink.id;
                  if (menuPermission.links[linkId].sublinks[sublinkId]) {
                    sublink.visible = !!menuPermission.links[linkId].sublinks[sublinkId].visible;
                    console.log(`    Sublink ${sublink.label}: ${sublink.visible ? 'visível' : 'oculto'}`);
                  }
                });
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar visibilidade dos menus:', error);
      this.snackBar.open('Erro ao processar permissões. Valores padrão serão aplicados.', 'OK', {
        duration: 3000
      });

      // Em caso de erro, aplicar valores padrão
      if (this.selectedRole) {
        this.resetToDefaultPermissions(this.selectedRole);
      }
    }
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

      case UserRole.GYM:
        // Administrador de Academia vê menus relevantes
        this.menuItems.forEach(menu => {
          menu.visible = ['clients', 'personal', 'trainings', 'exercises', 'gym'].includes(menu.id);
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
              if (link.sublinks) {
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
  }

  // Alterna a visibilidade de um link
  toggleLink(link: any): void {
    link.visible = !link.visible;
  }

  // Alterna a visibilidade de um sublink
  toggleSublink(sublink: any): void {
    sublink.visible = !sublink.visible;
  }

  private isModifyingAdminPermissions(): boolean {
    if (this.selectedRole === UserRole.ADMIN) {
      // Mostrar aviso especial quando editar permissões de administrador
      this.snackBar.open('⚠️ ATENÇÃO: Modificar permissões de administrador pode impactar sua própria conta!',
        'Entendi', { duration: 5000 });
      return true;
    }
    return false;
  }

  // Salva as configurações de visibilidade
  savePermissions(): void {
    if (!this.selectedRole) {
      this.snackBar.open('Selecione uma role para salvar as permissões', 'Fechar', {
        duration: 3000
      });
      return;
    }
    this.isModifyingAdminPermissions();
    this.saveInProgress = true;

    // Prepara o objeto de permissões para salvar
    const permissions: any = {};

    this.menuItems.forEach(menu => {
      permissions[menu.id] = {
        visible: menu.visible,
        links: {}
      };

      if (menu.links) {
        menu.links.forEach(link => {
          const linkId = link.id || '';
          permissions[menu.id].links[linkId] = {
            visible: link.visible,
            sublinks: {}
          };

          // Se o link tem sublinks, salvar suas visibilidades também
          if (link.sublinks) {
            link.sublinks.forEach(sublink => {
              const sublinkId = sublink.id || '';
              permissions[menu.id].links[linkId].sublinks[sublinkId] = {
                visible: sublink.visible
              };
            });
          }
        });
      }
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
    } finally {
      this.saveInProgress = false;
    }
  }

  // Reseta todas as permissões para os valores padrão da role selecionada
  resetPermissions(): void {
    if (this.selectedRole) {
      if (confirm(`Tem certeza que deseja redefinir as permissões de "${USER_ROLE_LABELS[this.selectedRole]}" para os valores padrão?`)) {
        this.resetToDefaultPermissions(this.selectedRole);
        this.snackBar.open('Permissões redefinidas para os valores padrão', 'Fechar', {
          duration: 3000
        });
      }
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
        this.snackBar.open('Permissões verificadas. Veja o console para detalhes.', 'Fechar', {
          duration: 3000
        });
      } catch (e) {
        console.error('Erro ao parsear dados:', e);
        this.snackBar.open('Erro ao analisar dados armazenados', 'Fechar', {
          duration: 3000
        });
      }
    } else {
      console.log('Nenhuma permissão encontrada');
      this.snackBar.open('Nenhuma permissão personalizada encontrada', 'Fechar', {
        duration: 3000
      });
    }
  }

  // Ativar todos os links de um menu
  enableAllLinks(menu: any): void {
    if (menu.links) {
      menu.links.forEach((link: any) => {
        link.visible = true;
        if (link.sublinks) {
          link.sublinks.forEach((sublink: any) => sublink.visible = true);
        }
      });
    }
    this.snackBar.open('Todos os links foram ativados', 'Fechar', { duration: 1000 });
  }

  // Desativar apenas links de um menu específico
  disableMenuLinks(menu: any): void {
    if (menu.links) {
      menu.links.forEach((link: any) => {
        link.visible = false;
        if (link.sublinks) {
          link.sublinks.forEach((sublink: any) => sublink.visible = false);
        }
      });
    }
    this.snackBar.open('Todos os links foram desativados', 'Fechar', { duration: 1000 });
  }
  // Adicione este método para ajudar na depuração
  inspectCurrentState(): void {
    console.group('Estado atual dos menus');

    this.menuItems.forEach(menu => {
      console.group(`Menu: ${menu.title} (${menu.id}) - ${menu.visible ? 'visível' : 'oculto'}`);

      if (menu.links) {
        menu.links.forEach(link => {
          console.group(`Link: ${link.label} (${link.id}) - ${link.visible ? 'visível' : 'oculto'}`);

          if (link.sublinks) {
            link.sublinks.forEach(sublink => {
              console.log(`Sublink: ${sublink.label} (${sublink.id}) - ${sublink.visible ? 'visível' : 'oculto'}`);
            });
          }

          console.groupEnd();
        });
      }

      console.groupEnd();
    });

    console.groupEnd();

    this.snackBar.open('Estado atual dos menus exibido no console', 'OK', {
      duration: 2000
    });
  }
}
