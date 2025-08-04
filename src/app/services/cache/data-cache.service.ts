import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, EMPTY } from 'rxjs';
import { tap, catchError, shareReplay, map } from 'rxjs/operators';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // em ms
}

export interface CacheConfig {
  maxAge?: number; // em ms
  maxSize?: number; // número máximo de itens
  staleTime?: number; // tempo para considerar stale (em ms)
}

@Injectable({
  providedIn: 'root'
})
export class DataCacheService {
  private cache = new Map<string, CacheItem<any>>();
  private loadingMap = new Map<string, Observable<any>>();
  private readonly DEFAULT_CONFIG: Required<CacheConfig> = {
    maxAge: 5 * 60 * 1000, // 5 minutos
    maxSize: 100, // máximo 100 itens no cache
    staleTime: 30 * 1000 // 30 segundos para stale-while-revalidate
  };

  // BehaviorSubjects para notificar mudanças
  private cacheUpdates$ = new BehaviorSubject<{ key: string; data: any } | null>(null);

  /**
   * Estratégia de cache get com stale-while-revalidate
   */
  get<T>(
    key: string, 
    factory: () => Observable<T>, 
    config?: CacheConfig
  ): Observable<T> {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const cacheItem = this.cache.get(key);
    const now = Date.now();

    // Se existe cache válido (não expirado)
    if (cacheItem && now < cacheItem.expiry) {
      return of(cacheItem.data);
    }

    // Se existe cache stale mas não expirado completamente
    if (cacheItem && (now - cacheItem.timestamp) < finalConfig.maxAge) {
      // Retorna o dado stale imediatamente
      const staleData = of(cacheItem.data);
      
      // Busca nova versão em background (sem bloquear)
      setTimeout(() => {
        this.fetchAndCache(key, factory, finalConfig).subscribe();
      }, 0);
      
      return staleData;
    }

    // Cache expirado ou não existe - busca nova versão
    return this.fetchAndCache(key, factory, finalConfig);
  }

  /**
   * Busca dados e armazena no cache
   */
  private fetchAndCache<T>(
    key: string, 
    factory: () => Observable<T>, 
    config: Required<CacheConfig>
  ): Observable<T> {
    // Previne múltiplas requisições simultâneas para a mesma chave
    const loadingRequest = this.loadingMap.get(key);
    if (loadingRequest) {
      return loadingRequest;
    }

    const request$ = factory().pipe(
      tap(data => {
        this.set(key, data, config);
        this.loadingMap.delete(key);
      }),
      catchError(error => {
        this.loadingMap.delete(key);
        return EMPTY;
      }),
      shareReplay(1)
    );

    this.loadingMap.set(key, request$);
    return request$;
  }

  /**
   * Define um valor no cache
   */
  set<T>(key: string, data: T, config?: CacheConfig): void {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const now = Date.now();

    // Aplica política de LRU (Least Recently Used) se necessário
    if (this.cache.size >= finalConfig.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiry: now + finalConfig.maxAge
    };

    this.cache.set(key, cacheItem);
    this.notifyUpdate(key, data);
  }

  /**
   * Obtém um valor do cache sem buscar se não existir
   */
  getFromCache<T>(key: string): T | null {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return null;

    const now = Date.now();
    if (now >= cacheItem.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cacheItem.data;
  }

  /**
   * Remove uma chave específica do cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
    this.loadingMap.delete(key);
  }

  /**
   * Remove chaves que correspondem a um padrão
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.loadingMap.delete(key);
      }
    }
  }

  /**
   * Remove todas as entradas do cache
   */
  clear(): void {
    this.cache.clear();
    this.loadingMap.clear();
  }

  /**
   * Força a atualização de uma chave específica
   */
  refresh<T>(
    key: string, 
    factory: () => Observable<T>, 
    config?: CacheConfig
  ): Observable<T> {
    this.invalidate(key);
    return this.get(key, factory, config);
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    return {
      size: this.cache.size,
      loading: this.loadingMap.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Verifica se uma chave existe e está válida
   */
  has(key: string): boolean {
    const cacheItem = this.cache.get(key);
    if (!cacheItem) return false;

    const now = Date.now();
    if (now >= cacheItem.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Obtém observable para observar mudanças no cache
   */
  getCacheUpdates(): Observable<{ key: string; data: any } | null> {
    return this.cacheUpdates$.asObservable();
  }

  /**
   * Limpa entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now >= item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Pré-carrega dados no cache
   */
  preload<T>(
    key: string, 
    factory: () => Observable<T>, 
    config?: CacheConfig
  ): void {
    if (!this.has(key)) {
      this.get(key, factory, config).subscribe();
    }
  }

  /**
   * Atualiza configuração de uma entrada específica
   */
  touch(key: string, config?: CacheConfig): void {
    const cacheItem = this.cache.get(key);
    if (cacheItem) {
      const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
      const now = Date.now();
      
      cacheItem.timestamp = now;
      cacheItem.expiry = now + finalConfig.maxAge;
      
      this.cache.set(key, cacheItem);
    }
  }

  /**
   * Obtém lista de chaves que correspondem a um padrão
   */
  getKeysByPattern(pattern: string): string[] {
    const regex = new RegExp(pattern);
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  /**
   * Obtém múltiplas entradas do cache
   */
  getMultiple<T>(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>();
    
    for (const key of keys) {
      result.set(key, this.getFromCache<T>(key));
    }
    
    return result;
  }

  /**
   * Define múltiplas entradas no cache
   */
  setMultiple<T>(entries: Map<string, T>, config?: CacheConfig): void {
    for (const [key, data] of entries) {
      this.set(key, data, config);
    }
  }

  /**
   * Notifica sobre atualizações
   */
  private notifyUpdate(key: string, data: any): void {
    this.cacheUpdates$.next({ key, data });
  }
}
