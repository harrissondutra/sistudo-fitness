import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Measure } from '../../models/measure'; // Ajuste o caminho
import { environment } from '../../../environments/environment'; // Ajuste o caminho para o seu environment

@Injectable({
  providedIn: 'root'
})
export class MeasureService {
  private baseUrl = `${environment.apiUrl}/measure`; // Exemplo: assumindo que o endpoint base para medidas é /measure

  constructor(private http: HttpClient) { }

  /**
   * Busca as medidas de um Cliente específico.
   * @param userId O ID do Cliente.
   * @returns Um Observable com o objeto Measure.
   */
  getMeasureByUserId(userId: number): Observable<Measure> {
    return this.http.get<Measure>(`${this.baseUrl}/user/${userId}`);
  }

  /**
   * Cria um novo registro de medida.
   * @param measure O objeto Measure a ser criado.
   * @returns Um Observable com o objeto Measure criado.
   */
  createMeasure(measure: Measure): Observable<Measure> {
    return this.http.post<Measure>(`${this.baseUrl}/create`, measure);
  }

  /**
   * Atualiza um registro de medida existente.
   * @param measure O objeto Measure a ser atualizado (deve conter o ID).
   * @returns Um Observable com o objeto Measure atualizado.
   */
  updateMeasure(measure: Measure): Observable<Measure> {
    // Note que o measure.id é usado no path da URL aqui
    return this.http.put<Measure>(`${this.baseUrl}/update/${measure.id}`, measure);
  }

  /**
   * Apaga um registro de medida.
   * @param id O ID da medida a ser apagada.
   * @returns Um Observable vazio.
   */
  deleteMeasure(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  getMeasureHistoryByUserId(userId: number): Observable<Measure[]> {
    return this.http.get<Measure[]>(`${this.baseUrl}/history/${userId}`);
  }
}
