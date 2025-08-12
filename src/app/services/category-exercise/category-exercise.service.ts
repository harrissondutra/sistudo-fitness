import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExerciseCategory } from '../../models/exercise-category'; // Certifique-se de que o caminho está correto
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryExerciseService {
  private apiUrl = `${environment.apiUrl}/categoryExercise`;

  constructor( private http: HttpClient, private authService: AuthService ) { }

  getAllCategories(): Observable<ExerciseCategory[]> {
    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [CategoryExerciseService] getAllCategories com headers manuais');
    return this.http.get<ExerciseCategory[]>(`${this.apiUrl}/list`, { headers });
  }

  createCategory(category: ExerciseCategory): Observable<ExerciseCategory> {
    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [CategoryExerciseService] createCategory com headers manuais');
    return this.http.post<ExerciseCategory>(`${this.apiUrl}/create`, category, { headers });
  }
}
