import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Retorna todos os usuários do sistema.
   */
  getAllUsers(): Observable<any[]> {
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [UserService] getAllUsers com headers manuais');
    return this.http.get<any[]>(`${this.baseUrl}`, { headers });
  }

  getUserById(id: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [UserService] getUserById com headers manuais:', id);
    return this.http.get<any>(`${this.baseUrl}/getById/${id}`, { headers });
  }

  /**
   * Cria um novo usuário.
   */
  createUser(user: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [UserService] createUser com headers manuais');
    return this.http.post<any>(`${this.baseUrl}`, user, { headers });
  }

  /**
   * Atualiza um usuário existente.
   */
  updateUser(id: number, user: any): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [UserService] updateUser com headers manuais:', id);
    return this.http.put<any>(`${this.baseUrl}/update/${id}`, user, { headers });
  }

  /**
   * Exclui um usuário pelo ID.
   */
  deleteUser(id: number): Observable<void> {
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [UserService] deleteUser com headers manuais:', id);
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }
}
