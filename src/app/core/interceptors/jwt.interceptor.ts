import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // DEBUG: Log todas as requisições
  console.log('[JWT Interceptor] Interceptando requisição:', req.url);

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
    console.log('[JWT Interceptor] URL pública, não adicionando token:', req.url);
    return next(req);
  }

  const token = authService.getToken();
  console.log('[JWT Interceptor] Token obtido:', !!token);

  if (token) {
    console.log('[JWT Interceptor] Adicionando Authorization header para:', req.url);
    const cloned = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  console.warn('[JWT Interceptor] Sem token para requisição:', req.url);
  return next(req);
};
