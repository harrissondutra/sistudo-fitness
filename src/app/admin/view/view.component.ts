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

  // Clone do menu do sidenav para configurar as permissões
  menuItems = [
    {
      id: 'clients',
      title: 'Clientes',
      icon: 'group',
      visible: true,
      links: [
        { id: 'list-clients', label: 'Listar Clientes', visible: true }
      ]
    },
    {
      id: 'doctors',
      title: 'Médicos',
      icon: 'stethoscope',
      visible: true,
      links: [
        { id: 'list-doctors', label: 'Listar Médicos', visible: true },
        { id: 'create-doctor', label: 'Criar Novo Médico', visible: true },
        { id: 'edit-doctor', label: 'Editar Médico', visible: true }
      ]
    },
    {
      id: 'personal',
      title: 'Personal Trainers',
      icon: 'body_system',
      visible: true,
      links: [
        { id: 'list-personal', label: 'Listar Personal', visible: true },
        { id: 'create-personal', label: 'Criar Novo Personal', visible: true },
        { id: 'edit-personal', label: 'Editar Personal', visible: true }
      ]
    },
    {
      id: 'nutritionists',
      title: 'Nutricionistas',
      icon: 'body_fat',
      visible: true,
      links: [
        { id: 'list-nutritionist', label: 'Listar Nutricionistas', visible: true },
        { id: 'create-nutritionist', label: 'Criar Novo Nutricionista', visible: true },
        { id: 'edit-nutritionist', label: 'Editar Nutricionista', visible: true }
      ]
    },
    {
      id: 'trainings',
      title: 'Treinos',
      icon: 'exercise',
      visible: true,
      links: [
        { id: 'list-trainings', label: 'Exibir Treinos', visible: true },
        { id: 'inactive-trainings', label: 'Inativos', visible: true },
        { id: 'create-training', label: 'Criar Novo Treino', visible: true },
        { id: 'create-training-category', label: 'Criar Categoria de Treino', visible: true }
      ]
    },
    {
      id: 'exercises',
      title: 'Exercícios',
      icon: 'sports_gymnastics',
      visible: true,
      links: [
        { id: 'list-exercises', label: 'Listar Exercícios', visible: true },
        { id: 'insert-category', label: 'Inserir Categoria', visible: true },
        { id: 'create-exercise', label: 'Criar Novo Exercício', visible: true }
      ]
    },
    {
      id: 'gym',
      title: 'Academia',
      icon: 'warehouse',
      visible: true,
      links: [
        { id: 'list-gyms', label: 'Listar', visible: true },
        { id: 'professionals', label: 'Profissionais', visible: true },
        { id: 'others', label: 'Outros', visible: true }
      ]
    },
    {
      id: 'admin',
      title: 'Administrador',
      icon: 'admin_panel_settings',
      visible: true,
      links: [
        {
          id: 'users',
          label: 'Usuários',
          visible: true,
          sublinks: [
            { id: 'list-users', label: 'Listar Usuários', visible: true },
            { id: 'create-user', label: 'Criar Novo Usuário', visible: true }
          ]
        },
        {
          id: 'admin-clients',
          label: 'Clientes',
          visible: true,
          sublinks: [
            { id: 'admin-list-clients', label: 'Listar', visible: true },
            { id: 'admin-create-client', label: 'Criar Novo Cliente', visible: true }
          ]
        },
        { id: 'views', label: 'Visões', visible: true },
        { id: 'general-registers', label: 'Cadastros Gerais', visible: true },
        { id: 'admin-others', label: 'Outros', visible: true }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private menuVisibilityService: MenuVisibilityService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Pré-seleciona a role ADMIN para melhor usabilidade inicial
    if (this.roles.length > 0) {
      // Seleciona a role ADMIN ou a primeira disponível
      this.selectedRole = this.roles.includes(UserRole.ADMIN) ?
        UserRole.ADMIN :
        this.roles[0];

      console.log('Role pré-selecionada:', this.selectedRole);
      this.onRoleChange();
    }
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
      permissions[menu.id] = {
        visible: menu.visible,
        links: {}
      };

      if (menu.links) {
        menu.links.forEach(link => {
          const linkId = link.id || '';
          permissions[menu.id].links[linkId] = {
            visible: link.visible
          };

          // Se o link tem sublinks, salva suas permissões também
          if ('sublinks' in link && link.sublinks) {
            permissions[menu.id].links[linkId].sublinks = {};
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

      // Verifica imediatamente se as permissões foram salvas
      this.checkStoredPermissions();

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
