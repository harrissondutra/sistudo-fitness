import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Retorna todos os usuários do sistema.
   */
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getById/${id}`);
  }

  /**
   * Cria um novo usuário.
   */
  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}`, user);
  }

  /**
   * Atualiza um usuário existente.
   */
  updateUser(id: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update/${id}`, user);
  }

  /**
   * Exclui um usuário pelo ID.
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
