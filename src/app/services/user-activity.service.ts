import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {
  private activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  private activityTimeout: any;

  constructor(private authService: AuthService) {
    this.initActivityTracking();
  }

  /**
   * Inicializa o rastreamento de atividade do usuário
   */
  private initActivityTracking(): void {
    // Adiciona listeners para eventos de atividade do usuário
    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.onUserActivity.bind(this), true);
    });
  }

  /**
   * Callback executado quando há atividade do usuário
   */
  private onUserActivity(): void {
    // Debounce para evitar muitas atualizações
    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }

    this.activityTimeout = setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        this.authService.updateLastActivity();
      }
    }, 1000); // Atualiza no máximo a cada segundo
  }

  /**
   * Remove os listeners quando o serviço é destruído
   */
  destroy(): void {
    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.onUserActivity.bind(this), true);
    });

    if (this.activityTimeout) {
      clearTimeout(this.activityTimeout);
    }
  }
}
