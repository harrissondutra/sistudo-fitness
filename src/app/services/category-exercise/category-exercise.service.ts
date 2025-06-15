import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExerciseCategory } from '../../models/exercise-category'; // Certifique-se de que o caminho está correto

@Injectable({
  providedIn: 'root'
})
export class CategoryExerciseService {
  private apiUrl = `${environment.apiUrl}/categoryExercise`;

  constructor( private http: HttpClient ) { }

  getAllCategories(): Observable<ExerciseCategory[]> {
    return this.http.get<ExerciseCategory[]>(`${this.apiUrl}/list`);
  }

  createCategory(category: ExerciseCategory): Observable<ExerciseCategory> {
    return this.http.post<ExerciseCategory>(`${this.apiUrl}/create`, category);
  }
}
