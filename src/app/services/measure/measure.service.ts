import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Measure } from '../../models/measure';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class MeasureService {
  private baseUrl = `${environment.apiUrl}/client-measure`; // URL base correta

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Busca as medidas de um Cliente específico.
   * 🚨 EMERGÊNCIA: Usando headers manuais (interceptors não funcionam)
   * @param userId O ID do Cliente.
   * @returns Um Observable com o objeto Measure ou null.
   */
  getMeasureByClientId(userId: number): Observable<Measure | null> {
    const cleanUserId = Number(userId);
    const url = `${this.baseUrl}/getMeasureByClientId/${cleanUserId}`;

    // 🚨 EMERGÊNCIA: Headers manuais
    const headers = this.authService.getAuthHeaders();
    console.log('🚨 [MeasureService] getMeasureByClientId com headers manuais:', cleanUserId);

    return this.http.get<any>(url, { headers })
      .pipe(
        map(response => {


          if (!response || !response.measure) {

            return null;
          }

          // Mapeia as propriedades snake_case para camelCase
          const measureData: Measure = {
            id: response.measure.id,
            ombro: response.measure.ombro,
            cintura: response.measure.cintura,
            quadril: response.measure.quadril,
            panturrilha_direita: response.measure.panturrilha_direita,
            panturrilha_esquerda: response.measure.panturrilha_esquerda,
            braco_direito: response.measure.braco_direito,
            braco_esquerdo: response.measure.braco_esquerdo,
            coxa_direita: response.measure.coxa_direita,
            coxa_esquerda: response.measure.coxa_esquerda,
            peitoral: response.measure.peitoral,
            abdomem: response.measure.abdomem,
            abdominal: response.measure.abdominal,
            suprailiaca: response.measure.suprailiaca,
            subescapular: response.measure.subescapular,
            triceps: response.measure.triceps,
            axilar: response.measure.axilar,
            torax: response.measure.torax,
            data: new Date() // Se a data não estiver disponível, use a data atual
          };


          return measureData;
        }),
        catchError(error => {

          // Se for erro 404, significa que o cliente não tem medidas
          if (error.status === 404) {

            return of(null); // Retorna null em caso de 404
          }

          // Se for erro 400, pode ser problema de validação
          if (error.status === 400) {


            // Verifica se é o erro específico "source cannot be null"
            if (error.error?.mensagem === 'source cannot be null') {

              // Retorna null para não quebrar a interface
              return of(null);
            }


          }

          // Para outros erros, propaga o erro
          throw error;
        })
      );
  }

  /**
   * Cria um novo registro de medida para um cliente específico.
   * @param clientId O ID do cliente.
   * @param measure O objeto Measure a ser criado.
   * @returns Um Observable com o objeto Measure criado.
   */
  createMeasure(clientId: number, measure: Measure): Observable<Measure> {
    const cleanClientId = Number(clientId);
    const url = `${this.baseUrl}/createMeasureToClient/${cleanClientId}`;

    // Remove o campo 'data' que não existe no backend
    const { data, ...backendMeasure } = measure;

    return this.http.post<Measure>(url, backendMeasure);
  }

  /**
   * Atualiza um registro de medida existente pelo ID do cliente.
   * @param clientId O ID do cliente.
   * @param measure O objeto Measure com os novos dados.
   * @returns Um Observable com o objeto Measure atualizado.
   */
  updateMeasure(clientId: number, measure: Measure): Observable<Measure> {
    const cleanClientId = Number(clientId);
    const url = `${this.baseUrl}/updateMeasureByClient/${cleanClientId}`;

    // Remove o campo 'data' que não existe no backend
    const { data, ...backendMeasure } = measure;

    return this.http.put<Measure>(url, backendMeasure);
  }

  /**
   * Criar ou atualizar medidas (fallback para compatibilidade)
   * @param clientId O ID do cliente.
   * @param measure O objeto Measure.
   * @returns Um Observable com o resultado.
   */
  createOrUpdateMeasure(clientId: number, measure: Measure): Observable<any> {
    // Garantir que clientId seja um número limpo
    const cleanClientId = Number(clientId);



    // Se a medida tem ID, usar endpoint de atualização
    if (measure.id) {
      return this.updateMeasure(measure.id, measure);
    } else {
      return this.createMeasure(cleanClientId, measure);
    }
  }

  /**
   * Apaga um registro de medida.
   * @param id O ID da medida a ser apagada.
   * @returns Um Observable vazio.
   */
  deleteMeasure(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  /**
   * Obtém o histórico de medidas de um cliente específico.
   * @param userId O ID do Cliente.
   * @returns Um Observable com uma lista de objetos Measure.
   */
  getMeasureHistoryByUserId(userId: number): Observable<Measure[]> {
    return this.http.get<Measure[]>(`${this.baseUrl}/history/${userId}`);
  }
}
