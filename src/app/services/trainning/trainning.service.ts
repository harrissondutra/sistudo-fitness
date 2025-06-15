import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trainning } from '../../models/trainning'; // Ajuste o caminho para o seu modelo Trainning
import { environment } from '../../../environments/environment'; // Ajuste o caminho para o seu environment


@Injectable({
  providedIn: 'root'
})
export class TrainningService {
private baseUrl = `${environment.apiUrl}/trainning`; // Exemplo: assumindo que o endpoint base para medidas é /measure

  constructor(private http: HttpClient) { }


  getTrainningByUserId(userId: number): Observable<Trainning> {
    return this.http.get<Trainning>(`${this.baseUrl}/trainningByUserId/${userId}`);
  }

  getTrainningById(id: number): Observable<Trainning> {
    return this.http.get<Trainning>(`${this.baseUrl}/getById/${id}`);
  }

  getTrainningByName(name: string): Observable<Trainning[]> {
    return this.http.get<Trainning[]>(`${this.baseUrl}/getByTrainningName/${name}`);
  }
  createTrainning(trainning: Trainning): Observable<Trainning> {
    return this.http.post<Trainning>(`${this.baseUrl}/create`, trainning);
  }
  createTrainningByUserId(userId: number, trainning: Trainning): Observable<Trainning> {
    return this.http.post<Trainning>(`${this.baseUrl}/create/${userId}`, trainning);
  }

  listAllTrainnings(): Observable<Trainning[]> {
    return this.http.get<Trainning[]>(`${this.baseUrl}/listAll`);
  }

  deleteTrainning(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

}
