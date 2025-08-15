import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from '../../models/user_role';
import { AuthService } from '../auth.service';
import { LinkItem, SubLinkItem } from '../../models/linkItem';



export interface MenuItem {
  id: string;
  title: string;
  icon: string;
  visible: boolean;
  expanded?: boolean; // Para controle Gestalt de expansão
  links: LinkItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private readonly STORAGE_KEY = 'sistudo_fitness_menus';
  private currentUserId: number | null = null;

  // Adiciona a propriedade defaultMenuItems
  private readonly defaultMenuItems: MenuItem[] = [
    {
      id: 'fit-agenda',
      title: 'FitAgenda',
      icon: 'event', // ícone de calendário
      visible: true,
      links: [
        { id: 'agenda-today', label: 'Atendimentos de Hoje', route: '/fit-agenda/today', visible: true },
        { id: 'agenda-future', label: 'Agendamentos Futuros', route: '/fit-agenda/future', visible: true },
        { id: 'agenda-history', label: 'Histórico de Atendimentos', route: '/fit-agenda/history', visible: true },
        { id: 'agenda-create', label: 'Novo Agendamento', route: '/fit-agenda/create', visible: true }
      ]
    },
    {
      id: 'bioimpedancia',
      title: 'Bioimpedância',
      icon: 'science', // ícone de bioimpedância
      visible: true,
      links: [
        { id: 'bioimpedancia-history-select', label: 'Histórico de Bioimpedância', route: '/bioimpedancia/history/:id', visible: true, isDynamic: true },
        { id: 'bioimpedancias', label: 'Analisar Bioimpedância', route: '/bioimpedancia/select-client', visible: true }
      ]
    },
    {
      id: 'clients',
      title: 'Clientes',
      icon: 'group',
      visible: true,
      links: [
        { id: 'client-dashboard', label: 'Dashboard', route: '/client-dashboard/:id', visible: true, isDynamic: true },
        { id: 'list-clients', label: 'Listar Clientes', route: '/clients-list', visible: true },
        { id: 'client-details', label: 'Meus dados', route: '/client/:id', visible: true, isDynamic: true }

      ]
    },
    {
      id: 'doctors',
      title: 'Médicos',
      icon: 'medical_services',
      visible: true,
      links: [
        { id: 'doctor-patient-list', label: 'Seus pacientes', route: '/doctor-patient-list/:id', visible: true, isDynamic: true }
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
        { id: 'create-nutritionist', label: 'Criar Novo Nutricionista', route: '/nutritionist-create', visible: true }
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
        { id: 'create-training', label: 'Criar Novo Treino', route: '/trainning-create', visible: true },
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
          id: 'doctors',
          label: 'Médicos',
          route: '',
          visible: true,
          sublinks: [
            { id: 'list-doctors', label: 'Listar Médicos', route: '/doctor-list', visible: true },
            { id: 'create-doctor', label: 'Criar Novo Médico', route: '/doctor-create', visible: true },
            { id: 'edit-doctor', label: 'Editar Médico', route: '/doctor-update/:id', visible: true }
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

  constructor(private authService: AuthService) {

    // Inicializar currentUserId imediatamente se possível
    this.initializeUserId();

    // Observar o ID do usuário atual para uso em rotas dinâmicas
    this.authService.getCurrentUserId().subscribe(id => {
      this.currentUserId = id;
      // Quando o ID do usuário muda, recarrega os menus com as rotas atualizadas
      this.reloadMenusWithUserId();
    });
  }

  // Método para inicializar o ID do usuário imediatamente
  private initializeUserId(): void {
    // Tenta obter o ID do usuário de forma síncrona primeiro
    const userData = this.authService.getUserData();
    if (userData?.id) {
      this.currentUserId = userData.id;
    } else {
    }
  }

  // Método para recarregar os menus quando o ID do usuário muda
  private reloadMenusWithUserId(): void {
    if (this.currentUserId) {
      const updatedMenus = this.getMenuItems();
      this.menuItemsSource.next(updatedMenus);
      this.notifyMenuUpdated();
    } else {
    }
  }

  // Método público para forçar atualização dos menus (útil após login)
  public refreshMenus(): void {

    // Tenta primeiro obter o ID imediatamente
    this.authService.getCurrentUserId().subscribe(id => {
      if (id) {
        this.currentUserId = id;
        this.reloadMenusWithUserId();
      } else {
        // Se não conseguir o ID, tenta novamente após um pequeno delay
        setTimeout(() => {
          this.authService.getCurrentUserId().subscribe(retryId => {
            if (retryId) {
              this.currentUserId = retryId;
              this.reloadMenusWithUserId();
            } else {
              console.warn('Não foi possível obter o ID do usuário após duas tentativas');
            }
          });
        }, 500);
      }
    });
  }


  private saveMenuItems(menuItems: MenuItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(menuItems));
    } catch (error) {
      console.error('Erro ao salvar menus no localStorage:', error);
    }
  }

  getMenuItems(): MenuItem[] {
    const storedItems = localStorage.getItem('menuItems');
    const items = storedItems ? JSON.parse(storedItems) : this.defaultMenuItems;

    // Processar os menus para substituir rotas dinâmicas
    return this.processMenuItems(items);
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
      return menuItems.map((menu: MenuItem) => {
        const menuCopy = { ...menu, visible: true };

        if (menuCopy.links) {
          menuCopy.links = menuCopy.links.map((link: LinkItem) => {
            const linkCopy = { ...link, visible: true };

            if (linkCopy.sublinks) {
              linkCopy.sublinks = linkCopy.sublinks.map((sublink: SubLinkItem) => ({
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
    return menuItems.map((menu: MenuItem) => ({
      ...menu,
      visible: menu.visible === true, // Força conversão para booleano
      links: menu.links.map((link: LinkItem) => ({
        ...link,
        visible: link.visible === true, // Força conversão para booleano
        sublinks: link.sublinks?.map((sublink: SubLinkItem) => ({
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

  // Remova o método processMenuItems que retorna Observable e use o método síncrono abaixo

  // Modifique updateMenuItems para normalizar também
  // Método para atualizar menus - modificado para processar rotas dinâmicas
  updateMenuItems(menuItems: MenuItem[]): void {
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    this.notifyMenuUpdated();
  }

  // Adicione este método ao MenuService
  private processMenuItems(menuItems: MenuItem[]): MenuItem[] {


    // Tenta obter o ID do usuário se não estiver disponível
    if (!this.currentUserId) {
      console.warn('currentUserId é null, tentando obter do AuthService...');

      // Tentar múltiplas estratégias para obter o ID
      let userId = null;

      // Estratégia 1: getUserData()
      const userData = this.authService.getUserData();
      if (userData?.id && (typeof userData.id === 'number' || !isNaN(Number(userData.id)))) {
        userId = Number(userData.id);
        console.log('✅ ID obtido via getUserData():', userId);
      }

      // Estratégia 2: Se não funcionou, tentar getUserInfoFromStorage()
      if (!userId) {
        const storageInfo = this.authService.getUserInfoFromStorage();
        if (storageInfo?.id && (typeof storageInfo.id === 'number' || !isNaN(Number(storageInfo.id)))) {
          userId = Number(storageInfo.id);
          console.log('✅ ID obtido via getUserInfoFromStorage():', userId);
        }
      }

      // Estratégia 3: Acesso direto ao sessionStorage
      if (!userId) {
        try {
          const userInfoStr = sessionStorage.getItem('userInfo');
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr);
            if (userInfo.id && (typeof userInfo.id === 'number' || !isNaN(Number(userInfo.id)))) {
              userId = Number(userInfo.id);
              console.log('✅ ID obtido via sessionStorage direto:', userId);
            }
          }
        } catch (error) {
          console.error('Erro ao acessar sessionStorage:', error);
        }
      }

      if (userId) {
        this.currentUserId = userId;
        console.log('✅ currentUserId definido como:', this.currentUserId);
      } else {
        console.error('❌ ID do usuário não disponível em nenhuma estratégia - processando menu sem substituição dinâmica');
        return menuItems; // Retorna menu sem processamento dinâmico
      }
    }


    const processedItems = menuItems.map((menu: MenuItem) => {
      const processedMenu = { ...menu };

      if (!Array.isArray(processedMenu.links)) {
        return processedMenu;
      }

      processedMenu.links = processedMenu.links.map((link: LinkItem) => {
        const processedLink = { ...link };


        // Só processa rotas dinâmicas se isDynamic === true E a rota contém :id
        if (processedLink.isDynamic === true && processedLink.route && processedLink.route.includes(':id')) {
          const userId = this.currentUserId !== null ? this.currentUserId.toString() : '0';
          processedLink.route = processedLink.route.replace(/:id/g, userId);
        }

        // Processar sublinks
        if (Array.isArray(processedLink.sublinks)) {
          processedLink.sublinks = processedLink.sublinks.map((sublink: SubLinkItem) => {
            const processedSublink = { ...sublink };

            if (processedSublink.isDynamic === true && processedSublink.route && processedSublink.route.includes(':id')) {
              const originalRoute = processedSublink.route;
              // Mesma verificação para garantir que currentUserId não é null
              const userId = this.currentUserId !== null ? this.currentUserId.toString() : '0';
              processedSublink.route = processedSublink.route.replace(/:id/g, userId);
            }

            return processedSublink;
          });
        }

        return processedLink;
      });

      return processedMenu;
    });

    return processedItems;
  }

  private notifyMenuUpdated(): void {
    // Dispara um evento personalizado que pode ser capturado pelo componente de navegação
    window.dispatchEvent(new CustomEvent('menu-updated'));
  }


  // Método público para debug
  public debugCurrentState(): void {


    // Teste o AuthService diretamente
    this.authService.getCurrentUserId().subscribe(id => {
    });


  }

  // Adicione este método para verificar os menus e seus status dinâmicos
  debugMenuItems(): void {
    const storedItems = localStorage.getItem('menuItems');
    const items = storedItems ? JSON.parse(storedItems) : this.defaultMenuItems;



    items.forEach((menu: MenuItem) => {
      menu.links.forEach((link: LinkItem) => {

        if (link.sublinks && link.sublinks.length > 0) {
          link.sublinks.forEach((sublink: SubLinkItem) => {
          });
        }
      });
    });

  }



}
