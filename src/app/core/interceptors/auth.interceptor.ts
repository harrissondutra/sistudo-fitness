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
  console.log('🚨 [AUTH-INTERCEPTOR] ================================');
  console.log('🚨 [AUTH-INTERCEPTOR] INTERCEPTOR EXECUTADO!');
  console.log('🚨 [AUTH-INTERCEPTOR] URL:', req.url);
  console.log('🚨 [AUTH-INTERCEPTOR] Method:', req.method);
  console.log('🚨 [AUTH-INTERCEPTOR] Headers originais:', req.headers.keys());
  
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('🚨 [AUTH-INTERCEPTOR] Token presente:', !!token);
  console.log('� [AUTH-INTERCEPTOR] Token length:', token ? token.length : 0);

  if (token && token.trim() !== '') {
    // Clona a requisição e adiciona o header Authorization
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('✅ [AUTH-INTERCEPTOR] HEADERS ADICIONADOS!');
    console.log('✅ [AUTH-INTERCEPTOR] Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    console.log('✅ [AUTH-INTERCEPTOR] Headers finais:', authReq.headers.keys());
    console.log('� [AUTH-INTERCEPTOR] ================================');
    return next(authReq);
  }

  console.log('❌ [AUTH-INTERCEPTOR] SEM TOKEN - Requisição sem headers');
  console.log('🚨 [AUTH-INTERCEPTOR] ================================');
  return next(req);
};
