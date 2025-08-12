import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainningCategory } from '../../models/trainning-category'; // Importe o modelo de categoria
import { environment } from '../../../environments/environment'; // Importe o ambiente da sua aplicação
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class TrainningCategoryService { // Nome do serviço com 'Trainning' (nn)

  // URL base para os endpoints de categoria de treino no backend
  // Precisa ser "/trainning-category" (com 'nn') para casar com o backend
  private baseUrl = `${environment.apiUrl}/trainning-category`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Obtém todas as categorias de treino.
   * Corresponde ao GET /trainning-category/listAll no backend.
   * @returns Um Observable que emite uma lista de TrainningCategory.
   */
  getAllTrainningCategories(): Observable<TrainningCategory[]> { // Nome do método com 'Trainning' (nn)
    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [TrainningCategoryService] getAllTrainningCategories com headers manuais');
    return this.http.get<TrainningCategory[]>(`${this.baseUrl}/listAll`, { headers });
  }

  /**
   * Cria uma nova categoria de treino.
   * Corresponde ao POST /trainning-category/createCategory no backend.
   * @param category A categoria de treino a ser criada.
   * @returns Um Observable que emite a categoria de treino criada.
   */
  createTrainningCategory(category: TrainningCategory): Observable<TrainningCategory> { // Nome do método com 'Trainning' (nn)
    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [TrainningCategoryService] createTrainningCategory com headers manuais');
    return this.http.post<TrainningCategory>(`${this.baseUrl}/createCategory`, category, { headers });
  }

  // Você pode adicionar outros métodos aqui conforme seu backend evolui (ex: getById, update, delete)
  // Exemplo:
   getTrainningCategoryById(id: number): Observable<TrainningCategory> {
     // 🚨 EMERGÊNCIA: Headers manuais
     const headers = this.authService.getAuthHeaders();
     console.log('🚨 [TrainningCategoryService] getTrainningCategoryById com headers manuais:', id);
     return this.http.get<TrainningCategory>(`${this.baseUrl}/${id}`, { headers });
   }

   updateTrainningCategory(id: number, category: TrainningCategory): Observable<TrainningCategory> {
     // 🚨 EMERGÊNCIA: Headers manuais
     const headers = this.authService.getAuthHeaders();
     console.log('🚨 [TrainningCategoryService] updateTrainningCategory com headers manuais:', id);
     return this.http.put<TrainningCategory>(`${this.baseUrl}/${id}`, category, { headers });
   }

   deleteTrainningCategory(id: number): Observable<void> {
     // 🚨 EMERGÊNCIA: Headers manuais
     const headers = this.authService.getAuthHeaders();
     console.log('🚨 [TrainningCategoryService] deleteTrainningCategory com headers manuais:', id);
     return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
   }

   getCategoryNames(): Observable<string[]> {
     // 🚨 EMERGÊNCIA: Headers manuais
     const headers = this.authService.getAuthHeaders();
     console.log('🚨 [TrainningCategoryService] getCategoryNames com headers manuais');
     return this.http.get<string[]>(`${this.baseUrl}/categoryNames`, { headers });
   }
}
