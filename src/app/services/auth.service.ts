import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserRole } from '../models/user_role';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  /**
   * Realiza login no backend e retorna o Observable da resposta.
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { email, password });
  }

  /**
   * Solicita redefinição de senha - envia email com token de recuperação.
   */
  requestPasswordReset(email: string): Observable<any> {
    console.log('Enviando solicitação de redefinição de senha para:', email);
    return this.http.post<any>(`${this.baseUrl}/forgot-password`, { email }).pipe(
      map(response => {
        console.log('Resposta do backend (forgot-password):', response);
        return response;
      }),
      catchError(error => {
        console.error('Erro na requisição forgot-password:', error);
        console.log('URL chamada:', `${this.baseUrl}/forgot-password`);
        console.log('Dados enviados:', { email });
        
        // Se o backend retorna status 2xx mas com erro, trata como sucesso
        if (error.status >= 200 && error.status < 300) {
          console.log('Convertendo resposta de erro para sucesso devido ao status HTTP');
          return of(error.error || { success: true, message: 'E-mail enviado' });
        }
        
        throw error;
      })
    );
  }

  /**
   * Redefine a senha usando o token de recuperação.
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reset-password`, { token, newPassword });
  }

  /**
   * Valida se o token de redefinição de senha é válido.
   */
  validateResetToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/validate-reset-token`, { token });
  }

  /**
   * Salva o token JWT e informações do usuário no localStorage.
   */
  setToken(token: string, userInfo?: { email?: string, username?: string, role?: string }) {
    localStorage.setItem('token', token);
    
    // Extrai informações do token JWT incluindo o ID do usuário
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload completo do token JWT:', payload);
      
      // Busca por um ID numérico em vários campos possíveis
      let userId = null;
      
      // Lista de campos que podem conter o ID do usuário
      const possibleIdFields = ['id', 'userId', 'user_id', 'sub', 'jti', 'clientId', 'client_id'];
      
      for (const field of possibleIdFields) {
        if (payload[field] !== undefined) {
          const value = payload[field];
          // Verifica se é um número ou uma string que pode ser convertida para número
          if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
            userId = Number(value);
            console.log(`ID do usuário encontrado no campo '${field}':`, userId);
            break;
          } else {
            console.log(`Campo '${field}' não é numérico:`, value);
          }
        }
      }
      
      if (!userId) {
        console.warn('Nenhum ID numérico encontrado no token JWT. Campos disponíveis:', Object.keys(payload));
      }
      
      // Combina as informações fornecidas com as do token
      const combinedUserInfo = {
        ...userInfo,
        id: userId, // Usa o ID numérico encontrado ou null
        email: userInfo?.email || payload.email,
        username: userInfo?.username || payload.username || payload.name,
        role: userInfo?.role || payload.role
      };
      
      console.log('Informações do usuário salvas:', combinedUserInfo);
      localStorage.setItem('userInfo', JSON.stringify(combinedUserInfo));
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
      // Fallback - salva apenas as informações fornecidas
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
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
   * Alias para isAuthenticated - verifica se o usuário está logado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Recupera os dados completos do usuário, combinando informações do token e localStorage
   */
  getUserData(): any {
    // Primeiro tenta obter do localStorage que tem dados mais completos
    const storageData = this.getUserInfoFromStorage();

    // Depois obtém do token que é mais seguro para autenticação
    const tokenData = this.getUserInfo();

    // Combina os dados, priorizando o token para informações de segurança
    return {
      ...(storageData || {}),
      ...(tokenData || {}),
      // Garantir que o role seja um UserRole válido
      role: this.parseUserRole(storageData?.role || tokenData?.role)
    };
  }

  /**
   * Converte uma string em um UserRole válido
   */
  private parseUserRole(roleStr?: string): UserRole {
    if (!roleStr) return UserRole.CLIENT;

    // Verifica se o valor está entre os valores válidos do enum
    const validRoles = Object.values(UserRole);
    const normalizedRole = roleStr.toUpperCase() as UserRole;

    return validRoles.includes(normalizedRole)
      ? normalizedRole
      : UserRole.CLIENT;
  }

  /**
   * Verifica se o usuário autenticado possui o papel de admin.
   */
  isAdmin(): boolean {
    return this.getUserRole() === UserRole.ADMIN;
  }

  /**
   * Obtém o papel/função do usuário atual
   */
  getUserRole(): UserRole {
    // Verifica se o usuário está autenticado
    if (!this.isLoggedIn()) {
      return UserRole.CLIENT; // Valor padrão caso não esteja autenticado
    }

    // Obtém o role do usuário
    try {
      const userData = this.getUserData();
      return userData?.role || UserRole.CLIENT;
    } catch (error) {
      console.error('Erro ao obter role do usuário:', error);
      return UserRole.CLIENT;
    }
  }

  /**
   * Método auxiliar para depuração
   */
  logCurrentUserDetails(): void {
    console.log('Usuário atual:', this.getUserData());
    console.log('Role do usuário:', this.getUserRole());
    console.log('É administrador?', this.getUserRole() === UserRole.ADMIN);
  }
  getCurrentUser(): Observable<{ id: number } | null> {
    // Obtém dados do usuário do token ou localStorage
    const userData = this.getUserData();
    
    if (!userData) {
      return of(null);
    }

    // Verifica se existe ID no userData e se é numérico
    if (userData.id && (typeof userData.id === 'number' || !isNaN(Number(userData.id)))) {
      const numericId = Number(userData.id);
      console.log('ID obtido do userData:', numericId);
      return of({ id: numericId });
    }

    // Se não há ID válido no userData, tenta buscar do token JWT
    const tokenData = this.getUserInfo();
    if (tokenData) {
      // Lista de campos que podem conter o ID do usuário
      const possibleIdFields = ['id', 'userId', 'user_id', 'sub', 'jti', 'clientId', 'client_id'];
      
      for (const field of possibleIdFields) {
        if (tokenData[field] !== undefined) {
          const value = tokenData[field];
          // Verifica se é um número ou uma string que pode ser convertida para número
          if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
            const numericId = Number(value);
            console.log(`ID obtido do token campo '${field}':`, numericId);
            return of({ id: numericId });
          }
        }
      }
    }

    // Se ainda não conseguiu o ID, retorna null
    console.warn('ID do usuário não encontrado ou não é numérico');
    console.log('UserData:', userData);
    console.log('TokenData:', tokenData);
    return of(null);
  }

  // Método melhorado para obter o ID do usuário atual
  getCurrentUserId(): Observable<number | null> {
    return this.getCurrentUser().pipe(
      map(user => {
        if (user?.id) {
          console.log('ID do usuário obtido:', user.id);
          return user.id;
        }
        console.warn('ID do usuário não disponível');
        return null;
      }),
      catchError(error => {
        console.error('Erro ao obter ID do usuário:', error);
        return of(null);
      })
    );
  }

  // Debug completo do token JWT
  debugFullToken(): void {
    const token = this.getToken();
    if (!token) {
      console.log('🔍 DEBUG TOKEN: Nenhum token encontrado');
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('🔍 DEBUG TOKEN: Token inválido (não tem 3 partes)');
        return;
      }

      // Decodifica header
      const header = JSON.parse(atob(parts[0]));
      console.log('🔍 DEBUG TOKEN HEADER:', header);

      // Decodifica payload
      const payload = JSON.parse(atob(parts[1]));
      console.log('🔍 DEBUG TOKEN PAYLOAD COMPLETO:', payload);
      console.log('🔍 DEBUG TOKEN - Todas as chaves do payload:', Object.keys(payload));
      
      // Analisa cada campo em busca de ID numérico
      Object.keys(payload).forEach(key => {
        const value = payload[key];
        console.log(`🔍 DEBUG TOKEN - ${key}: ${value} (tipo: ${typeof value})`);
        
        if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)) && Number(value) > 0)) {
          console.log(`🔍 DEBUG TOKEN - ✅ POSSÍVEL ID NUMÉRICO em '${key}': ${value}`);
        }
      });

    } catch (error) {
      console.error('🔍 DEBUG TOKEN - Erro ao decodificar token:', error);
    }
  }

  // Método de debug para verificar dados do usuário
  debugUserData(): void {
    console.log('=== DEBUG AUTH SERVICE ===');
    console.log('Token:', this.getToken());
    console.log('UserInfo do localStorage:', this.getUserInfoFromStorage());
    console.log('UserInfo do token:', this.getUserInfo());
    console.log('UserData combinado:', this.getUserData());
    console.log('=========================');
  }
}
