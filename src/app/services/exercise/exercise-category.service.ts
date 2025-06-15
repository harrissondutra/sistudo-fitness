import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExerciseCategory } from '../../models/exercise'; // ajuste o caminho se necessário

@Injectable({
  providedIn: 'root'
})
export class ExerciseCategoryService {

  private apiUrl = `${environment.apiUrl}/categoryExercise`;

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<ExerciseCategory[]> {
    return this.http.get<ExerciseCategory[]>(`${this.apiUrl}/list`);
  }
}
