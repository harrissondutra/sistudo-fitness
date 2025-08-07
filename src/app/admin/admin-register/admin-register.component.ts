import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MenuService, MenuItem } from '../../services/menu-visibility/menu.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { AuthService } from '../../services/auth.service'; // Ajuste o caminho conforme necessário
import { LinkItem, SubLinkItem } from '../../models/linkItem'; // Ajuste o caminho conforme necessário

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    DragDropModule
  ],
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.scss']
})
export class AdminRegisterComponent implements OnInit {
  menuItems: MenuItem[] = [];
  menuForm: FormGroup;
  editingMenuIndex: number | null = null;
  selectedMenuItem: MenuItem | null = null;
  commonIcons = [
    'home', 'group', 'person', 'settings', 'admin_panel_settings', 'fitness_center',
    'restaurant_menu', 'medical_services', 'sports_gymnastics', 'warehouse', 'menu_book',
    'dashboard', 'assignment', 'shopping_cart', 'store', 'event', 'mail'
  ];
  currentUserId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private snackBar: MatSnackBar,
    private authService: AuthService

  ) {
    this.menuForm = this.createMenuForm();
  }

  ngOnInit(): void {
    this.loadMenuItems();
    this.getCurrentUserId();
  }

  getCurrentUserId(): void {
    this.authService.getCurrentUserId().subscribe(id => {
      this.currentUserId = id;
    });
  }

  // Adicione este método ao componente
  createDynamicLink(linkForm: FormGroup): void {
    const route = linkForm.get('route')?.value;

    if (route === 'client/:id' || route === '/client/:id') {
      // Se o usuário está tentando criar um link para client/:id
      if (this.currentUserId !== null) {  // Explicit null check here
        // Cria um objeto com informações para o link dinâmico
        linkForm.get('isDynamic')?.setValue(true);
        linkForm.get('dynamicType')?.setValue('currentUser');

        // Mostra uma mensagem explicando a funcionalidade
        this.snackBar.open('Link dinâmico criado! Será substituído pelo ID do usuário logado.', 'OK', { duration: 3000 });
      } else {
        this.snackBar.open('Não foi possível obter o ID do usuário atual.', 'Fechar', { duration: 3000 });
      }
    }
  }

  loadMenuItems(): void {
    this.menuItems = this.menuService.getMenuItems();
  }

  createMenuForm(): FormGroup {
    return this.fb.group({
      id: ['', [Validators.required, Validators.pattern('[a-z0-9-]+')]],
      title: ['', Validators.required],
      icon: ['', Validators.required],
      visible: [true],
      links: this.fb.array([])
    });
  }

  get links(): FormArray {
    return this.menuForm.get('links') as FormArray;
  }

  createLinkForm(): FormGroup {
    return this.fb.group({
      id: ['', [Validators.required, Validators.pattern('[a-z0-9-]+')]],
      label: ['', Validators.required],
      route: [''],
      visible: [true],
      isDynamic: [false],
      sublinks: this.fb.array([])
    });
  }


  getSublinks(linkIndex: number): FormArray {
    return this.links.at(linkIndex).get('sublinks') as FormArray;
  }

  createSubLinkForm(): FormGroup {
    return this.fb.group({
      id: ['', [Validators.required, Validators.pattern('[a-z0-9-]+')]],
      label: ['', Validators.required],
      route: ['', Validators.required],
      visible: [true],
      isDynamic: [false]
    });
  }


  addLink(): void {
    this.links.push(this.createLinkForm());
  }

  addSublink(linkIndex: number): void {
    this.getSublinks(linkIndex).push(this.createSubLinkForm());
  }

  removeLink(index: number): void {
    this.links.removeAt(index);
  }

  removeSublink(linkIndex: number, sublinkIndex: number): void {
    this.getSublinks(linkIndex).removeAt(sublinkIndex);
  }

  editMenu(menu: MenuItem, index: number): void {
    this.editingMenuIndex = index;
    this.selectedMenuItem = menu;

    // Reset form and create new FormArrays
    this.menuForm = this.createMenuForm();

    // Set main form values
    this.menuForm.patchValue({
      id: menu.id,
      title: menu.title,
      icon: menu.icon,
      visible: menu.visible
    });

    // Add links
    menu.links.forEach(link => {
      const linkFormGroup = this.fb.group({
        id: [link.id, [Validators.required, Validators.pattern('[a-z0-9-]+')]],
        label: [link.label, Validators.required],
        route: [link.route],
        visible: [link.visible],
        isDynamic: [link.isDynamic || false], // Adicionar propriedade isDynamic
        sublinks: this.fb.array([])
      });

      // Add sublinks if they exist
      if (link.sublinks && link.sublinks.length > 0) {
        link.sublinks.forEach(sublink => {
          const sublinkFormGroup = this.fb.group({
            id: [sublink.id, [Validators.required, Validators.pattern('[a-z0-9-]+')]],
            label: [sublink.label, Validators.required],
            route: [sublink.route, Validators.required],
            visible: [sublink.visible],
            isDynamic: [sublink.isDynamic || false] // Adicionar propriedade isDynamic
          });
          (linkFormGroup.get('sublinks') as FormArray).push(sublinkFormGroup);
        });
      }

      this.links.push(linkFormGroup);
    });
  }

  cancelEdit(): void {
    this.editingMenuIndex = null;
    this.selectedMenuItem = null;
    this.menuForm = this.createMenuForm();
  }



  deleteMenu(index: number): void {
    if (confirm('Tem certeza que deseja excluir este menu? Esta ação não pode ser desfeita.')) {
      this.menuItems.splice(index, 1);
      this.menuService.updateMenuItems(this.menuItems);
      this.snackBar.open('Menu excluído com sucesso', 'Fechar', { duration: 2000 });
    }
  }

  // Drag and drop functionality
  dropMenu(event: CdkDragDrop<MenuItem[]>): void {
    moveItemInArray(this.menuItems, event.previousIndex, event.currentIndex);
    this.menuService.updateMenuItems(this.menuItems);
  }

  // Novo método para drag and drop de links no formulário
  dropFormLink(event: CdkDragDrop<any[]>): void {
    const linksArray = this.links;
    const linkData = linksArray.at(event.previousIndex);

    // Remove o item da posição anterior
    linksArray.removeAt(event.previousIndex);

    // Insere na nova posição
    linksArray.insert(event.currentIndex, linkData);
  }

  // Novo método para drag and drop de sublinks no formulário
  dropFormSublink(event: CdkDragDrop<any[]>, linkIndex: number): void {
    const sublinksArray = this.getSublinks(linkIndex);
    const sublinkData = sublinksArray.at(event.previousIndex);

    // Remove o item da posição anterior
    sublinksArray.removeAt(event.previousIndex);

    // Insere na nova posição
    sublinksArray.insert(event.currentIndex, sublinkData);
  }

  dropLink(menuIndex: number, event: CdkDragDrop<LinkItem[]>): void {
    moveItemInArray(this.menuItems[menuIndex].links, event.previousIndex, event.currentIndex);
    this.menuService.updateMenuItems(this.menuItems);
  }

  dropSublink(menuIndex: number, linkIndex: number, event: CdkDragDrop<SubLinkItem[]>): void {
    if (this.menuItems[menuIndex].links[linkIndex].sublinks) {
      moveItemInArray(
        this.menuItems[menuIndex].links[linkIndex].sublinks!,
        event.previousIndex,
        event.currentIndex
      );
      this.menuService.updateMenuItems(this.menuItems);
    }
  }

  validateIdFormat(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, ''); // Remove invalid chars
  }

  // Adicione este método ao admin-register.component.ts
  resetMenus(): void {
    if (confirm('Tem certeza que deseja restaurar os menus para o estado padrão? Todas as suas alterações serão perdidas.')) {
      this.menuService.resetToDefaultMenus();
      this.loadMenuItems();
      // Exibir notificação de sucesso
    }
  }

  showHiddenMenus: boolean = true;

  get filteredMenuItems(): MenuItem[] {
    if (this.showHiddenMenus) {
      return this.menuItems;
    } else {
      return this.menuItems.filter(menu => menu.visible);
    }
  }

  // Adicione este método ao admin-register.component.ts
  debugMenus(): void {
    const menus = this.menuService.getMenuItems();

    const problemMenus = menus.filter(menu => {
      // Verifica se a propriedade visible é indefinida ou não é booleana
      const menuProblem = typeof menu.visible !== 'boolean';

      // Verifica problemas nos links
      const linkProblems = menu.links.some(link =>
        typeof link.visible !== 'boolean' ||
        (link.sublinks && link.sublinks.some(sublink => typeof sublink.visible !== 'boolean'))
      );

      return menuProblem || linkProblems;
    });

    if (problemMenus.length > 0) {
      console.error('Menus com problemas encontrados:', problemMenus);
      this.snackBar.open(
        `Encontrados ${problemMenus.length} menus com problemas. Verifique o console.`,
        'Corrigir Automaticamente',
        { duration: 5000 }
      ).onAction().subscribe(() => {
        this.menuService.resetToDefaultMenus();
        this.loadMenuItems();
        this.snackBar.open('Menus restaurados para os valores padrão', 'Fechar', { duration: 2000 });
      });
    } else {
      this.snackBar.open('Todos os menus parecem estar com estrutura correta', 'Fechar', { duration: 2000 });
    }
  }

  // Adicione este método ao componente
  refreshMenusForAdmin(): void {
    // Recarrega os menus para garantir que o administrador veja tudo
    this.menuItems = this.menuService.getMenuItems().map(menu => ({
      ...menu,
      visible: true,
      links: menu.links.map(link => ({
        ...link,
        visible: true,
        sublinks: link.sublinks?.map(sublink => ({
          ...sublink,
          visible: true
        }))
      }))
    }));
  }

  // Modifique o método saveMenu para incluir a chamada ao refreshMenusForAdmin
  // Adicione este método para verificar se as propriedades dinâmicas estão sendo preservadas
  saveMenu(): void {
    if (this.menuForm.invalid) {
      this.snackBar.open('Por favor, corrija os erros no formulário antes de salvar', 'Fechar', {
        duration: 3000
      });
      return;
    }

    const menuItem: MenuItem = this.menuForm.value;

    // Debug: verifica links dinâmicos
    console.log('Salvando menu:', JSON.stringify(menuItem));

    // Verificar se links dinâmicos estão marcados corretamente
    menuItem.links.forEach(link => {
      if (link.isDynamic) {
        console.log(`Link dinâmico encontrado: ${link.label}, rota: ${link.route}`);

        // Garantir que a rota tenha o formato correto
        if (link.route && !link.route.includes(':id')) {
          link.route = link.route + '/:id';
          console.log(`Corrigido formato da rota dinâmica para: ${link.route}`);
        }
      }
    });

    if (this.editingMenuIndex !== null) {
      // Update existing menu
      this.menuItems[this.editingMenuIndex] = menuItem;
      this.snackBar.open('Menu atualizado com sucesso!', 'Fechar', { duration: 2000 });
    } else {
      // Add new menu
      this.menuItems.push(menuItem);
      this.snackBar.open('Novo menu criado com sucesso!', 'Fechar', { duration: 2000 });
    }

    // Update service
    this.menuService.updateMenuItems(this.menuItems);

    // IMPORTANTE: Faça o serviço processar o menu imediatamente para ver se as rotas dinâmicas funcionam
    this.menuService.debugMenuItems();

    // Reset form state
    this.cancelEdit();
  }

  // Adicione este método
  restoreAdminVisibility(): void {
    // Força todos os menus a serem visíveis para o administrador
    this.refreshMenusForAdmin();

    // Aplica as mudanças
    this.menuService.updateMenuItems(this.menuItems);

    this.snackBar.open('Visibilidade total de administrador restaurada!', 'OK', { duration: 2000 });
  }

  // Método para alternar entre rota estática e dinâmica para links
  // Modifique este método no AdminRegisterComponent
  toggleDynamicRoute(link: FormGroup): void {
    if (!link) return;

    const isDynamicControl = link.get('isDynamic');
    if (!isDynamicControl) return;

    const isDynamic = !isDynamicControl.value;
    isDynamicControl.setValue(isDynamic);

    const routeControl = link.get('route');
    if (!routeControl) return;

    // Se está tornando dinâmico
    if (isDynamic) {
      const currentRoute = routeControl.value || '';
      // Vamos garantir que o formato tenha exatamente /client/:id
      if (!currentRoute.includes(':id')) {
        // Garante que a URL tenha o formato exato
        const baseRoute = currentRoute.replace(/\/client\/.*$/, '').replace(/\/client$/, '');
        routeControl.setValue(baseRoute + '/client/:id');
      }
      this.snackBar.open('Rota dinâmica ativada! O ID do usuário será inserido automaticamente.', 'OK', { duration: 3000 });

      // Garante que o objeto de dados tem a propriedade isDynamic marcada
      console.log('Link marcado como dinâmico:', routeControl.value);
    } else {
      // Se está tornando estático, podemos remover o :id
      const currentRoute = routeControl.value || '';
      if (currentRoute.includes(':id')) {
        routeControl.setValue(currentRoute.replace(':id', ''));
      }
      this.snackBar.open('Rota estática restaurada.', 'OK', { duration: 3000 });
    }
  }

  // Método para alternar entre rota estática e dinâmica para sublinks
  toggleDynamicSubRoute(linkIndex: number, sublinkIndex: number): void {
    const sublinks = this.getSublinks(linkIndex);
    const sublinkForm = sublinks.at(sublinkIndex) as FormGroup;

    const isDynamicControl = sublinkForm.get('isDynamic');
    if (!isDynamicControl) return;

    const isDynamic = !isDynamicControl.value;
    isDynamicControl.setValue(isDynamic);

    const routeControl = sublinkForm.get('route');
    if (!routeControl) return;

    // Se está tornando dinâmico
    if (isDynamic) {
      const currentRoute = routeControl.value || '';
      if (currentRoute.includes(':id')) {
        // A rota já tem um parâmetro :id, não precisamos alterar
      } else {
        // Definimos um valor padrão para a rota dinâmica
        routeControl.setValue('/client/:id');
      }
      this.snackBar.open('Rota dinâmica ativada! O ID do usuário será inserido automaticamente.', 'OK', { duration: 3000 });
    } else {
      // Se está tornando estático, podemos remover o :id
      const currentRoute = routeControl.value || '';
      if (currentRoute.includes(':id')) {
        routeControl.setValue(currentRoute.replace(':id', ''));
      }
      this.snackBar.open('Rota estática restaurada.', 'OK', { duration: 3000 });
    }
  }


}
