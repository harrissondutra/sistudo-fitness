import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trainning } from '../../models/trainning'; // <--- Mantenha 'Trainning' (com 'a') se o seu modelo em models/trainning.ts ainda for assim
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainningService { // <--- Mantenha o nome da classe 'TrainingService' (com 'i') no frontend

  // BASE URL DO BACKEND: DEVE SER '/trainning' (com 'a' e singular)
  private baseUrl = `${environment.apiUrl}/trainning`; // <--- AJUSTADO AQUI para 'trainning'

  constructor(private http: HttpClient) { }

  // 1. getTrainningByClientId: Rota do backend é "/trainningByClientId/{clientId}"
  getTrainningByClientId(clientId: number): Observable<Trainning[]> { // <--- Renomeado 'userId' para 'clientId' no parâmetro
    return this.http.get<Trainning[]>(`${this.baseUrl}/trainningByClientId/${clientId}`); // <--- AJUSTADO ROTA
  }

  // 2. getTrainningById: Rota do backend é "/getById/{id}"
  getTrainningById(id: number): Observable<Trainning> {
    return this.http.get<Trainning>(`${this.baseUrl}/getById/${id}`);
  }

  // 3. getTrainningByName: Rota do backend é "/getByTrainningName/{name}"
  getTrainningByName(name: string): Observable<Trainning> {
    return this.http.get<Trainning>(`${this.baseUrl}/getByTrainningName/${name}`);
  }

  // 4. createTrainning: Rota do backend é "/create"
  createTrainning(trainning: Trainning): Observable<Trainning> {
    return this.http.post<Trainning>(`${this.baseUrl}/create`, trainning);
  }

  // 5. createTrainningByClientId: Rota do backend é "/createByClientId/{clientId}"
  createTrainningByClientId(clientId: number, trainning: Trainning): Observable<Trainning> { // <--- Renomeado 'userId' para 'clientId' no parâmetro
    return this.http.post<Trainning>(`${this.baseUrl}/createByClientId/${clientId}`, trainning);
  }

  // 6. listAllTrainnings: Rota do backend é "/listAll"
  listAllTrainnings(): Observable<Trainning[]> { // <--- Mantido o nome do método com 'nn' para consistência com a URL
    return this.http.get<Trainning[]>(`${this.baseUrl}/listAll`);
  }

  // 7. listAllActiveTrainnings: Rota do backend é "/listAllActive"
  listAllActiveTrainnings(): Observable<Trainning[]> { // <--- Renomeado para consistência com o backend
    return this.http.get<Trainning[]>(`${this.baseUrl}/listAllActive`);
  }

  // 8. listAllTrainningsInactive: Rota do backend é "/listAllTrainningsInactive"
  listAllTrainningsInactive(): Observable<Trainning[]> { // <--- Renomeado para 'Trainnings' (plural com 'nn') e 'Inactive'
    return this.http.get<Trainning[]>(`${this.baseUrl}/listAllTrainningsInactive`);
  }

  // 9. deleteTrainning: Rota do backend é "/delete/{id}"
  deleteTrainning(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  // 10. updateTrainning: O backend FORNECIDO NÃO TEM um endpoint @PutMapping para "/update/{id}"
  // Se você tiver este método no frontend, mas não no backend, ele causará um 404 ou 405.
  // Você precisará adicionar um @PutMapping no seu TranningController do Spring Boot para isso.
  updateTrainning(id: number, trainning: Trainning): Observable<Trainning> {
    // ESTA ROTA PODE PRECISAR DE AJUSTE NO BACKEND
    return this.http.put<Trainning>(`${this.baseUrl}/update/${id}`, trainning);
  }

}
