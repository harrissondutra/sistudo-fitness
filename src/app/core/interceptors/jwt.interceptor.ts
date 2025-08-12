import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // URLs que não precisam de autenticação
  const publicUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/validate-reset-token'
  ];

  // Verifica se é uma URL pública
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  if (isPublicUrl) {
    console.log('[JWT Interceptor] URL pública, sem autenticação:', req.url);
    return next(req);
  }

  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Log detalhado para debug em produção
    console.log('✅ [JWT Interceptor] Token adicionado:', {
      url: req.url,
      method: req.method,
      tokenPresente: !!token,
      tokenTamanho: token.length,
      authHeaderAdicionado: !!cloned.headers.get('Authorization'),
      allHeaders: Object.fromEntries(cloned.headers.keys().map(key => [key, cloned.headers.get(key)]))
    });

    return next(cloned);
  }

  // Se não há token e não é URL pública, isso pode ser um problema
  if (!isPublicUrl) {
    console.error('❌ [JWT Interceptor] ERRO: Requisição para URL protegida sem token:', req.url);
    console.error('❌ [JWT Interceptor] Headers originais:', Object.fromEntries(req.headers.keys().map(key => [key, req.headers.get(key)])));
  }

  return next(req);
};
