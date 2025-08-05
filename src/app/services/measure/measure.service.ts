import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Measure } from '../../models/measure';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeasureService {
  private baseUrl = `${environment.apiUrl}/client-measure`; // URL base correta

  constructor(private http: HttpClient) { }

  /**
   * Busca as medidas de um Cliente específico.
   * @param userId O ID do Cliente.
   * @returns Um Observable com o objeto Measure ou null.
   */
  getMeasureByClientId(userId: number): Observable<Measure | null> {
    console.log(`🔍 Buscando medidas para cliente ID: ${userId}`);
    console.log(`🔍 URL completa: ${this.baseUrl}/getMeasureByClientId/${userId}`);
    
    return this.http.get<any>(`${this.baseUrl}/getMeasureByClientId/${userId}`)
      .pipe(
        map(response => {
          console.log('✅ Resposta do backend (medidas):', response);
          
          if (!response || !response.measure) {
            console.log('ℹ️ Nenhuma medida encontrada para o cliente');
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
            braco_direito: response.measure.braço_direito,
            braco_esquerdo: response.measure.braço_esquerdo,
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

          console.log('✅ Medidas processadas:', measureData);
          return measureData;
        }),
        catchError(error => {
          console.error('❌ Erro ao buscar medidas do cliente:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ StatusText:', error.statusText);
          console.error('❌ Error body:', error.error);
          
          // Se for erro 404, significa que o cliente não tem medidas
          if (error.status === 404) {
            console.log('ℹ️ Cliente não possui medidas cadastradas (404)');
            return of(null); // Retorna null em caso de 404
          }
          
          // Se for erro 400, pode ser problema de validação
          if (error.status === 400) {
            console.error('❌ Erro 400 - Bad Request. Possíveis causas:');
            
            // Verifica se é o erro específico "source cannot be null"
            if (error.error?.mensagem === 'source cannot be null') {
              console.error('❌ ERRO ESPECÍFICO: Backend com problema "source cannot be null"');
              console.error('❌ Este é um problema do BACKEND que precisa ser corrigido');
              console.error('❌ Sugestão: Verificar o controller/service de medidas no Spring Boot');
              
              // Retorna null para não quebrar a interface
              return of(null);
            }
            
            console.error('   - ID do cliente inválido');
            console.error('   - Endpoint não encontrado no backend');
            console.error('   - Parâmetro em formato incorreto');
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
    return this.http.post<Measure>(`${this.baseUrl}/ceateMeasureToClient/${clientId}/`, measure);
  }


  updateMeasure(clientId: number, measure: Measure): Observable<any> {
    const url = `${this.baseUrl}/createMeasureToClient/${clientId}/`;

    // Remove o campo 'data' que não existe no backend
    const { data, ...backendMeasure } = measure;

    // Garante que estamos enviando os nomes de campos no formato esperado pelo backend
    // Não precisamos fazer mapeamentos adicionais pois já estamos usando os nomes corretos do backend

    return this.http.post<any>(url, backendMeasure);
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
