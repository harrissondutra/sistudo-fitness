import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserRole } from '../../models/user_role';
import { AuthService } from '../auth.service';

export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  visible: boolean;
  links: LinkItem[];
}

export interface LinkItem {
  id: string;
  label: string;
  route: string;
  visible: boolean;
  sublinks?: SubLinkItem[];
}

export interface SubLinkItem {
  id: string;
  label: string;
  route: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly STORAGE_KEY = 'sistudo_fitness_menus';

  // Adiciona a propriedade defaultMenuItems
  private readonly defaultMenuItems: MenuItem[] = [
    {
      id: 'clients',
      title: 'Clientes',
      icon: 'group',
      visible: true,
      links: [
        { id: 'list-clients', label: 'Listar Clientes', route: '/clients-list', visible: true }
      ]
    },
    {
      id: 'doctors',
      title: 'Médicos',
      icon: 'medical_services',
      visible: true,
      links: [
        { id: 'list-doctors', label: 'Listar Médicos', route: '/doctor-list', visible: true },
        { id: 'create-doctor', label: 'Criar Novo Médico', route: '/doctor-create', visible: true },
        { id: 'edit-doctor', label: 'Editar Médico', route: '/doctor-update/:id', visible: true }
      ]
    },
    {
      id: 'personal',
      title: 'Personal Trainer',
      icon: 'fitness_center',
      visible: true,
      links: [
        { id: 'list-personal', label: 'Listar Personal', route: '/personal-list', visible: true },
        { id: 'create-personal', label: 'Criar Novo Personal', route: '/personal-create', visible: true },
        { id: 'edit-personal', label: 'Editar Personal', route: '/personal-update/:id', visible: true }
      ]
    },
    {
      id: 'nutritionists',
      title: 'Nutricionistas',
      icon: 'restaurant_menu',
      visible: true,
      links: [
        { id: 'list-nutritionist', label: 'Listar Nutricionistas', route: '/nutritionist-list', visible: true },
        { id: 'create-nutritionist', label: 'Criar Novo Nutricionista', route: '/nutritionist-create', visible: true },
        { id: 'edit-nutritionist', label: 'Editar Nutricionista', route: '/nutritionist-update/:id', visible: true }
      ]
    },
    {
      id: 'trainings',
      title: 'Treinos',
      icon: 'fitness_center',
      visible: true,
      links: [
        { id: 'list-trainings', label: 'Exibir Treinos', route: '/trainnings', visible: true },
        { id: 'inactive-trainings', label: 'Inativos', route: '/inactive-trainning', visible: true },
        { id: 'create-training', label: 'Criar Novo Treino', route: '/trainning-create/:id', visible: true },
        { id: 'create-training-category', label: 'Criar Categoria de Treino', route: '/create-category-trainning', visible: true }
      ]
    },
    {
      id: 'exercises',
      title: 'Exercícios',
      icon: 'sports_gymnastics',
      visible: true,
      links: [
        { id: 'list-exercises', label: 'Listar Exercícios', route: '/exercises', visible: true },
        { id: 'insert-category', label: 'Inserir Categoria', route: '/category-exercise', visible: true },
        { id: 'create-exercise', label: 'Criar Novo Exercício', route: '/create-exercise', visible: true }
      ]
    },
    {
      id: 'gym',
      title: 'Academia',
      icon: 'warehouse',
      visible: true,
      links: [
        { id: 'list-gyms', label: 'Listar', route: '/gym', visible: true },
        { id: 'professionals', label: 'Profissionais', route: '/professionals', visible: true },
        { id: 'others', label: 'Outros', route: '/others', visible: true }
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
          route: '',
          visible: true,
          sublinks: [
            { id: 'list-users', label: 'Listar Usuários', route: '/user-list', visible: true },
            { id: 'create-user', label: 'Criar Novo Usuário', route: '/user-create', visible: true }
          ]
        },
        {
          id: 'admin-clients',
          label: 'Clientes',
          route: '',
          visible: true,
          sublinks: [
            { id: 'admin-list-clients', label: 'Listar', route: '/clients-list', visible: true },
            { id: 'admin-create-client', label: 'Criar Novo Cliente', route: '/register', visible: true }
          ]
        },
        { id: 'views', label: 'Visões', route: '/views', visible: true },
        { id: 'general-registers', label: 'Cadastros Gerais', route: '/admin-register', visible: true },
        { id: 'admin-others', label: 'Outros', route: '/others', visible: true }
      ]
    }
  ];

  private menuItemsSource = new BehaviorSubject<MenuItem[]>(this.loadMenuItems());
  menuItems$ = this.menuItemsSource.asObservable();

  constructor(private authService: AuthService) {}


  private saveMenuItems(menuItems: MenuItem[]): void {
  try {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(menuItems));
  } catch(error) {
    console.error('Erro ao salvar menus no localStorage:', error);
  }
}

getMenuItems(): MenuItem[] {
  return this.menuItemsSource.value;
}

// Método para atualizar visibilidade baseado em permissões
updateMenuVisibilityByRole(role: string, permissions: any): void {
  const menuItems = this.getMenuItems();

  menuItems.forEach(menu => {
    const menuPermission = permissions[menu.id];
    if (menuPermission !== undefined) {
      menu.visible = menuPermission.visible;

      if (menu.links) {
        menu.links.forEach(link => {
          const linkId = link.id;
          if (menuPermission.links && menuPermission.links[linkId]) {
            link.visible = menuPermission.links[linkId].visible;

            if (link.sublinks) {
              link.sublinks.forEach(sublink => {
                const sublinkId = sublink.id;
                if (
                  menuPermission.links[linkId].sublinks &&
                  menuPermission.links[linkId].sublinks[sublinkId]
                ) {
                  sublink.visible = menuPermission.links[linkId].sublinks[sublinkId].visible;
                }
              });
            }
          }
        });
      }
    }
  });

  this.updateMenuItems(menuItems);
}

  private getPermissionsForRole(role: UserRole): any {
  const key = `menu_permissions_${role}`;
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error(`Erro ao carregar permissões para ${role}:`, error);
    return null;
  }
}

applyUserPermissions(menuItems: MenuItem[]): MenuItem[] {
  const currentUserRole = this.authService.getUserRole();

  // Garantia crítica: administradores sempre veem tudo
  if (currentUserRole === UserRole.ADMIN) {
    console.log('Aplicando permissões: Usuário é ADMIN, garantindo visibilidade completa.');
    return menuItems.map(menu => {
      const menuCopy = { ...menu, visible: true };

      if (menuCopy.links) {
        menuCopy.links = menuCopy.links.map(link => {
          const linkCopy = { ...link, visible: true };

          if (linkCopy.sublinks) {
            linkCopy.sublinks = linkCopy.sublinks.map(sublink => ({
              ...sublink,
              visible: true
            }));
          }

          return linkCopy;
        });
      }

      return menuCopy;
    });
  }

  // Para outros perfis, tenta aplicar as permissões específicas
  try {
    // Obtenha permissões da role atual
    const permissions = this.getPermissionsForRole(currentUserRole);

    if (!permissions) {
      console.log(`Sem permissões específicas para ${currentUserRole}, usando visibilidade padrão.`);
      return menuItems; // Retorna os menus como estão
    }

    // Aplica as permissões aos menus
    return menuItems.map(menu => {
      const menuCopy = { ...menu };
      const menuPermission = permissions[menu.id];

      if (menuPermission) {
        menuCopy.visible = menuPermission.visible;

        if (menuCopy.links && menuPermission.links) {
          menuCopy.links = menuCopy.links.map(link => {
            const linkCopy = { ...link };
            const linkPermission = menuPermission.links[link.id];

            if (linkPermission) {
              linkCopy.visible = linkPermission.visible;

              if (linkCopy.sublinks && linkPermission.sublinks) {
                linkCopy.sublinks = linkCopy.sublinks.map(sublink => {
                  const sublinkCopy = { ...sublink };
                  const sublinkPermission = linkPermission.sublinks[sublink.id];

                  if (sublinkPermission) {
                    sublinkCopy.visible = sublinkPermission.visible;
                  }

                  return sublinkCopy;
                });
              }
            }

            return linkCopy;
          });
        }
      }

      return menuCopy;
    });
  } catch (error) {
    console.error('Erro ao aplicar permissões:', error);
    return menuItems; // Em caso de erro, retorna os menus originais
  }
}

// Método para resetar para os menus padrão
resetToDefaultMenus(): void {
  this.updateMenuItems(this.defaultMenuItems);
}

// Adicione este método no MenuService
normalizeMenuItems(menuItems: MenuItem[]): MenuItem[] {
  return menuItems.map(menu => ({
    ...menu,
    visible: menu.visible === true, // Força conversão para booleano
    links: menu.links.map(link => ({
      ...link,
      visible: link.visible === true, // Força conversão para booleano
      sublinks: link.sublinks?.map(sublink => ({
        ...sublink,
        visible: sublink.visible === true // Força conversão para booleano
      }))
    }))
  }));
}

// Modifique o método loadMenuItems para usar normalizeMenuItems
private loadMenuItems(): MenuItem[] {
  try {
    const storedMenus = localStorage.getItem(this.STORAGE_KEY);
    let menus = storedMenus ? JSON.parse(storedMenus) : this.defaultMenuItems;
    menus = this.normalizeMenuItems(menus);

    // Aplica permissões se o AuthService estiver disponível
    if (this.authService) {
      return this.applyUserPermissions(menus);
    }

    return menus;
  } catch (error) {
    console.error('Erro ao carregar menus do localStorage:', error);
    return this.normalizeMenuItems(this.defaultMenuItems);
  }
}

// Modifique updateMenuItems para normalizar também
updateMenuItems(menuItems: MenuItem[]): void {
  // Normaliza os menus para garantir valores booleanos corretos
  const normalizedMenus = this.normalizeMenuItems(menuItems);

  // Salva no localStorage (configuração base)
  this.saveMenuItems(normalizedMenus);

  // IMPORTANTE: Para administradores, aplicamos as permissões para garantir
  // que todos os menus sejam visíveis antes de emitir os valores
  if (this.authService.getUserRole() === UserRole.ADMIN) {
    console.log('Administrador editando menus - preservando visibilidade total');
    const adminMenus = this.applyUserPermissions(normalizedMenus);
    this.menuItemsSource.next([...adminMenus]);
  } else {
    // Para outros usuários, emitir normalmente
    this.menuItemsSource.next([...normalizedMenus]);
  }
}


}
