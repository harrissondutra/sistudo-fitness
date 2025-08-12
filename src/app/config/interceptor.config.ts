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
 * Interceptor específico para produção - resolve diferenças entre local e produção
 * ⚠️ IMPORTANTE: Preserva headers existentes, especialmente Authorization
 */
export const productionInterceptor: HttpInterceptorFn = (req, next) => {
  let modifiedReq = req;

  // Headers específicos para HTTPS e CORS em produção
  const productionHeaders: { [key: string]: string } = {};

  // APENAS adiciona headers que não existem para não sobrescrever Authorization
  if (!req.headers.has('Content-Type')) {
    productionHeaders['Content-Type'] = 'application/json';
  }
  if (!req.headers.has('Accept')) {
    productionHeaders['Accept'] = 'application/json';
  }
  if (!req.headers.has('X-Requested-With')) {
    productionHeaders['X-Requested-With'] = 'XMLHttpRequest';
  }

  // Adiciona Origin header explícito para CORS
  if (typeof window !== 'undefined' && window.location && !req.headers.has('Origin')) {
    productionHeaders['Origin'] = window.location.origin;
  }

  // Headers específicos para Railway/HTTPS
  if (req.url.includes('railway.app') || req.url.includes('https://')) {
    if (!req.headers.has('Cache-Control')) {
      productionHeaders['Cache-Control'] = 'no-cache';
    }
    if (!req.headers.has('Pragma')) {
      productionHeaders['Pragma'] = 'no-cache';
    }
  }

  // Clone apenas se há headers para adicionar
  if (Object.keys(productionHeaders).length > 0) {
    modifiedReq = req.clone({
      setHeaders: productionHeaders
    });
  }

  // Log detalhado para debug (temporário)
  console.log('🚀 [PROD DEBUG] Requisição:', {
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(modifiedReq.headers.keys().map(key => [key, modifiedReq.headers.get(key)])),
    body: req.body,
    hasAuth: !!modifiedReq.headers.get('Authorization'),
    origin: window.location?.origin,
    userAgent: navigator?.userAgent?.substring(0, 50) + '...'
  });

  return next(modifiedReq);
};
