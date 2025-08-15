import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bioimpedancia, BioimpedanciaDTO } from '../../models/Bioimpedancia';

@Injectable({
  providedIn: 'root'
})
export class BioimpedanciaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bioimpedancia`;

  constructor() { }

  // Criar nova bioimpedância
  create(bioimpedancia: BioimpedanciaDTO): Observable<Bioimpedancia> {
    return this.http.post<Bioimpedancia>(`${this.apiUrl}`, bioimpedancia);
  }

  // Buscar bioimpedância por ID
  getById(id: number): Observable<Bioimpedancia> {
    return this.http.get<Bioimpedancia>(`${this.apiUrl}/${id}`);
  }

  // Buscar todas as bioimpedâncias de um cliente
  getByClientId(clientId: number): Observable<Bioimpedancia[]> {
    // Endpoint correto conforme backend: /bioimpedancia/cliente/{clienteId}
    return this.http.get<Bioimpedancia[]>(`${this.apiUrl}/cliente/${clientId}`);
  }

  // Atualizar bioimpedância
  update(id: number, bioimpedancia: BioimpedanciaDTO): Observable<Bioimpedancia> {
    return this.http.put<Bioimpedancia>(`${this.apiUrl}/${id}`, bioimpedancia);
  }

  // Deletar bioimpedância
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Buscar todas as bioimpedâncias (não recomendado, mas mantido para compatibilidade)
  getAll(): Observable<Bioimpedancia[]> {
    return this.http.get<Bioimpedancia[]>(this.apiUrl);
  }
}
