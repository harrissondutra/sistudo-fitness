import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client/client.service';
import { JsonPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-debug-interceptor',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div style="padding: 20px; background: #f5f5f5; margin: 20px; border-radius: 8px;">
      <h3>🔍 DEBUG INTERCEPTOR TEST</h3>
      <button (click)="testManual()" style="margin: 5px; padding: 10px;">
        ⚡ Teste Manual (fetch)
      </button>
      <button (click)="testAngular()" style="margin: 5px; padding: 10px;">
        🅰️ Teste Angular (HttpClient)
      </button>
      <button (click)="testClientService()" style="margin: 5px; padding: 10px;">
        🎯 Teste via ClientService
      </button>
      <button (click)="checkToken()" style="margin: 5px; padding: 10px;">
        🔐 Verificar Token
      </button>
      <pre>{{ debugInfo | json }}</pre>
    </div>
  `
})
export class DebugInterceptorComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private clientService = inject(ClientService);

  debugInfo: any = {};  checkToken() {
    const token = this.authService.getToken();
    this.debugInfo = {
      timestamp: new Date().toISOString(),
      token: {
        exists: !!token,
        length: token?.length || 0,
        preview: token ? token.substring(0, 30) + '...' : 'N/A'
      },
      sessionStorage: {
        token: !!sessionStorage.getItem('token'),
        userInfo: !!sessionStorage.getItem('userInfo')
      }
    };
    console.log('🔐 [DEBUG] Token check:', this.debugInfo);
  }

  testManual() {
    console.log('🧪 [DEBUG] Iniciando teste manual com fetch...');
    const token = sessionStorage.getItem('token');

    fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(r => {
      console.log('✅ [DEBUG] Teste manual - Status:', r.status);
      this.debugInfo = {
        ...this.debugInfo,
        manual: {
          status: r.status,
          ok: r.ok,
          timestamp: new Date().toISOString()
        }
      };
    })
    .catch(error => {
      console.error('❌ [DEBUG] Teste manual - Erro:', error);
      this.debugInfo = {
        ...this.debugInfo,
        manual: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      };
    });
  }

  testAngular() {
    console.log('🅰️ [DEBUG] Iniciando teste com Angular HttpClient...');
    console.log('🌍 [DEBUG] Environment:', environment);

    // Teste com URL do environment (como os services fazem)
    const url = `${environment.apiUrl}/clients/listAll`;
    console.log('🔗 [DEBUG] URL construída:', url);

    this.http.get(url)
      .subscribe({
        next: (response) => {
          console.log('✅ [DEBUG] Teste Angular - Sucesso:', response);
          this.debugInfo = {
            ...this.debugInfo,
            angular: {
              success: true,
              dataLength: Array.isArray(response) ? response.length : 'N/A',
              timestamp: new Date().toISOString()
            }
          };
        },
        error: (error) => {
          console.error('❌ [DEBUG] Teste Angular - Erro:', error);
          this.debugInfo = {
            ...this.debugInfo,
            angular: {
              error: {
                status: error.status,
                message: error.message,
                url: error.url
              },
              timestamp: new Date().toISOString()
            }
          };
        }
      });
  }

  testClientService() {
    console.log('🎯 [DEBUG] Iniciando teste com ClientService...');

    this.clientService.getAllClients().subscribe({
      next: (response: any) => {
        console.log('✅ [DEBUG] Teste ClientService - Sucesso:', response);
        this.debugInfo = {
          ...this.debugInfo,
          clientService: {
            success: true,
            dataLength: Array.isArray(response) ? response.length : 'N/A',
            timestamp: new Date().toISOString()
          }
        };
      },
      error: (error: any) => {
        console.error('❌ [DEBUG] Teste ClientService - Erro:', error);
        this.debugInfo = {
          ...this.debugInfo,
          clientService: {
            error: {
              status: error.status,
              message: error.message,
              url: error.url
            },
            timestamp: new Date().toISOString()
          }
        };
      }
    });
  }
}
