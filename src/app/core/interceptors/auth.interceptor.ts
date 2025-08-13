import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

/**
 * Interceptor para adicionar headers de autorização automaticamente
 * Angular 17 - Functional Interceptor Pattern
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🚨 [AUTH-INTERCEPTOR] ================================');
  console.log('🚨 [AUTH-INTERCEPTOR] INTERCEPTOR EXECUTADO!');
  console.log('🚨 [AUTH-INTERCEPTOR] URL:', req.url);
  console.log('🚨 [AUTH-INTERCEPTOR] Method:', req.method);

  try {
    const authService = inject(AuthService);
    console.log('✅ [AUTH-INTERCEPTOR] AuthService injetado com sucesso');

    const token = authService.getToken();
    console.log('🚨 [AUTH-INTERCEPTOR] Token do AuthService:', token ? 'PRESENTE' : 'AUSENTE');

    if (token) {
      console.log('🚨 [AUTH-INTERCEPTOR] Token length:', token.length);
      console.log('🚨 [AUTH-INTERCEPTOR] Token preview:', token.substring(0, 30) + '...');
    }

    // Também tentar pegar diretamente do sessionStorage como fallback
    const directToken = sessionStorage.getItem('token');
    console.log('🚨 [AUTH-INTERCEPTOR] Token direto do sessionStorage:', directToken ? 'PRESENTE' : 'AUSENTE');

    if (token && token.trim() !== '') {
      console.log('✅ [AUTH-INTERCEPTOR] Token válido encontrado via AuthService');

      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('✅ [AUTH-INTERCEPTOR] HEADERS ADICIONADOS COM SUCESSO!');
      console.log('🚨 [AUTH-INTERCEPTOR] ================================');
      return next(authReq);
    } else if (directToken && directToken.trim() !== '') {
      console.log('🔄 [AUTH-INTERCEPTOR] Usando token direto do sessionStorage');

      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${directToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('✅ [AUTH-INTERCEPTOR] HEADERS ADICIONADOS COM TOKEN DIRETO!');
      console.log('🚨 [AUTH-INTERCEPTOR] ================================');
      return next(authReq);
    }
  } catch (error) {
    console.error('💥 [AUTH-INTERCEPTOR] ERRO NO INTERCEPTOR:', error);

    try {
      const directToken = sessionStorage.getItem('token');
      if (directToken) {
        console.log('🔄 [AUTH-INTERCEPTOR] FALLBACK: Tentando token direto');
        const authReq = req.clone({
          setHeaders: {
            'Authorization': `Bearer ${directToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        return next(authReq);
      }
    } catch (fallbackError) {
      console.error('💥 [AUTH-INTERCEPTOR] ERRO NO FALLBACK:', fallbackError);
    }
  }

  console.log('❌ [AUTH-INTERCEPTOR] SEM TOKEN - Enviando requisição sem headers');
  console.log('🚨 [AUTH-INTERCEPTOR] ================================');
  return next(req);
};
