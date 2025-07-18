import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // Log para debug
    console.log('[JWT Interceptor] Token:', token);
    console.log('[JWT Interceptor] Authorization Header:', cloned.headers.get('Authorization'));
    return next(cloned);
  }
  // Log para debug
  console.log('[JWT Interceptor] Sem token, requisição sem Authorization');
  return next(req);
};
