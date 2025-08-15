import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Client } from '../../models/client';
import { Measure } from '../../models/measure';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  // Base URL for client-related API endpoints
  private baseUrl = `${environment.apiUrl}/clients`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Creates a new client.
   * @param client The client object to create.
   * @returns An Observable of the created client.
   */
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/create`, client);
  }



  // No client.service.ts
  getClientById(id: number | string): Observable<Client> {
    // Converter para number dentro do método e garantir limpeza
    const numericId = typeof id === 'string' ? parseInt(id, 10) : Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new Error('ID do cliente inválido.');
    }
    const url = `${this.baseUrl}/getById/${numericId}`;
    return this.http.get<Client>(url);
  }

  /**
   * Retrieves all clients.
   * @returns An Observable of an array of clients.
   */
  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/listAll`);
  }

  /**
   * Updates an existing client.
   * @param client The client object with updated information.
   * @returns An Observable of the updated client.
   */
  updateClient(clientId: number, clientData: any): Observable<Client> {
    return this.http.patch<Client>(`${this.baseUrl}/update/${clientId}`, clientData);
  }

  /**
   * Deletes a client by their ID.
   * @param id The ID of the client to delete.
   * @returns An empty Observable on successful deletion.
   */
  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
  createDoctorByClientId(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/createDoctorByClientId/${id}`, {});
  }

  getDoctorByClientId(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/getDoctorByClientId/${id}`);
  }
  updateMeasure(clientId: number, measure: Measure): Observable<any> {
    const cleanClientId = Number(clientId);
    const url = `${this.baseUrl}/createMeasureToClient/${cleanClientId}`;

    // Remover o campo 'data' que não existe no backend
    const { data, ...backendMeasure } = measure;

    console.log('🔄 ClientService.updateMeasure:', {
      url,
      clientId,
      cleanClientId,
      data: backendMeasure
    });

    return this.http.post<any>(url, backendMeasure);
  }
}
