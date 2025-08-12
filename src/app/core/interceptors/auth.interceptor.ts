import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * 🔥 INTERCEPTOR HÍBRIDO - Angular 17 Standalone
 * Injeta automaticamente headers de autorização em requisições HTTP
 * Otimizado para desenvolvimento e produção
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Log apenas em desenvolvimento
  if (!environment.production) {
    console.log('🔥 [AUTH-INTERCEPTOR] Interceptando requisição:', req.url);
  }

  if (token && token.trim() !== '') {
    // Clona a requisição e adiciona o header Authorization
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!environment.production) {
      console.log('🔥 [AUTH-INTERCEPTOR] Token encontrado - Headers adicionados automaticamente');
    }
    return next(authReq);
  }

  if (!environment.production) {
    console.log('🔥 [AUTH-INTERCEPTOR] Sem token - Requisição original mantida');
  }
  return next(req);
};
