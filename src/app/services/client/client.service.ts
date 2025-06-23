import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Client } from '../../models/client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  // Base URL for client-related API endpoints
  private baseUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) { }

  /**
   * Creates a new client.
   * @param client The client object to create.
   * @returns An Observable of the created client.
   */
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/create`, client);
  }

  /**
   * Retrieves a client by their ID.
   * @param id The ID of the client to retrieve.
   * @returns An Observable of the client.
   */
  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/getById/${id}`);
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
  updateClient(client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/update/${client.id}`, client);
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


}
