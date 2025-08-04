import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { DataCacheService } from '../../services/cache/data-cache.service';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(DataCacheService);

  // Apenas intercepta requests GET
  if (req.method !== 'GET') {
    return next(req);
  }

  // Verifica se o request tem headers de cache
  const cacheControl = req.headers.get('X-Cache-Control');
  if (!cacheControl || cacheControl === 'no-cache') {
    return next(req);
  }

  // Extrai opções de cache dos headers
  const cacheOptions = extractCacheOptions(req);
  
  // Gera chave de cache baseada na URL e parâmetros
  const cacheKey = generateCacheKey(req);

  // Usa o cache service para obter/armazenar dados
  return cacheService.get(
    cacheKey,
    () => next(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          // Log para debug (remover em produção)
          console.log(`Cache MISS for: ${cacheKey}`);
        }
      })
    ),
    cacheOptions
  );
};

function extractCacheOptions(req: HttpRequest<any>) {
  const maxAge = req.headers.get('X-Cache-Max-Age');
  const maxSize = req.headers.get('X-Cache-Max-Size');
  const staleTime = req.headers.get('X-Cache-Stale-Time');

  return {
    maxAge: maxAge ? parseInt(maxAge, 10) : undefined,
    maxSize: maxSize ? parseInt(maxSize, 10) : undefined,
    staleTime: staleTime ? parseInt(staleTime, 10) : undefined
  };
}

function generateCacheKey(req: HttpRequest<any>): string {
  const url = req.urlWithParams;
  const method = req.method;
  const headers = JSON.stringify(req.headers.keys().reduce((acc, key) => {
    if (key.startsWith('X-Cache-')) return acc;
    acc[key] = req.headers.get(key);
    return acc;
  }, {} as any));
  
  return `${method}:${url}:${headers}`;
}
