import { Injectable } from '@angular/core';
import { UserRole } from '../../models/user_role';
import { BehaviorSubject } from 'rxjs';
import { MenuService } from '../menu-visibility/menu.service';
import { AuthService } from '../auth.service'; // Adicione esta importação


@Injectable({
  providedIn: 'root'
})
export class MenuVisibilityService {
  private readonly STORAGE_KEY_PREFIX = 'menu_permissions_';

  // Observable que emite quando as permissões são alteradas
  private permissionsChangedSubject = new BehaviorSubject<string>('');
  permissionsChanged$ = this.permissionsChangedSubject.asObservable();

  constructor(private menuService: MenuService, private authService: AuthService) { }

  /**
   * Obtém as permissões de menu para uma determinada role
   */
  getMenuPermissions(role: UserRole): any {
    try {
      const key = `menu_permissions_${role}`;
      const storedData = localStorage.getItem(key);

      if (!storedData) {
        console.log(`Nenhuma permissão encontrada para ${role}`);
        return null;
      }

      const permissions = JSON.parse(storedData);
      console.log(`Permissões carregadas para ${role}:`, permissions);
      return permissions;
    } catch (error) {
      console.error(`Erro ao carregar permissões para ${role}:`, error);
      return null;
    }
  }

  /**
   * Salva as permissões de menu para uma determinada role
   */
   saveMenuPermissions(role: UserRole, permissions: any): void {
    try {
      const key = `menu_permissions_${role}`;
      const permissionsJson = JSON.stringify(permissions);
      localStorage.setItem(key, permissionsJson);
      console.log(`Permissões salvas para ${role}:`, permissionsJson);

      // CRÍTICO: Não reaplique as permissões ao usuário atual
      // se ele for um administrador
      if (this.authService.getUserRole() === UserRole.ADMIN && role !== UserRole.ADMIN) {
        console.log('Usuário atual é administrador e está editando outro perfil. Não aplicando as alterações.');
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      throw new Error('Não foi possível salvar as permissões');
    }
  }

  getCurrentUserMenuPermissions(): any {
    const currentUserRole = this.authService.getUserRole();

    // IMPORTANTE: Sempre garantir que o administrador tenha acesso total,
    // independentemente das configurações salvas
    if (currentUserRole === UserRole.ADMIN) {
      console.log('Usuário é administrador. Retornando permissões de administrador padrão.');
      return this.getAdminDefaultPermissions();
    }

    return this.getMenuPermissions(currentUserRole);
  }

  private getAdminDefaultPermissions(): any {
    // Retorna um objeto que concede acesso total a todos os menus
    return {
      // As permissões completas seriam definidas aqui, mas para
      // simplicidade, retornamos null para que o sistema use os valores padrão
      // que dão acesso completo aos administradores
      admin_override: true
    };
  }

  // Método para limpar permissões
  clearMenuPermissions(role: UserRole): void {
    const key = `menu_permissions_${role}`;
    localStorage.removeItem(key);
    console.log(`Permissões para ${role} foram removidas`);
  }

  // Método para verificar se existem permissões salvas
  hasMenuPermissions(role: UserRole): boolean {
    const key = `menu_permissions_${role}`;
    const storedData = localStorage.getItem(key);
    return !!storedData;
  }
}
