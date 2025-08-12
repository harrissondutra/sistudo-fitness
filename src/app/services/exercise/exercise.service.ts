import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise } from '../../models/exercise';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  private apiUrl = `${environment.apiUrl}/exercises`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  getAllExercises(): Observable<Exercise[]> {
    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [ExerciseService] getAllExercises com headers manuais');
    return this.http.get<Exercise[]>(`${this.apiUrl}/list`, { headers });
  }

  getExercises(): Observable<Exercise[]> {
    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [ExerciseService] getExercises com headers manuais');
    return this.http.get<Exercise[]>(this.apiUrl, { headers });
  }

  deleteExercise(id: string): Observable<void> {
    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [ExerciseService] deleteExercise com headers manuais:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  createExercise(exercise: Exercise): Observable<Exercise> {
    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [ExerciseService] createExercise com headers manuais');
    return this.http.post<Exercise>(`${this.apiUrl}/create`, exercise, { headers });
  }
}
