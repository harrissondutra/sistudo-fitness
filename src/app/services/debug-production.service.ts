import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DebugProductionService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  async debugTokenAndRequests() {
    console.log('🔍 INICIANDO DEBUG DETALHADO DE PRODUÇÃO');

    // 1. Verificar token
    const token = this.authService.getToken();
    console.log('🔐 Token Status:', {
      presente: !!token,
      tamanho: token?.length || 0,
      primeiros20: token?.substring(0, 20) + '...'
    });

    if (token) {
      try {
        // Decodificar JWT
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Date.now() / 1000;

        console.log('📋 JWT Payload:', {
          exp: new Date(payload.exp * 1000),
          iat: new Date(payload.iat * 1000),
          expirado: payload.exp < now,
          tempoRestante: Math.max(0, payload.exp - now),
          claims: payload
        });
      } catch (error) {
        console.error('❌ Erro ao decodificar JWT:', error);
      }
    }

    // 2. Testar requisição manual com fetch
    await this.testRawFetch();

    // 3. Testar com HttpClient Angular
    await this.testAngularHttp();

    // 4. Comparar com local
    this.compareEnvironments();
  }

  private async testRawFetch() {
    console.log('\n🚀 TESTE COM FETCH NATIVO');

    const token = this.authService.getToken();
    const baseUrl = environment.production
      ? 'https://api-sistudo-fitness-production.up.railway.app'
      : 'http://localhost:8080';

    try {
      const response = await fetch(`${baseUrl}/clients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': window.location.origin
        }
      });

      const headersObj: any = {};
      response.headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      console.log('📊 Resposta FETCH:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: headersObj
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro FETCH:', errorText);
      } else {
        const data = await response.json();
        console.log('✅ Dados FETCH:', data);
      }
    } catch (error) {
      console.error('❌ Erro na requisição FETCH:', error);
    }
  }

  private async testAngularHttp() {
    console.log('\n🅰️ TESTE COM ANGULAR HTTP');

    try {
      // Headers manuais para comparação
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      });

      const response = await this.http.get('/clients', {
        headers,
        observe: 'response'
      }).toPromise();

      console.log('✅ Resposta ANGULAR HTTP:', {
        status: response?.status,
        headers: response?.headers,
        body: response?.body
      });

    } catch (error: any) {
      console.error('❌ Erro ANGULAR HTTP:', {
        status: error.status,
        message: error.message,
        error: error.error,
        headers: error.headers
      });

      // Análise específica do erro 403
      if (error.status === 403) {
        this.analyze403Error(error);
      }
    }
  }

  private analyze403Error(error: HttpErrorResponse) {
    console.log('\n🚨 ANÁLISE DETALHADA DO ERRO 403');

    console.log('🔍 Detalhes do erro:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url,
      headers: error.headers?.keys()?.map(key => ({
        [key]: error.headers?.get(key)
      }))
    });

    // Verificar possíveis causas
    const possibleCauses = [];

    if (!this.authService.getToken()) {
      possibleCauses.push('❌ Token não encontrado');
    }

    if (error.headers?.get('Access-Control-Allow-Origin') === null) {
      possibleCauses.push('❌ CORS: Access-Control-Allow-Origin ausente');
    }

    if (error.error?.message?.includes('CORS')) {
      possibleCauses.push('❌ Erro específico de CORS');
    }

    if (error.error?.message?.includes('Unauthorized')) {
      possibleCauses.push('❌ Token inválido ou expirado no backend');
    }

    console.log('🎯 Possíveis causas:', possibleCauses);
  }

  private compareEnvironments() {
    console.log('\n📊 COMPARAÇÃO LOCAL vs PRODUÇÃO');

    const currentEnv = {
      production: environment.production,
      protocol: window.location.protocol,
      host: window.location.host,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      cors: environment.production ? 'REQUERIDO' : 'NÃO REQUERIDO'
    };

    console.log('🌍 Ambiente atual:', currentEnv);

    if (environment.production) {
      console.log('⚠️ PRODUÇÃO - Verificações necessárias:');
      console.log('1. CORS configurado no backend?');
      console.log('2. HTTPS certificado válido?');
      console.log('3. JWT secret igual ao local?');
      console.log('4. Railway configurado corretamente?');
      console.log('5. Headers de segurança configurados?');
    } else {
      console.log('✅ LOCAL - Ambiente de desenvolvimento');
    }
  }
}
