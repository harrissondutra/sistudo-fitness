import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
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

  // Configurações de sessão
  private readonly DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos como fallback
  private sessionTimer: any;

  constructor(private http: HttpClient) {
    // Inicializa timer de sessão se há um token válido
    if (this.isAuthenticated()) {
      this.startSessionTimer();
    }

    // Detecta fechamento do browser para logout automático
    window.addEventListener('beforeunload', () => {
      this.clearSessionTimer();
    });
  }

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
   * Backend espera @RequestParam, então enviamos como query parameters
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('newPassword', newPassword);

    return this.http.post<any>(`${this.baseUrl}/reset-password`, null, { params });
  }

  /**
   * Valida se o token de redefinição de senha é válido.
   * Backend usa @GetMapping com @RequestParam
   */
  validateResetToken(token: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.get<any>(`${this.baseUrl}/validate-reset-token`, { params });
  }

  /**
   * Salva o token JWT e informações do usuário no sessionStorage (não persiste após fechar browser).
   */
  setToken(token: string, userInfo?: { id?: number, email?: string, username?: string, role?: string }) {
    // Usa sessionStorage em vez de localStorage para não persistir após fechar browser
    sessionStorage.setItem('token', token);

    // Salva timestamp da última atividade
    const currentTime = Date.now();
    sessionStorage.setItem('lastActivity', currentTime.toString());

    // Log detalhado para debug em produção
    console.log('[AuthService] Token salvo:', {
      tamanho: token.length,
      primeiros20: token.substring(0, 20) + '...',
      sessionStorage: !!sessionStorage.getItem('token'),
      timestamp: currentTime
    });

    // Extrai informações do token JWT incluindo o ID do usuário
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload completo do token JWT:', payload);

      // PRIORIDADE: Dados diretos da resposta > JWT payload
      let userId = userInfo?.id; // ID direto da resposta tem prioridade

      // Se não tiver ID direto, busca no JWT
      if (!userId) {
        const possibleIdFields = ['userId', 'id', 'user_id', 'sub', 'jti', 'clientId', 'client_id'];

        for (const field of possibleIdFields) {
          if (payload[field] !== undefined) {
            const value = payload[field];
            if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
              userId = Number(value);
              console.log(`ID do usuário encontrado no JWT campo '${field}':`, userId);
              break;
            }
          }
        }
      } else {
        console.log('ID do usuário obtido diretamente da resposta:', userId);
      }

      // FALLBACK: Se sub é "Admin", usar ID 1 (administrador principal)
      if (!userId && payload.sub === 'Admin') {
        userId = 1;
        console.log('Usando ID 1 para usuário Admin (fallback)');
      }

      if (!userId) {
        console.warn('Nenhum ID numérico encontrado. Dados disponíveis:', {userInfo, payload: Object.keys(payload)});
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
      sessionStorage.setItem('userInfo', JSON.stringify(combinedUserInfo));
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
      // Fallback - salva apenas as informações fornecidas
      if (userInfo) {
        sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
    }

    // Inicia o timer de sessão
    this.startSessionTimer();
  }

  /**
   * Inicia o timer de sessão que verifica atividade do usuário
   */
  private startSessionTimer(): void {
    this.clearSessionTimer();

    // Calcula o intervalo de verificação baseado no timeout da sessão
    const sessionTimeout = this.getSessionTimeout();
    // Verifica a cada 1/10 do tempo de timeout, mas no mínimo a cada minuto e no máximo a cada 5 minutos
    const checkInterval = Math.max(60000, Math.min(300000, Math.floor(sessionTimeout / 10)));

    console.log(`Timer de sessão iniciado - Timeout: ${Math.floor(sessionTimeout / 60000)} min, Verificação a cada: ${Math.floor(checkInterval / 1000)} seg`);

    this.sessionTimer = setInterval(() => {
      this.checkSessionTimeout();
    }, checkInterval);
  }

  /**
   * Limpa o timer de sessão
   */
  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Calcula o timeout da sessão baseado no tempo de expiração do token JWT
   */
  private getSessionTimeout(): number {
    const token = this.getToken();
    if (!token) {
      return this.DEFAULT_SESSION_TIMEOUT;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (payload.exp) {
        // exp é em segundos desde epoch, converte para milliseconds
        const tokenExpirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = tokenExpirationTime - currentTime;

        // Se o token já expirou ou expira em menos de 1 minuto, usa timeout padrão
        if (timeUntilExpiration <= 60000) {
          console.warn('Token expira em menos de 1 minuto, usando timeout padrão');
          return this.DEFAULT_SESSION_TIMEOUT;
        }

        // Usa 90% do tempo restante do token como timeout da sessão
        const sessionTimeout = Math.floor(timeUntilExpiration * 0.9);
        console.log(`Timeout da sessão calculado baseado no token: ${sessionTimeout}ms (${Math.floor(sessionTimeout / 60000)} minutos)`);

        return sessionTimeout;
      }
    } catch (error) {
      console.error('Erro ao calcular timeout da sessão baseado no token:', error);
    }

    // Fallback para valor padrão
    return this.DEFAULT_SESSION_TIMEOUT;
  }

  /**
   * Verifica se o token está próximo da expiração e ajusta o timer se necessário
   */
  private checkTokenExpiration(): void {
    const token = this.getToken();
    if (!token) {
      this.logout();
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (payload.exp) {
        const tokenExpirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = tokenExpirationTime - currentTime;

        // Se o token expira em menos de 2 minutos, faz logout
        if (timeUntilExpiration <= 120000) {
          console.warn('Token expirando em menos de 2 minutos, fazendo logout');
          this.logout();
          window.location.href = '/login';
          return;
        }

        // Se o token expira em menos de 5 minutos, reinicia o timer com verificação mais frequente
        if (timeUntilExpiration <= 300000) {
          console.warn('Token expirando em menos de 5 minutos, aumentando frequência de verificação');
          this.startSessionTimer();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar expiração do token:', error);
    }
  }

  /**
   * Verifica se a sessão expirou por inatividade
   */
  private checkSessionTimeout(): void {
    // Primeiro verifica se o token ainda é válido
    this.checkTokenExpiration();

    const lastActivity = sessionStorage.getItem('lastActivity');
    if (!lastActivity) {
      this.logout();
      return;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const currentTime = Date.now();
    const timeDiff = currentTime - lastActivityTime;
    const sessionTimeout = this.getSessionTimeout();

    if (timeDiff > sessionTimeout) {
      console.warn('Sessão expirada por inatividade');
      this.logout();
      // Aqui você pode redirecionar para login ou mostrar uma mensagem
      window.location.href = '/login';
    }
  }

  /**
   * Atualiza o timestamp da última atividade do usuário
   */
  public updateLastActivity(): void {
    const currentTime = Date.now();
    sessionStorage.setItem('lastActivity', currentTime.toString());
  }

  /**
   * Obtém informações sobre o tempo de sessão baseado no token JWT
   */
  public getSessionInfo(): { timeoutMinutes: number, tokenExpiresIn: number, isTokenExpiringSoon: boolean } {
    const token = this.getToken();
    const sessionTimeout = this.getSessionTimeout();

    let tokenExpiresIn = 0;
    let isTokenExpiringSoon = false;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp) {
          const tokenExpirationTime = payload.exp * 1000;
          const currentTime = Date.now();
          tokenExpiresIn = Math.max(0, tokenExpirationTime - currentTime);
          isTokenExpiringSoon = tokenExpiresIn <= 300000; // Menos de 5 minutos
        }
      } catch (error) {
        console.error('Erro ao obter informações do token:', error);
      }
    }

    return {
      timeoutMinutes: Math.floor(sessionTimeout / 60000),
      tokenExpiresIn: Math.floor(tokenExpiresIn / 1000), // em segundos
      isTokenExpiringSoon
    };
  }

  /**
   * Recupera o token JWT do sessionStorage.
   */
  getToken(): string | null {
    const token = sessionStorage.getItem('token');

    // Debug adicional para produção
    if (token) {
      const isExpired = this.isTokenExpired(token);
      if (isExpired) {
        console.warn('[AuthService] Token expirado, fazendo logout automático');
        this.logout();
        return null;
      }
    } else {
      console.log('[AuthService] Nenhum token encontrado no sessionStorage');
    }

    return token;
  }

  /**
   * 🚨 MÉTODO DE EMERGÊNCIA: Cria headers com Authorization manual
   * Usado quando interceptors não funcionam
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    console.log('[AuthService] 🚨 CRIANDO HEADERS MANUAIS - Token presente:', !!token);

    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    }

    console.warn('[AuthService] 🚨 SEM TOKEN - Headers sem autorização');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  /**
   * Recupera informações do usuário do sessionStorage.
   */
  getUserInfoFromStorage(): any {
    const userInfo = sessionStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Remove o token JWT e informações do usuário do sessionStorage e efetua logout.
   */
  logout() {
    console.warn('[AuthService] Logout chamado');

    // Limpa dados da sessão
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('lastActivity');

    // Limpa timer de sessão
    this.clearSessionTimer();
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
   * Método de diagnóstico para problemas de autenticação em produção
   */
  diagnoseAuthenticationIssues(): void {
    console.log('=== DIAGNÓSTICO DE AUTENTICAÇÃO ===');

    const token = sessionStorage.getItem('token');
    const userInfo = sessionStorage.getItem('userInfo');
    const lastActivity = sessionStorage.getItem('lastActivity');

    console.log('1. Token no sessionStorage:', {
      presente: !!token,
      tamanho: token?.length || 0,
      primeiros20: token ? token.substring(0, 20) + '...' : 'N/A'
    });

    console.log('2. UserInfo no sessionStorage:', {
      presente: !!userInfo,
      conteudo: userInfo ? JSON.parse(userInfo) : 'N/A'
    });

    console.log('3. Última atividade:', {
      presente: !!lastActivity,
      timestamp: lastActivity ? new Date(parseInt(lastActivity)).toISOString() : 'N/A'
    });

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp && payload.exp < now;

        console.log('4. Análise do token:', {
          exp: payload.exp,
          agora: now,
          expirado: isExpired,
          tempoRestante: payload.exp ? `${Math.floor((payload.exp - now) / 60)} minutos` : 'N/A',
          payload: payload
        });
      } catch (error) {
        console.error('4. Erro ao analisar token:', error);
      }
    }

    console.log('5. Estado da autenticação:', {
      isAuthenticated: this.isAuthenticated(),
      isLoggedIn: this.isLoggedIn()
    });

    console.log('=== FIM DO DIAGNÓSTICO ===');
  }

  /**
   * Recupera os dados completos do usuário, combinando informações do token e sessionStorage
   */
  getUserData(): any {
    // Primeiro tenta obter do sessionStorage que tem dados mais completos
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
    const sessionInfo = this.getSessionInfo();

    console.log('=== DEBUG AUTH SERVICE ===');
    console.log('Token:', this.getToken());
    console.log('UserInfo do sessionStorage:', this.getUserInfoFromStorage());
    console.log('UserInfo do token:', this.getUserInfo());
    console.log('UserData combinado:', this.getUserData());
    console.log('Última atividade:', sessionStorage.getItem('lastActivity'));
    console.log('Timeout da sessão (min):', sessionInfo.timeoutMinutes);
    console.log('Token expira em (seg):', sessionInfo.tokenExpiresIn);
    console.log('Token expirando em breve:', sessionInfo.isTokenExpiringSoon);
    console.log('=========================');
  }
}
