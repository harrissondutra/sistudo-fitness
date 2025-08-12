import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductionDiagnosticsService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Executa um diagnóstico completo das diferenças entre local e produção
   */
  async runFullDiagnostics() {
    console.log('🔍 === DIAGNÓSTICO LOCAL vs PRODUÇÃO ===');

    // 1. Informações do ambiente
    this.logEnvironmentInfo();

    // 2. Teste de conectividade
    await this.testConnectivity();

    // 3. Teste de headers
    await this.testHeaders();

    // 4. Teste de CORS
    await this.testCors();

    // 5. Teste de autenticação
    await this.testAuthentication();

    console.log('✅ === FIM DO DIAGNÓSTICO ===');
  }

  private logEnvironmentInfo() {
    console.log('🌍 [AMBIENTE]', {
      production: environment.production,
      apiUrl: environment.apiUrl,
      protocol: environment.apiUrl.startsWith('https') ? 'HTTPS' : 'HTTP',
      domain: new URL(environment.apiUrl).hostname,
      port: new URL(environment.apiUrl).port || (environment.apiUrl.startsWith('https') ? '443' : '80'),
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    });
  }

  private async testConnectivity() {
    console.log('🌐 [CONECTIVIDADE] Testando...');

    try {
      const start = Date.now();
      const response = await fetch(environment.apiUrl, {
        method: 'OPTIONS',
        mode: 'cors'
      });
      const end = Date.now();

      const responseHeaders: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      console.log('✅ [CONECTIVIDADE] Sucesso:', {
        status: response.status,
        tempo: `${end - start}ms`,
        headers: responseHeaders
      });
    } catch (error) {
      console.error('❌ [CONECTIVIDADE] Erro:', error);
    }
  }

  private async testHeaders() {
    console.log('📋 [HEADERS] Testando...');

    const token = this.authService.getToken();
    const testHeaders: { [key: string]: string } = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': window.location.origin
    };

    if (token) {
      testHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${environment.apiUrl}/clients`, {
        method: 'GET',
        headers: testHeaders,
        mode: 'cors',
        credentials: 'omit'
      });

      const responseHeaders: { [key: string]: string } = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      console.log('📋 [HEADERS] Resposta:', {
        status: response.status,
        statusText: response.statusText,
        headersEnviados: testHeaders,
        headersRecebidos: responseHeaders
      });

      if (!response.ok) {
        const text = await response.text();
        console.log('📋 [HEADERS] Corpo da resposta:', text);
      }

    } catch (error) {
      console.error('❌ [HEADERS] Erro:', error);
    }
  }

  private async testCors() {
    console.log('🔒 [CORS] Testando...');

    // Teste simples de CORS
    try {
      const response = await fetch(`${environment.apiUrl}/health`, {
        method: 'GET',
        mode: 'cors'
      });

      console.log('✅ [CORS] Teste básico passou:', response.status);
    } catch (error) {
      console.error('❌ [CORS] Erro básico:', error);
    }

    // Teste de preflight
    try {
      const response = await fetch(`${environment.apiUrl}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({})
      });

      console.log('🔒 [CORS] Teste preflight:', response.status);
    } catch (error) {
      console.error('❌ [CORS] Erro preflight:', error);
    }
  }

  private async testAuthentication() {
    console.log('🔐 [AUTH] Testando autenticação...');

    const token = this.authService.getToken();

    if (!token) {
      console.warn('⚠️ [AUTH] Nenhum token encontrado');
      return;
    }

    // Analisa o token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);

      console.log('🔐 [AUTH] Análise do token:', {
        valido: !this.authService.isTokenExpired(token),
        exp: new Date(payload.exp * 1000).toISOString(),
        iat: new Date(payload.iat * 1000).toISOString(),
        tempoRestante: `${Math.floor((payload.exp - now) / 60)} minutos`,
        payload: payload
      });
    } catch (error) {
      console.error('❌ [AUTH] Erro ao analisar token:', error);
    }

    // Teste de endpoint autenticado
    try {
      const response = await this.http.get(`${environment.apiUrl}/clients`).toPromise();
      console.log('✅ [AUTH] Endpoint autenticado funcionando');
    } catch (error) {
      console.error('❌ [AUTH] Erro em endpoint autenticado:', error);
    }
  }

  /**
   * Compara diferenças específicas entre local e produção
   */
  compareLocalVsProduction() {
    console.log('⚖️ [COMPARAÇÃO] Local vs Produção:');

    const differences = {
      protocol: {
        local: 'HTTP',
        production: 'HTTPS',
        impact: 'Headers de segurança diferentes'
      },
      cors: {
        local: 'Não aplicável (mesmo origin)',
        production: 'Obrigatório (cross-origin)',
        impact: 'Headers CORS necessários'
      },
      security: {
        local: 'Relaxada',
        production: 'Rigorosa',
        impact: 'Validações adicionais'
      },
      infrastructure: {
        local: 'Desenvolvimento',
        production: 'Railway (proxy/load balancer)',
        impact: 'Headers podem ser modificados'
      }
    };

    console.table(differences);
  }
}
