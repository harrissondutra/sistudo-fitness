import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Trainning } from '../../models/trainning';
import { Exercise } from '../../models/exercise';
import { environment } from '../../../environments/environment';
import { DataCacheService } from '../cache/data-cache.service';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class TrainningService {

  private baseUrl = `${environment.apiUrl}/trainning`;

  // Configurações de cache para diferentes tipos de dados
  private readonly CACHE_CONFIG = {
    TRAINNINGS_LIST: { maxAge: 3 * 60 * 1000 }, // 3 minutos para listas
    TRAINNING_DETAIL: { maxAge: 5 * 60 * 1000 }, // 5 minutos para detalhes
    TRAINNING_BY_CLIENT: { maxAge: 2 * 60 * 1000 }, // 2 minutos para dados por cliente
    EXERCISES: { maxAge: 10 * 60 * 1000 } // 10 minutos para exercícios (mudam menos)
  };

  constructor(
    private http: HttpClient,
    private cacheService: DataCacheService,
    private authService: AuthService
  ) { }

  // 1. getTrainningByClientId com cache
  // 🚨 EMERGÊNCIA: Usando headers manuais (interceptors não funcionam)
  getTrainningByClientId(clientId: number, forceRefresh: boolean = false): Observable<Trainning[]> {
    const cacheKey = `trainning_by_client_${clientId}`;

    const fetchFn = () => {
      const headers = this.authService.getAuthHeaders();
      console.log('🚨 [TrainningService] getTrainningByClientId com headers manuais:', clientId);
      return this.http.get<Trainning[]>(`${this.baseUrl}/trainningByClientId/${clientId}`, { headers });
    };

    if (forceRefresh) {
      return this.cacheService.refresh(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNING_BY_CLIENT);
    }

    return this.cacheService.get(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNING_BY_CLIENT);
  }

  // 2. getTrainningById com cache e processamento de datas
  getTrainningById(id: number, forceRefresh: boolean = false): Observable<Trainning> {
    const cacheKey = `trainning_detail_${id}`;

    const fetchFn = () => this.http.get<any>(`${this.baseUrl}/getById/${id}`, {
      headers: new HttpHeaders({
        'X-Cache': 'true',
        'X-Cache-Key': cacheKey
      })
    }).pipe(
      map(response => {
        // Converter startDate de array para Date
        if (Array.isArray(response.startDate)) {
          const [year, month, day, hour = 0, minute = 0] = response.startDate;
          response.startDate = new Date(year, month - 1, day, hour, minute);
        }

        // Converter endDate de array para Date
        if (Array.isArray(response.endDate)) {
          const [year, month, day, hour = 0, minute = 0] = response.endDate;
          response.endDate = new Date(year, month - 1, day, hour, minute);
        }

        return response as Trainning;
      })
    );

    if (forceRefresh) {
      return this.cacheService.refresh(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNING_DETAIL);
    }

    return this.cacheService.get(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNING_DETAIL);
  }

  // 3. getTrainningByName com cache
  getTrainningByName(name: string, forceRefresh: boolean = false): Observable<Trainning> {
    const cacheKey = `trainning_by_name_${name}`;

    const fetchFn = () => this.http.get<Trainning>(`${this.baseUrl}/getByTrainningName/${name}`, {
      headers: new HttpHeaders({
        'X-Cache': 'true',
        'X-Cache-Key': cacheKey
      })
    });

    if (forceRefresh) {
      return this.cacheService.refresh(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNING_DETAIL);
    }

    return this.cacheService.get(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNING_DETAIL);
  }

  // 4. createTrainning - Invalida cache após criação
  createTrainning(trainning: Trainning): Observable<Trainning> {
    return this.http.post<Trainning>(`${this.baseUrl}/create`, trainning).pipe(
      map(response => {
        // Invalida caches relacionados
        this.invalidateTrainningCaches();
        return response;
      })
    );
  }

  // 5. createTrainningByClientId - Invalida cache após criação
  createTrainningByClientId(clientId: number, trainning: Trainning): Observable<Trainning> {
    return this.http.post<Trainning>(`${this.baseUrl}/createByClientId/${clientId}`, trainning).pipe(
      map(response => {
        // Invalida caches relacionados
        this.invalidateTrainningCaches();
        this.cacheService.invalidatePattern(`trainning_by_client_${clientId}`);
        return response;
      })
    );
  }

  // 6. listAllTrainnings com cache otimizado
  listAllTrainnings(forceRefresh: boolean = false): Observable<Trainning[]> {
    const cacheKey = 'trainnings_all';

    const fetchFn = () => this.http.get<Trainning[]>(`${this.baseUrl}/listAll`, {
      headers: new HttpHeaders({
        'X-Cache': 'true',
        'X-Cache-Key': cacheKey
      })
    });

    if (forceRefresh) {
      return this.cacheService.refresh(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNINGS_LIST);
    }

    return this.cacheService.get(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNINGS_LIST);
  }

  // 7. listAllActiveTrainnings com cache otimizado
  // 🚨 EMERGÊNCIA: Usando headers manuais (interceptors não funcionam)
  listAllActiveTrainnings(forceRefresh: boolean = false): Observable<Trainning[]> {
    const cacheKey = 'trainnings_active';

    const fetchFn = () => {
      const headers = this.authService.getAuthHeaders();
      console.log('🚨 [TrainningService] listAllActiveTrainnings com headers manuais');
      return this.http.get<Trainning[]>(`${this.baseUrl}/listAllActive`, { headers });
    };

    if (forceRefresh) {
      return this.cacheService.refresh(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNINGS_LIST);
    }

    return this.cacheService.get(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNINGS_LIST);
  }

  // 8. listAllTrainningsInactive com cache
  // 🚨 EMERGÊNCIA: Usando headers manuais (interceptors não funcionam)
  listAllTrainningsInactive(forceRefresh: boolean = false): Observable<Trainning[]> {
    const cacheKey = 'trainnings_inactive';

    const fetchFn = () => {
      const headers = this.authService.getAuthHeaders();
      console.log('🚨 [TrainningService] listAllTrainningsInactive com headers manuais');
      return this.http.get<Trainning[]>(`${this.baseUrl}/listAllTrainningsInactive`, { headers });
    };

    if (forceRefresh) {
      return this.cacheService.refresh(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNINGS_LIST);
    }

    return this.cacheService.get(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNINGS_LIST);
  }

  listInactiveTrainningsByClientId(clientId: number, forceRefresh: boolean = false): Observable<Trainning[]> {
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [TrainningService] listAllTrainningsInactive com headers manuais:', clientId);

    const cacheKey = `trainning_inactive_by_client_${clientId}`;

    const fetchFn = () => this.http.get<Trainning[]>(`${this.baseUrl}/listInactiveTrainningsByClientId/${clientId}`, {
      headers: new HttpHeaders({
        'X-Cache': 'true',
        'X-Cache-Key': cacheKey
      })
    }).pipe(
      map(trainnings => {
        // Processa as datas de cada treino na lista
        return trainnings.map(trainning => {
          // Converter startDate de array para Date
          if (Array.isArray(trainning.startDate)) {
            const [year, month, day, hour = 0, minute = 0] = trainning.startDate;
            trainning.startDate = new Date(year, month - 1, day, hour, minute);
          }

          // Converter endDate de array para Date
          if (Array.isArray(trainning.endDate)) {
            const [year, month, day, hour = 0, minute = 0] = trainning.endDate;
            trainning.endDate = new Date(year, month - 1, day, hour, minute);
          }

          return trainning;
        });
      })
    );

    if (forceRefresh) {
      return this.cacheService.refresh(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNING_BY_CLIENT);
    }

    return this.cacheService.get(cacheKey, fetchFn, this.CACHE_CONFIG.TRAINNING_BY_CLIENT);
  }

  // 9. deleteTrainning - Invalida cache após deleção
  deleteTrainning(id: number): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [TrainningService] deleteTrainning com headers manuais:', id);
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`, { headers }).pipe(
      map(response => {
        // Invalida caches relacionados
        this.invalidateTrainningCaches();
        this.cacheService.invalidate(`trainning_detail_${id}`);
        return response;
      })
    );
  }

  // 10. updateTrainning - Invalida cache após atualização
  updateTrainning(id: number, trainning: Trainning): Observable<Trainning> {
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [TrainningService] updateTrainning com headers manuais:', id);
    return this.http.put<Trainning>(`${this.baseUrl}/update/${id}`, trainning, { headers }).pipe(
      map(response => {
        // Invalida caches relacionados
        this.invalidateTrainningCaches();
        this.cacheService.invalidate(`trainning_detail_${id}`);
        if (trainning.client?.id) {
          this.cacheService.invalidatePattern(`trainning_by_client_${trainning.client.id}`);
        }
        return response;
      })
    );
  }

  getTrainningExercises(trainningId: number): Observable<Exercise[]> {
    const cacheKey = `trainning_exercises_${trainningId}`;

    const fetchFn = () => this.http.get<Exercise[]>(`${this.baseUrl}/trainnings/${trainningId}/exercises`, {
      headers: new HttpHeaders({
        'X-Cache': 'true',
        'X-Cache-Key': cacheKey
      })
    });

    return this.cacheService.get(cacheKey, fetchFn, this.CACHE_CONFIG.EXERCISES);
  }

  updateExerciseDetails(trainningId: number, exerciseId: number, details: any): Observable<any> {
    return this.http.patch(
      `${this.baseUrl}/${trainningId}/exercises/${exerciseId}`,
      details
    ).pipe(
      map(response => {
        // Invalida cache dos exercícios deste treino
        this.cacheService.invalidate(`trainning_exercises_${trainningId}`);
        this.cacheService.invalidate(`trainning_detail_${trainningId}`);
        return response;
      })
    );
  }

  // ===== MÉTODOS DE CACHE MANAGEMENT =====

  /**
   * Invalida todos os caches relacionados a treinos
   */
  private invalidateTrainningCaches(): void {
    this.cacheService.invalidatePattern('trainnings_');
    this.cacheService.invalidatePattern('trainning_');
  }

  /**
   * Força refresh de todos os dados de treinos
   */
  refreshAllTrainningsCache(): void {
    this.invalidateTrainningCaches();
  }

  /**
   * Invalida cache específico de um cliente
   */
  invalidateClientTrainnings(clientId: number): void {
    this.cacheService.invalidatePattern(`trainning_by_client_${clientId}`);
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): any {
    return this.cacheService.getStats();
  }

}
