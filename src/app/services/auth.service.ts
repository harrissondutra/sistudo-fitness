import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserRole } from '../models/user_role';

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
   * Salva o token JWT e informações do usuário no localStorage.
   */
  setToken(token: string, userInfo?: { email?: string, username?: string, role?: string }) {
    localStorage.setItem('token', token);
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  }

  /**
   * Recupera o token JWT do localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Recupera informações do usuário do localStorage.
   */
  getUserInfoFromStorage(): any {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Remove o token JWT e informações do usuário do localStorage e efetua logout.
   */
  logout() {
    console.warn('[AuthService] Logout chamado');
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
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
    return this.getUserRole() === UserRole.ADMIN;
  }

  getUserRole(): UserRole {
  // Trocar 'user' por 'userInfo'
  const userStr = localStorage.getItem('userInfo');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.role || UserRole.CLIENT;
    } catch (e) {
      console.error('Erro ao obter role do usuário:', e);
    }
  }

  return UserRole.CLIENT;
}
}
