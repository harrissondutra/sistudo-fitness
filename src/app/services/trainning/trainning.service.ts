import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trainning } from '../../models/trainning'; // Ajuste o caminho para o seu modelo Trainning
import { environment } from '../../../environments/environment'; // Ajuste o caminho para o seu environment


@Injectable({
  providedIn: 'root'
})
export class TrainningService {
  private baseUrl = `${environment.apiUrl}/tranning`; // Corrigido para 'tranning' (um 'n') conforme o backend

  constructor(private http: HttpClient) { }

  // CORRIGIDO: Agora espera Observable<Trainning[]>
  getTrainningByUserId(userId: number): Observable<Trainning[]> {
    return this.http.get<Trainning[]>(`${this.baseUrl}/trainningByUserId/${userId}`);
  }

  getTrainningById(id: number): Observable<Trainning> {
    return this.http.get<Trainning>(`${this.baseUrl}/getById/${id}`);
  }

  // CORRIGIDO: Agora espera Observable<Trainning> (um único objeto)
  getTrainningByName(name: string): Observable<Trainning> {
    return this.http.get<Trainning>(`${this.baseUrl}/getByTrainningName/${name}`);
  }

  createTrainning(trainning: Trainning): Observable<Trainning> {
    return this.http.post<Trainning>(`${this.baseUrl}/create`, trainning);
  }

  // CORRIGIDO: Endpoint ajustado para "/createByUserId/{userId}"
  createTrainningByUserId(userId: number, trainning: Trainning): Observable<Trainning> {
    return this.http.post<Trainning>(`${this.baseUrl}/createByUserId/${userId}`, trainning);
  }

  listAllTrainnings(): Observable<Trainning[]> {
    return this.http.get<Trainning[]>(`${this.baseUrl}/listAll`);
  }

  deleteTrainning(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

}
