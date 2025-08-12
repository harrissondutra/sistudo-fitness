import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; // Importe HttpClient e HttpErrorResponse
import { Observable, throwError } from 'rxjs'; // Importe Observable e throwError de 'rxjs'
import { catchError } from 'rxjs/operators'; // Importe catchError de 'rxjs/operators'
import { Personal } from '../../models/personal'; // Ajuste o caminho para o seu modelo Personal
import { environment } from '../../../environments/environment';
import { Client } from '../../models/client';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  // **ATENÇÃO**: Substitua 'http://localhost:8080/api/personal' pela URL real da sua API de profissionais
  private baseUrl = `${environment.apiUrl}/personals`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { } // Injete o HttpClient no construtor

  /**
   * Obtém todos os profissionais.
   * @returns Um Observable que emite um array de Personal.
   */
  getAllPersonal(): Observable<Personal[]> {
    return this.http.get<Personal[]>(`${this.baseUrl}/listAll`).pipe(
      catchError(this.handleError) // Trata erros na requisição
    );
  }

  /**
   * Obtém um profissional pelo ID.
   * @param id O ID do profissional.
   * @returns Um Observable que emite o Personal encontrado.
   */
  getPersonalById(id: number): Observable<Personal> {
    return this.http.get<Personal>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cria um novo profissional.
   * @param personal Os dados do profissional a ser criado.
   * @returns Um Observable que emite o Personal criado.
   */
  createPersonal(personal: Personal): Observable<Personal> {
    return this.http.post<Personal>(this.baseUrl, personal).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Atualiza um profissional existente.
   * @param personal Os dados do profissional a ser atualizado (deve conter o ID).
   * @returns Um Observable que emite o Personal atualizado.
   */
  updatePersonal(personal: Personal): Observable<Personal> {
    // Certifique-se de que o ID está presente para a atualização
    if (personal.id === undefined || personal.id === null) {
      return throwError(() => new Error('ID do profissional é necessário para a atualização.'));
    }
    return this.http.put<Personal>(`${this.baseUrl}/${personal.id}`, personal).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Exclui um profissional pelo ID.
   * @param id O ID do profissional a ser excluído.
   * @returns Um Observable vazio após a exclusão bem-sucedida.
   */
  deletePersonal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Método privado para tratamento de erros de requisições HTTP.
   * @param error O objeto HttpErrorResponse.
   * @returns Um Observable de erro.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou de rede.
      errorMessage = `Erro do cliente: ${error.error.message}`;
    } else {
      // O backend retornou um código de resposta sem sucesso.
      // O corpo da resposta pode conter pistas sobre o que deu errado.
      errorMessage = `Erro do servidor - Código: ${error.status}, Mensagem: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = `Erro: ${error.error.message}`; // Mensagem de erro mais específica do backend
      }
    }
    console.error('PersonalService error:', errorMessage);
    // Retorna um Observable de erro para que o componente possa lidar com ele
    return throwError(() => new Error(errorMessage));
  }

  getPersonalByClientId(clientId: number): Observable<Personal[]> {
    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [PersonalService] getPersonalByClientId com headers manuais:', clientId);
    return this.http.get<Personal[]>(`${this.baseUrl}/getPersonalByClientId/${clientId}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getClientsByPersonalId(personalId: number): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/getClientsByPersonalId/${personalId}`).pipe(
      catchError(this.handleError)
    );
  }

  associatePersonalToClient(clientId: number, personalIds: number[]): Observable<Client> {
    // O endpoint correto conforme o controller backend é: /associatePersonal/{clientId}
    return this.http.post<Client>(`${this.baseUrl}/associatePersonal/${clientId}`, personalIds).pipe(
      catchError(this.handleError)
    );
  }

  disassociatePersonalsFromClient(clientId: number, personalIds: number[]): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/disassociatePersonal/${clientId}`, personalIds).pipe(
      catchError(this.handleError)
    );
  }
}
