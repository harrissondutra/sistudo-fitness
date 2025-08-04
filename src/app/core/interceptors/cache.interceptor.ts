import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { DataCacheService } from '../../services/cache/data-cache.service';

export interface CacheHttpOptions {
  cache?: boolean;
  cacheKey?: string;
  maxAge?: number;
  refresh?: boolean;
}

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private pendingRequests = new Map<string, Observable<HttpEvent<any>>>();

  constructor(private cacheService: DataCacheService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Só aplica cache para requisições GET
    if (req.method !== 'GET') {
      return next.handle(req);
    }

    // Verifica se a requisição deve usar cache
    const cacheOptions = this.extractCacheOptions(req);
    if (!cacheOptions.cache) {
      return next.handle(req);
    }

    const cacheKey = cacheOptions.cacheKey || this.generateCacheKey(req);

    // Se refresh=true, força nova busca
    if (cacheOptions.refresh) {
      return this.handleCachedRequest(req, next, cacheKey, cacheOptions);
    }

    // Evita requisições duplicadas simultâneas
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    return this.handleCachedRequest(req, next, cacheKey, cacheOptions);
  }

  private handleCachedRequest(
    req: HttpRequest<any>, 
    next: HttpHandler, 
    cacheKey: string,
    options: CacheHttpOptions
  ): Observable<HttpEvent<any>> {
    const request$ = this.cacheService.get(
      cacheKey,
      () => next.handle(req),
      { maxAge: options.maxAge }
    ).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log(`🌐 HTTP Cache para ${req.url}:`, event.body);
        }
      }),
      finalize(() => {
        this.pendingRequests.delete(cacheKey);
      })
    );

    this.pendingRequests.set(cacheKey, request$);
    return request$;
  }

  private extractCacheOptions(req: HttpRequest<any>): CacheHttpOptions {
    // Extrai opções de cache dos headers customizados
    const cache = req.headers.get('X-Cache') === 'true';
    const cacheKey = req.headers.get('X-Cache-Key') || undefined;
    const maxAge = req.headers.get('X-Cache-MaxAge') ? 
      parseInt(req.headers.get('X-Cache-MaxAge')!, 10) : undefined;
    const refresh = req.headers.get('X-Cache-Refresh') === 'true';

    return { cache, cacheKey, maxAge, refresh };
  }

  private generateCacheKey(req: HttpRequest<any>): string {
    // Gera chave baseada na URL e parâmetros
    const params = req.params.toString();
    return `http_${req.url}${params ? '_' + params : ''}`;
  }
}
