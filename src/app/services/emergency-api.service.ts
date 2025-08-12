import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmergencyApiService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * 🚨 TESTE DE EMERGÊNCIA: Requisição com headers manuais
   */
  testAuthenticatedRequest(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const url = `${environment.apiUrl}/clients/getById/1`;

    console.log('🚨 [EMERGENCY] Fazendo requisição com headers manuais:', url);
    console.log('🚨 [EMERGENCY] Headers:', headers);

    return this.http.get<any>(url, { headers });
  }

  /**
   * 🚨 TESTE: Listar todos os clientes com headers manuais
   */
  listAllClients(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    const url = `${environment.apiUrl}/clients/listAll`;

    console.log('🚨 [EMERGENCY] Listando clientes com headers manuais:', url);

    return this.http.get<any>(url, { headers });
  }
}
