import { Injectable } from '@angular/core';
import { UserRole } from '../../models/user_role';
import { BehaviorSubject } from 'rxjs';
import { MenuService } from '../menu-visibility/menu.service';

@Injectable({
  providedIn: 'root'
})
export class MenuVisibilityService {
  private readonly STORAGE_KEY_PREFIX = 'menu_permissions_';

  // Observable que emite quando as permissões são alteradas
  private permissionsChangedSubject = new BehaviorSubject<string>('');
  permissionsChanged$ = this.permissionsChangedSubject.asObservable();

  constructor(private menuService: MenuService) { }

  /**
   * Obtém as permissões de menu para uma determinada role
   */
  getMenuPermissions(role: UserRole): any {
    const storageKey = `${this.STORAGE_KEY_PREFIX}${role}`;

    try {
      const permissionsStr = localStorage.getItem(storageKey);

      if (permissionsStr && permissionsStr !== 'undefined') {
        const parsedPermissions = JSON.parse(permissionsStr);
        return parsedPermissions;
      }
    } catch (e) {
      console.error('Erro ao obter permissões do localStorage:', e);
    }

    return null;
  }

  /**
   * Salva as permissões de menu para uma determinada role
   */
  saveMenuPermissions(role: UserRole, permissions: any): void {
    const storageKey = `${this.STORAGE_KEY_PREFIX}${role}`;

    try {
      const jsonString = JSON.stringify(permissions);
      localStorage.setItem(storageKey, jsonString);

      // Atualiza o menu compartilhado
      this.menuService.updateMenuVisibilityByRole(role, permissions);

      // Notifica os assinantes que as permissões foram alteradas
      this.permissionsChangedSubject.next(role);
    } catch (e) {
      console.error('Erro ao salvar permissões:', e);
    }
  }
}
