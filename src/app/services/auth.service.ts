import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Realiza login no backend e retorna o Observable da resposta.
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password });
  }

  /**
   * Salva o token JWT no localStorage.
   */
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  /**
   * Recupera o token JWT do localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Remove o token JWT do localStorage e efetua logout.
   */
  logout() {
    console.warn('[AuthService] Logout chamado');
    localStorage.removeItem('token');
  }

  /**
   * Decodifica o token JWT e retorna o payload (dados do usuário).
   */
  getUserInfo(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  /**
   * Verifica se o token JWT está expirado.
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < now;
    } catch {
      return true;
    }
  }

  /**
   * Verifica se o usuário está autenticado (token válido e não expirado).
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  /**
   * Verifica se o usuário autenticado possui o papel de admin.
   */
  isAdmin(): boolean {
    const user = this.getUserInfo();
    return user?.role === 'ROLE_ADMIN' || user?.roles?.includes?.('ROLE_ADMIN');
  }
}
