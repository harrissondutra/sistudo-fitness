import { Injectable } from '@angular/core';
import { UserRole } from '../../models/user_role';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class MenuVisibilityService {
  private readonly STORAGE_KEY_PREFIX = 'menu_permissions_';
  // Adiciona a propriedade menuItems
  menuItems: any[] = []; // Substitua 'any[]' pelo tipo correto se necessário

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Obtém as permissões de menu para uma determinada role
   */
  /**
 * Obtém as permissões de menu para uma determinada role
 */
  getMenuPermissions(role: UserRole): any {
    const storageKey = `${this.STORAGE_KEY_PREFIX}${role}`;
    console.log('Tentando obter permissões de:', storageKey);

    try {
      const permissionsStr = localStorage.getItem(storageKey);
      console.log('Permissões obtidas (raw):', permissionsStr);

      if (permissionsStr && permissionsStr !== 'undefined') {
        const parsedPermissions = JSON.parse(permissionsStr);
        console.log('Permissões parseadas:', parsedPermissions);
        return parsedPermissions;
      }
    } catch (e) {
      console.error('Erro ao obter permissões do localStorage:', e);
    }

    console.log('Nenhuma permissão encontrada para a role:', role);
    return null;
  }

  /**
   * Salva as permissões de menu para uma determinada role
   */
  saveMenuPermissions(role: UserRole, permissions: any): void {
    const storageKey = `${this.STORAGE_KEY_PREFIX}${role}`;
    console.log('Salvando permissões em:', storageKey);
    console.log('Dados a serem salvos:', permissions);

    try {
      const jsonString = JSON.stringify(permissions);
      localStorage.setItem(storageKey, jsonString);

      // Verificar se o salvamento foi bem-sucedido
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        console.log('Permissões salvas com sucesso. Verificação:', saved.substring(0, 50) + '...');
      } else {
        console.error('Falha ao salvar permissões - item não encontrado após salvamento');
      }
    } catch (e) {
      console.error('Erro ao salvar permissões:', e);
    }
  }

  /**
   * Limpa todas as permissões salvas (útil para debug)
   */
  clearAllPermissions(): void {
    for (const key in localStorage) {
      if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
    console.log('Todas as permissões foram removidas');
  }

  updateMenuVisibility(permissions: any): void {
    console.log('Atualizando visibilidade com permissões:', permissions);

    // Percorre todos os itens de menu e define a visibilidade conforme as permissões salvas
    this.menuItems.forEach(menu => {
      const menuId = menu.id;
      const menuPermission = permissions[menuId];

      if (menuPermission !== undefined) {
        console.log(`Atualizando menu ${menuId}, visibilidade: ${menuPermission.visible}`);
        menu.visible = menuPermission.visible;

        // Atualiza visibilidade dos links
        if (menu.links) {
          menu.links.forEach((link: any) => {
            const linkId = link.id || '';

            if (menuPermission.links && menuPermission.links[linkId] !== undefined) {
              console.log(`  Link ${linkId}, visibilidade: ${menuPermission.links[linkId].visible}`);
              link.visible = menuPermission.links[linkId].visible;

              // Atualiza visibilidade dos sublinks, se existirem
              if ('sublinks' in link && link.sublinks) {
                link.sublinks.forEach((sublink: any) => {
                  const sublinkId = sublink.id || '';

                  if (menuPermission.links[linkId].sublinks &&
                    menuPermission.links[linkId].sublinks[sublinkId] !== undefined) {
                    console.log(`    Sublink ${sublinkId}, visibilidade: ${menuPermission.links[linkId].sublinks[sublinkId].visible}`);
                    sublink.visible = menuPermission.links[linkId].sublinks[sublinkId].visible;
                  }
                });
              }
            }
          });
        }
      }
    });

    // Notificação visual para confirmar atualização
    this.snackBar.open('Visibilidade de menus atualizada', 'OK', { duration: 2000 });
  }
}
