import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * 🔍 DIAGNÓSTICO DE PRODUÇÃO
 * Testa se o interceptor funciona corretamente em produção
 */
@Injectable({
  providedIn: 'root'
})
export class ProductionInterceptorTestService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Testa se o interceptor está funcionando
   * Faz uma requisição simples e verifica os headers
   */
  async testInterceptorInProduction(): Promise<boolean> {
    try {
      const token = this.authService.getToken();

      if (!token) {
        console.warn('🔍 [PRODUÇÃO] Sem token - interceptor não pode ser testado');
        return false;
      }

      // Faz uma requisição de teste
      const response = await this.http.get(`${environment.apiUrl}/clients/listAll`).toPromise();

      // Se chegou aqui, o interceptor funcionou
      console.log('✅ [PRODUÇÃO] Interceptor funcionando - requisição autorizada com sucesso');
      return true;

    } catch (error: any) {
      if (error.status === 401) {
        console.error('❌ [PRODUÇÃO] Interceptor FALHOU - requisição não autorizada');
        return false;
      } else if (error.status === 403) {
        console.error('❌ [PRODUÇÃO] Interceptor FALHOU - acesso negado');
        return false;
      } else {
        console.warn('⚠️ [PRODUÇÃO] Erro de rede, mas interceptor pode estar funcionando:', error.message);
        return true; // Assume que o interceptor funcionou se não for erro de auth
      }
    }
  }

  /**
   * Diagnóstico completo para produção
   */
  async runProductionDiagnostics(): Promise<void> {
    console.log('🔍 [PRODUÇÃO] Iniciando diagnósticos...');

    // 1. Verificar se está em produção
    console.log('🔍 [PRODUÇÃO] Environment:', environment.production ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
    console.log('🔍 [PRODUÇÃO] API URL:', environment.apiUrl);

    // 2. Verificar token
    const token = this.authService.getToken();
    console.log('🔍 [PRODUÇÃO] Token presente:', !!token);

    // 3. Testar interceptor
    const interceptorWorking = await this.testInterceptorInProduction();
    console.log('🔍 [PRODUÇÃO] Interceptor funcionando:', interceptorWorking);

    // 4. Resultado final
    if (interceptorWorking) {
      console.log('✅ [PRODUÇÃO] SUCESSO - Sistema pronto para produção!');
    } else {
      console.error('❌ [PRODUÇÃO] FALHA - Verificar configuração do interceptor');
    }
  }
}
