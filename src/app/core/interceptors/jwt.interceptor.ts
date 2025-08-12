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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Log para debug (especialmente importante em produção)
    if (environment.production) {
      console.log('[JWT Interceptor] [PROD] URL:', req.url);
      console.log('[JWT Interceptor] [PROD] Token presente:', !!token);
      console.log('[JWT Interceptor] [PROD] Headers:', {
        'Authorization': `Bearer ${token.substring(0, 20)}...`,
        'Content-Type': cloned.headers.get('Content-Type'),
        'Accept': cloned.headers.get('Accept')
      });
    }

    return next(cloned);
  }

  // Se não há token e não é URL pública, isso pode ser um problema
  if (!isPublicUrl) {
    console.error('[JWT Interceptor] ERRO: Requisição para URL protegida sem token:', req.url);
  }

  return next(req);
};
