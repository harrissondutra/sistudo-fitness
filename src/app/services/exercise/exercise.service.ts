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
    return this.http.get<Exercise[]>(`${this.apiUrl}/list`);
  }

  getExercises(): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(this.apiUrl);
  }

  deleteExercise(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  createExercise(exercise: Exercise): Observable<Exercise> {
    return this.http.post<Exercise>(`${this.apiUrl}/create`, exercise);
  }
}
