import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { jwtInterceptor } from '../core/interceptors/jwt.interceptor';
import { errorInterceptor } from '../core/interceptors/error.interceptor';
import { sessionActivityInterceptor } from '../core/interceptors/session-activity.interceptor';

/**
 * Configuração centralizada dos interceptors HTTP para o sistema.
 * Interceptors são aplicados na ordem definida neste array.
 */
export const httpInterceptors = [
  // 1. JWT Interceptor - Adiciona token de autorização
  jwtInterceptor,

  // 2. Session Activity Interceptor - Monitora atividade da sessão
  sessionActivityInterceptor,

  // 3. Error Interceptor - Trata erros HTTP globalmente
  errorInterceptor
];

/**
 * Interceptor adicional para configurações específicas de produção
 */
export const productionInterceptor: HttpInterceptorFn = (req, next) => {
  // Adiciona headers específicos para produção
  let modifiedReq = req;

  // Headers necessários para CORS em produção
  if (req.url.includes('api')) {
    modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
  }

  // Log para debug em produção (remover após debug)
  console.log('[Production Interceptor] URL:', req.url);
  console.log('[Production Interceptor] Headers:', modifiedReq.headers.keys());
  console.log('[Production Interceptor] Authorization:', modifiedReq.headers.get('Authorization'));

  return next(modifiedReq);
};
