import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, of, firstValueFrom } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ClientService } from '../../../services/client/client.service';
import { MeasureService } from '../../../services/measure/measure.service';

// Models
import { Client } from '../../../models/client';
import { Measure } from '../../../models/measure';

@Component({
  selector: 'app-client-measure',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './client-measure.component.html',
  styleUrl: './client-measure.component.scss'
})
export class ClientMeasureComponent implements OnInit {
  private clientService = inject(ClientService);
  private measureService = inject(MeasureService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clientId: number | null = null;
  client: Client | null = null;
  measures: Measure | null = null;
  loading = true;
  error = false;
  isEditing = false;
  isSaving = false;

  // Objeto para edição das medidas
  editableMeasures: Partial<Measure> = {
    ombro: undefined,
    peitoral: undefined,
    braco_direito: undefined,
    braco_esquerdo: undefined,
    cintura: undefined,
    quadril: undefined,
    coxa_direita: undefined,
    coxa_esquerda: undefined,
    panturrilha_direita: undefined,
    panturrilha_esquerda: undefined,
    subescapular: undefined,
    triceps: undefined,
    abdominal: undefined
  };

  ngOnInit() {
    this.route.params.pipe(
      map(params => {
        const id = params['id'];
        console.log('🔍 ID da rota recebido:', { id, type: typeof id });
        
        if (!id || isNaN(+id)) {
          console.error('❌ ID inválido da rota:', id);
          this.error = true;
          this.loading = false;
          return null;
        }
        
        // Garantir conversão limpa para número
        const numericId = parseInt(id, 10);
        console.log('🔢 ID convertido:', { original: id, converted: numericId });
        
        this.clientId = numericId;
        return this.clientId;
      }),
      switchMap(clientId => {
        if (!clientId) return of(null);
        return this.loadClientMeasures(clientId);
      })
    ).subscribe({
      next: (data) => {
        if (data) {
          this.client = data.client;
          this.measures = data.measures;

          // Inicializar o objeto editável com os dados existentes ou valores vazios
          this.initializeEditableMeasures();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar medidas do cliente:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  private loadClientMeasures(clientId: number): Observable<{ client: Client; measures: Measure | null }> {
    return forkJoin({
      client: this.clientService.getClientById(clientId).pipe(catchError(() => of(null))),
      measures: this.measureService.getMeasureByClientId(clientId).pipe(catchError(() => of(null)))
    }).pipe(
      map(({ client, measures }) => {
        if (!client) {
          throw new Error('Cliente não encontrado');
        }
        return { client, measures };
      })
    );
  }

  // Inicializar objeto editável com dados existentes ou valores vazios
  private initializeEditableMeasures() {
    this.editableMeasures = {
      ombro: this.measures?.ombro || undefined,
      peitoral: this.measures?.peitoral || undefined,
      braco_direito: this.measures?.braco_direito || undefined,
      braco_esquerdo: this.measures?.braco_esquerdo || undefined,
      cintura: this.measures?.cintura || undefined,
      quadril: this.measures?.quadril || undefined,
      coxa_direita: this.measures?.coxa_direita || undefined,
      coxa_esquerda: this.measures?.coxa_esquerda || undefined,
      panturrilha_direita: this.measures?.panturrilha_direita || undefined,
      panturrilha_esquerda: this.measures?.panturrilha_esquerda || undefined,
      subescapular: this.measures?.subescapular || undefined,
      triceps: this.measures?.triceps || undefined,
      abdominal: this.measures?.abdominal || undefined
    };

    console.log('🔄 Medidas editáveis inicializadas:', {
      originalMeasures: this.measures,
      editableMeasures: this.editableMeasures
    });
  }

  // Habilitar modo de edição
  enableEditing() {
    console.log('✏️ Habilitando modo de edição');
    console.log('📊 Estado atual das medidas:', {
      measures: this.measures,
      editableMeasures: this.editableMeasures
    });
    this.isEditing = true;
  }

  // Cancelar edição
  cancelEditing() {
    console.log('❌ Cancelando edição');
    this.isEditing = false;
    this.initializeEditableMeasures(); // Restaurar valores originais
  }

  // Salvar medidas
  async saveMeasures() {
    if (!this.clientId) {
      console.error('❌ ID do cliente não encontrado');
      return;
    }

    console.log('🔍 Verificando mudanças...', {
      editableMeasures: this.editableMeasures,
      originalMeasures: this.measures,
      hasChanges: this.hasChanges()
    });

    if (!this.hasChanges()) {
      console.log('ℹ️ Nenhuma alteração detectada');
      return;
    }

    this.isSaving = true;

    try {
      // Preparar dados para envio - filtrar valores undefined/null
      const measureData: any = {};
      
      Object.keys(this.editableMeasures).forEach(key => {
        const value = this.editableMeasures[key as keyof Measure];
        if (value !== undefined && value !== null && value !== '') {
          measureData[key] = Number(value); // Garantir que são números
        }
      });

      // Se há medidas existentes, incluir o ID para atualização
      if (this.measures?.id) {
        measureData.id = this.measures.id;
        console.log('📝 Medida existente encontrada - ID:', this.measures.id);
      } else {
        console.log('✨ Criando nova medida para cliente');
      }

      console.log('📤 Enviando dados das medidas:', measureData);

      let result;

      try {
        // Usar método unificado que decide entre criar ou atualizar
        console.log('🎯 Usando createOrUpdateMeasure');
        result = await firstValueFrom(
          this.measureService.createOrUpdateMeasure(this.clientId, measureData as Measure)
        );
        console.log('✅ Sucesso via MeasureService:', result);
      } catch (measureError: any) {
        console.log('❌ Falha via MeasureService:', measureError);
        
        // Tentar via ClientService como fallback apenas para criação
        if (!this.measures?.id) {
          console.log('🎯 Tentativa fallback: ClientService.updateMeasure');
          try {
            result = await firstValueFrom(
              this.clientService.updateMeasure(this.clientId, measureData as Measure)
            );
            console.log('✅ Sucesso via ClientService:', result);
          } catch (clientError: any) {
            console.log('❌ Falha via ClientService:', clientError);
            throw clientError; // Re-throw o último erro
          }
        } else {
          throw measureError; // Para atualizações, não tentar fallback
        }
      }

      console.log('✅ Resposta final do servidor:', result);

      // Recarregar dados após salvar
      const data = await firstValueFrom(this.loadClientMeasures(this.clientId));
      if (data) {
        this.client = data.client;
        this.measures = data.measures;
        this.initializeEditableMeasures();
      }

      this.isEditing = false;
      console.log('✅ Medidas salvas com sucesso!');

      // Feedback visual opcional
      this.showSuccessMessage();

    } catch (error: any) {
      console.error('❌ Erro ao salvar medidas (todas as tentativas falharam):', error);
      console.error('❌ Detalhes completos do erro:', {
        status: error?.status,
        statusText: error?.statusText,
        message: error?.message,
        error: error?.error,
        url: error?.url
      });
      
      // Analisar tipo de erro
      if (error?.status === 404) {
        console.error('❌ Endpoint não encontrado - Backend pode não ter este recurso implementado');
        console.error('❌ URL tentada:', error?.url);
        console.error('💡 Sugestão: Verificar se o backend tem o endpoint de medidas implementado');
      } else if (error?.status === 400) {
        console.error('❌ Dados inválidos:', error.error);
      } else if (error?.status === 500) {
        console.error('❌ Erro interno do servidor');
      } else if (error?.status === 0) {
        console.error('❌ Erro de conexão - backend pode estar offline');
      }

      this.showErrorMessage(error);
    } finally {
      this.isSaving = false;
    }
  }

  // Método para mostrar mensagem de sucesso (pode ser substituído por toast)
  private showSuccessMessage() {
    // Por enquanto apenas log, mas pode ser implementado com Angular Material Snackbar
    console.log('💚 Sucesso: Medidas salvas com sucesso!');
  }

  // Método para mostrar mensagem de erro (pode ser substituído por toast)
  private showErrorMessage(error: any) {
    // Por enquanto apenas log, mas pode ser implementado com Angular Material Snackbar
    console.error('❤️ Erro: Falha ao salvar medidas', error);
  }

  // Método de debug para testar salvamento (pode ser removido em produção)
  debugSave() {
    console.log('🔧 DEBUG: Estado atual do componente:', {
      clientId: this.clientId,
      isEditing: this.isEditing,
      isSaving: this.isSaving,
      client: this.client,
      measures: this.measures,
      editableMeasures: this.editableMeasures,
      hasChanges: this.hasChanges()
    });
  }

  // Método para testar diferentes endpoints da API
  async testAPIEndpoints() {
    if (!this.clientId) return;

    const testData = {
      ombro: 50,
      peitoral: 100,
      cintura: 80
    };

    // Garantir que clientId seja um número
    const cleanClientId = Number(this.clientId);
    
    const endpoints = [
      `http://localhost:8080/client-measure/createMeasureToClient/${cleanClientId}`,
      `http://localhost:8080/clients/createMeasureToClient/${cleanClientId}`,
      `http://localhost:8080/measure/create/${cleanClientId}`,
      `http://localhost:8080/api/measures/${cleanClientId}`,
      `http://localhost:8080/clients/${cleanClientId}/measures`
    ];

    console.log('🧪 Testando endpoints disponíveis...', {
      clientId: this.clientId,
      cleanClientId: cleanClientId,
      endpoints: endpoints
    });

    for (const endpoint of endpoints) {
      try {
        console.log(`🎯 Testando: ${endpoint}`);
        const result = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testData)
        });
        
        console.log(`✅ ${endpoint} → Status: ${result.status}`);
        if (result.ok) {
          const data = await result.text();
          console.log(`📄 Resposta: ${data}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} → Erro: ${error}`);
      }
    }
  }

  // Verificar se há mudanças para salvar
  hasChanges(): boolean {
    const hasValues = Object.values(this.editableMeasures).some(value => 
      value !== undefined && value !== null && value !== '' && value !== 0
    );

    console.log('🔍 Verificação de mudanças:', {
      editableMeasures: this.editableMeasures,
      originalMeasures: this.measures,
      hasValues: hasValues
    });

    if (!this.measures) {
      // Se não há medidas anteriores, verificar se algum campo foi preenchido
      return hasValues;
    }

    // Comparar valores atuais com os originais
    const hasChanges = Object.keys(this.editableMeasures).some(key => {
      const currentValue = this.editableMeasures[key as keyof Measure];
      const originalValue = this.measures![key as keyof Measure];
      
      // Converter ambos para número para comparação precisa
      const currentNum = currentValue ? Number(currentValue) : null;
      const originalNum = originalValue ? Number(originalValue) : null;
      
      const isDifferent = currentNum !== originalNum;
      
      if (isDifferent) {
        console.log(`🔍 Mudança detectada em ${key}:`, {
          original: originalNum,
          current: currentNum
        });
      }
      
      return isDifferent;
    });

    return hasChanges || hasValues;
  }

  onBack() {
    if (this.clientId) {
      this.router.navigate(['/client-dashboard', this.clientId]);
    } else {
      this.router.navigate(['/clients-list']);
    }
  }

  navigateToEditMeasures() {
    if (this.clientId) {
      this.router.navigate(['/edit-measures', this.clientId]);
    }
  }

  getBMI(): number | null {
    if (!this.client?.weight || !this.client?.height) return null;

    // Validar se os valores são números válidos
    const height = Number(this.client.height);
    const weight = Number(this.client.weight);

    if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
      console.warn('⚠️ Valores inválidos para cálculo de IMC:', { height, weight });
      return null;
    }

    // Auto-detectar se altura está em metros ou centímetros
    let heightInMeters: number;

    if (height < 10) {
      // Provavelmente está em metros (ex: 1.75m)
      heightInMeters = height;
      console.log('🔍 Altura detectada em metros:', height + 'm');
    } else {
      // Provavelmente está em centímetros (ex: 175cm)
      heightInMeters = height / 100;
      console.log('🔍 Altura detectada em centímetros:', height + 'cm → ' + heightInMeters + 'm');
    }

    // Validação final da altura em metros (deve estar entre 0.5m e 2.5m)
    if (heightInMeters < 0.5 || heightInMeters > 2.5) {
      console.warn('⚠️ Altura fora do intervalo válido (0.5m - 2.5m):', heightInMeters + 'm');
      return null;
    }

    // Validação do peso (deve estar entre 1kg e 500kg)
    if (weight < 1 || weight > 500) {
      console.warn('⚠️ Peso fora do intervalo válido (1kg - 500kg):', weight + 'kg');
      return null;
    }

    // Calcular BMI
    const bmi = weight / (heightInMeters * heightInMeters);

    // Debug do resultado
    console.log('📊 BMI Calculado (client-measure):', {
      originalHeight: height,
      heightInMeters: heightInMeters + 'm',
      weight: weight + 'kg',
      bmi: bmi.toFixed(2),
      category: this.getBMICategory(bmi)
    });

    return Number(bmi.toFixed(1));
  }

  // Método auxiliar para categorizar BMI
  private getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Abaixo do peso';
    if (bmi < 25) return 'Peso normal';
    if (bmi < 30) return 'Sobrepeso';
    return 'Obesidade';
  }

  // Método público para obter categoria do BMI atual
  getBMICategoryForDisplay(): string {
    const bmi = this.getBMI();
    return bmi ? this.getBMICategory(bmi) : 'N/A';
  }

  getBMIColor(): string {
    const bmi = this.getBMI();
    if (!bmi) return 'gray';

    if (bmi < 18.5) return '#FF9800'; // Orange
    if (bmi < 25) return '#4CAF50'; // Green
    if (bmi < 30) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  // Método para obter ícone de status do BMI
  getBMIStatusIcon(): string {
    const bmi = this.getBMI();
    if (!bmi) return 'help_outline';

    if (bmi < 18.5) return 'keyboard_arrow_down'; // Seta para baixo - Abaixo do peso
    if (bmi < 25) return 'check_circle';          // Check verde - Normal
    if (bmi < 30) return 'warning';               // Warning - Sobrepeso
    return 'keyboard_arrow_up';                   // Seta para cima - Obesidade
  }
}
