import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // URLs que não precisam de autenticação
  const publicUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/validate-reset-token'
  ];

  // Verifica se a URL é pública
  const isPublicUrl = publicUrls.some(url => req.url.includes(url));

  if (isPublicUrl) {
    console.log('[Auth Interceptor] URL pública, sem token:', req.url);
    return next(req);
  }

  // Obtém o token
  const token = authService.getToken();

  if (token) {
    // Clona a requisição e adiciona o header de autorização
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('[Auth Interceptor] Token adicionado:', token.substring(0, 20) + '...');
    return next(authReq);
  } else {
    console.warn('[Auth Interceptor] Token não encontrado para URL:', req.url);

    // Se não há token e não é URL pública, pode indicar problema de autenticação
    if (!isPublicUrl) {
      console.error('[Auth Interceptor] Requisição para URL protegida sem token');
    }

    return next(req);
  }
};
