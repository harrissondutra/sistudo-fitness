import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Client } from '../../models/client';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { Nutritionist } from '../../models/nutritionist';

@Injectable({
  providedIn: 'root'
})
export class NutritionistService {

  private baseUrl = `${environment.apiUrl}/nutritionists`;

  constructor(private http: HttpClient) { }

  getAllNutritionists(): Observable<Nutritionist[]> {
    console.log('Chamando endpoint:', `${this.baseUrl}/listAll`);
    return this.http.get<Nutritionist[]>(`${this.baseUrl}/listAll`).pipe(
      tap(response => console.log('Resposta da API:', response)),
      catchError(error => {
        console.error('Erro na API:', error);
        return throwError(() => error);
      })
    );
  }

  getNutritionistById(id: string): Observable<Nutritionist> {
    return this.http.get<Nutritionist>(`${this.baseUrl}/getNutritionistById/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createNutritionist(nutritionist: Nutritionist): Observable<Nutritionist> {
    return this.http.post<Nutritionist>(`${this.baseUrl}/create`, nutritionist).pipe(
      catchError(this.handleError)
    );
  }
  updateNutritionist(nutritionist: Nutritionist): Observable<Nutritionist> {
    return this.http.put<Nutritionist>(`${this.baseUrl}/update/${nutritionist.id}`, nutritionist).pipe(
      catchError(this.handleError)
    );
  }
  deleteNutritionist(id: string) {
    return this.http.delete<any>(`${this.baseUrl}/delete/${id}`);
  }
  getNutritionistByClientId(clientId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/getNutritionistByClientId/${clientId}`).pipe(
      tap(response => console.log('Nutricionistas do cliente recebidos:', response)),
      catchError(error => {
        if (error.status === 404) {
          console.log(`Nenhum nutricionista associado ao cliente ${clientId}`);
          return of([]); // Retorna array vazio em vez de propagar o erro
        }
        console.error('Erro ao carregar nutricionistas:', error);
        return throwError(() => error);
      })
    );
  }
  associateNutritionistToClient(clientId: number, nutritionistIds: number[]): Observable<Client> {
    console.log(`Associando nutricionistas ${nutritionistIds} ao cliente ${clientId}`);

    // Garantir que não existam IDs inválidos no array
    const validIds = nutritionistIds.filter(id => id > 0);

    if (validIds.length === 0) {
      return throwError(() => new Error('Nenhum ID de nutricionista válido fornecido'));
    }

    return this.http.post<Client>(`${this.baseUrl}/associateNutritionist/${clientId}`, validIds).pipe(
      tap(response => console.log('Nutricionistas associados com sucesso:', response)),
      catchError(error => {
        console.error('Erro ao associar nutricionistas:', error);
        return throwError(() => error);
      })
    );
  }
  handleError(error: any) {
    // You can customize error handling here
    return throwError(() => error);
  }

  disassociateNutritionistsFromClient(clientId: number, nutritionistIds: number[]): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/disassociateNutritionist/${clientId}`, nutritionistIds).pipe(
      catchError(this.handleError)
    );
  }
}
