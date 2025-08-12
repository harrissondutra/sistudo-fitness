import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div style="position: fixed; top: 10px; right: 10px; z-index: 9999; background: white; padding: 10px; border: 1px solid #ccc; border-radius: 5px; max-width: 300px;">
      <h4>🔧 Debug de Autenticação</h4>
      <p><strong>Ambiente:</strong> {{ environment.production ? 'PRODUÇÃO' : 'DESENVOLVIMENTO' }}</p>
      <p><strong>API URL:</strong> {{ environment.apiUrl }}</p>
      <p><strong>Token presente:</strong> {{ tokenPresent ? '✅' : '❌' }}</p>
      <p><strong>Autenticado:</strong> {{ isAuthenticated ? '✅' : '❌' }}</p>
      <button mat-button (click)="runDiagnostic()">🔍 Diagnóstico Completo</button>
      <button mat-button (click)="testApiCall()">🌐 Testar API</button>
      <button mat-button (click)="clearStorage()">🗑️ Limpar Storage</button>
    </div>
  `
})
export class AuthDebugComponent implements OnInit {
  private authService = inject(AuthService);

  environment = environment;
  tokenPresent = false;
  isAuthenticated = false;

  ngOnInit() {
    this.updateStatus();
  }

  updateStatus() {
    this.tokenPresent = !!this.authService.getToken();
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  runDiagnostic() {
    this.authService.diagnoseAuthenticationIssues();
    this.updateStatus();
  }

  testApiCall() {
    console.log('=== TESTE DE CHAMADA API ===');
    fetch(`${environment.apiUrl}/clients`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      console.log('Resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      return response.text();
    })
    .then(text => {
      console.log('Corpo da resposta:', text);
    })
    .catch(error => {
      console.error('Erro na chamada API:', error);
    });
  }

  clearStorage() {
    sessionStorage.clear();
    localStorage.clear();
    console.log('Storage limpo');
    this.updateStatus();
  }
}
