import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interceptor para detectar e corrigir problemas específicos de CORS em produção
 */
export const corsInterceptor: HttpInterceptorFn = (req, next) => {
  // Só aplica em produção
  if (!environment.production) {
    return next(req);
  }

  // Headers específicos para CORS - apenas se não existirem
  const corsHeaders: { [key: string]: string } = {};

  // Define Origin baseado no ambiente
  if (typeof window !== 'undefined' && !req.headers.has('Origin')) {
    corsHeaders['Origin'] = window.location.origin;
  }

  // Headers obrigatórios para Railway - apenas se não existirem
  if (!req.headers.has('Access-Control-Request-Method')) {
    corsHeaders['Access-Control-Request-Method'] = req.method;
  }
  if (!req.headers.has('Access-Control-Request-Headers')) {
    corsHeaders['Access-Control-Request-Headers'] = 'authorization,content-type,accept,x-requested-with';
  }

  // Clone apenas se há headers para adicionar
  const corsReq = Object.keys(corsHeaders).length > 0
    ? req.clone({ setHeaders: corsHeaders })
    : req;

  return next(corsReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Detecta erros específicos de CORS
      if (error.status === 0 && error.error instanceof ProgressEvent) {
        console.error('🚨 [CORS ERROR] Possível problema de CORS detectado:', {
          url: req.url,
          method: req.method,
          error: error.message,
          suggestion: 'Verificar configuração CORS no backend'
        });
      }

      // Detecta erro 403 específico
      if (error.status === 403) {
        console.error('🚨 [403 ERROR] Acesso negado em produção:', {
          url: req.url,
          method: req.method,
          headers: Object.fromEntries(corsReq.headers.keys().map(key => [key, corsReq.headers.get(key)])),
          response: error.error,
          possibleCauses: [
            'Token JWT inválido ou expirado',
            'Headers CORS incorretos',
            'Configuração de segurança do Railway',
            'Rate limiting ativo'
          ]
        });
      }

      return throwError(() => error);
    })
  );
};
