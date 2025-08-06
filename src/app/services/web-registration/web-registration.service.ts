import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserRole } from '../../models/user_role';

export interface WebRegistrationRequest {
  username: string;
  email: string;
  name: string;
  cpf: string;
  password: string;
  source?: string; // 'wordpress', 'angular', etc.
}

export interface WebRegistrationResponse {
  success: boolean;
  message: string;
  userId?: number;
  clientId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebRegistrationService {
  private baseUrl = `${environment.apiUrl}/web`;

  constructor(private http: HttpClient) { }

  /**
   * Registra um novo cliente via web (WordPress ou outros)
   */
  registerClient(request: WebRegistrationRequest): Observable<WebRegistrationResponse> {
    // Define headers para CORS
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });

    // Adiciona role automaticamente
    const userData = {
      ...request,
      role: UserRole.CLIENT,
      source: request.source || 'web'
    };

    return this.http.post<WebRegistrationResponse>(`${this.baseUrl}/register`, userData, { headers });
  }

  /**
   * Verifica se username está disponível
   */
  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.baseUrl}/check-username/${username}`);
  }

  /**
   * Verifica se email está disponível
   */
  checkEmailAvailability(email: string): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.baseUrl}/check-email/${email}`);
  }
}
