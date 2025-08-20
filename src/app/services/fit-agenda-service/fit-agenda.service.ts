
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Appointment } from '../../models/appointment';

@Injectable({
  providedIn: 'root'
})
export class FitAgendaService {
  private baseUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  /**
   * Cria um novo agendamento
   */
  create(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.baseUrl, appointment);
  }

  /**
   * Lista agendamentos, com filtros opcionais por cliente e datas
   */
  list(params?: { clientId?: number; start?: string; end?: string }): Observable<Appointment[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.clientId) httpParams = httpParams.set('clientId', params.clientId.toString());
      if (params.start) httpParams = httpParams.set('start', params.start);
      if (params.end) httpParams = httpParams.set('end', params.end);
    }
    return this.http.get<Appointment[]>(this.baseUrl, { params: httpParams });
  }

  /**
   * Busca agendamento por ID
   */
  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/${id}`);
  }

  /**
   * Atualiza agendamento existente
   */
  update(id: number, appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/${id}`, appointment);
  }

  /**
   * Exclui agendamento
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
