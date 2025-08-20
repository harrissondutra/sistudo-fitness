import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgChartsModule } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartEvent, ChartType, registerables } from 'chart.js';
import { firstValueFrom } from 'rxjs';

import { BioimpedanciaService } from '../../../../services/bioimpedancia/bioimpedancia.service';
import { ClientService } from '../../../../services/client/client.service';
import { Bioimpedancia } from '../../../../models/Bioimpedancia';
import { Client } from '../../../../models/client';

Chart.register(...registerables);

/**
 * Configuração para cada tipo de gráfico.
 */
interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  visible: boolean;
  category: 'weight' | 'body-composition' | 'muscle-fat' | 'segments' | 'metabolic';
  description: string;
  data?: ChartData;
  options?: ChartConfiguration['options'];
}

/**
 * Componente que exibe o histórico de bioimpedâncias de um cliente.
 * Permite filtrar dados, exibir gráficos dinamicamente e navegar para outras telas.
 */
@Component({
  selector: 'app-bioimpedancia-history',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    // MatNativeDateModule, // Removido: não é standalone
    MatTooltipModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    NgChartsModule
  ],
  templateUrl: './bioimpedancia-history.component.html',
  styleUrls: ['./bioimpedancia-history.component.scss']
})
export class BioimpedanciaHistoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bioimpedanciaService = inject(BioimpedanciaService);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  clientId!: number;
  client: Client | null = null;
  bioimpedancias: Bioimpedancia[] = [];
  isLoading = false;

  filterForm!: FormGroup;

  // Configurações de gráficos disponíveis
  availableCharts: ChartConfig[] = [
    {
      id: 'weight-evolution',
      title: 'Evolução do Peso',
      type: 'line',
      category: 'weight',
      visible: true,
      description: 'Acompanha a variação do peso ao longo do tempo'
    },
    {
      id: 'imc-evolution',
      title: 'Evolução do IMC',
      type: 'line',
      category: 'weight',
      visible: true,
      description: 'Índice de Massa Corporal ao longo do tempo'
    },
    {
      id: 'body-fat-percentage',
      title: 'Percentual de Gordura',
      type: 'line',
      category: 'body-composition',
      visible: true,
      description: 'Evolução do percentual de gordura corporal'
    },
    {
      id: 'muscle-mass',
      title: 'Massa Muscular',
      type: 'line',
      category: 'body-composition',
      visible: true,
      description: 'Evolução da massa muscular'
    },
    {
      id: 'body-composition-pie',
      title: 'Composição Corporal Atual',
      type: 'doughnut',
      category: 'body-composition',
      visible: true,
      description: 'Distribuição atual dos componentes corporais'
    },
    {
      id: 'water-percentage',
      title: 'Água Corporal',
      type: 'line',
      category: 'body-composition',
      visible: false,
      description: 'Percentual de água corporal'
    },
    {
      id: 'visceral-fat',
      title: 'Gordura Visceral',
      type: 'bar',
      category: 'muscle-fat',
      visible: false,
      description: 'Nível de gordura visceral'
    },
    {
      id: 'skeletal-muscle',
      title: 'Músculo Esquelético',
      type: 'line',
      category: 'muscle-fat',
      visible: false,
      description: 'Massa do músculo esquelético'
    },
    {
      id: 'bmr-evolution',
      title: 'Taxa Metabólica Basal',
      type: 'line',
      category: 'metabolic',
      visible: false,
      description: 'Evolução da TMB ao longo do tempo'
    },
    {
      id: 'segmental-comparison',
      title: 'Comparação Segmentar',
      type: 'radar',
      category: 'segments',
      visible: false,
      description: 'Comparação entre segmentos corporais'
    }
  ];

  // Categorias de gráficos
  chartCategories = [
    { id: 'weight', name: 'Peso e IMC', icon: 'monitor_weight' },
    { id: 'body-composition', name: 'Composição Corporal', icon: 'pie_chart' },
    { id: 'muscle-fat', name: 'Músculo e Gordura', icon: 'fitness_center' },
    { id: 'segments', name: 'Análise Segmentar', icon: 'accessibility' },
    { id: 'metabolic', name: 'Metabolismo', icon: 'local_fire_department' }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.route.paramMap.subscribe(paramMap => {
      this.clientId = +(paramMap.get('clientId') || 0);
      if (this.clientId) {
        this.loadData();
      }
    });
  }

  /**
   * Inicializa o formulário de filtros e observa suas mudanças.
   */
  private initializeForm(): void {
    this.filterForm = this.fb.group({
      dateStart: [null],
      dateEnd: [null],
      chartCategory: ['all']
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.updateCharts();
    });
  }

  /**
   * Carrega os dados do cliente e das bioimpedâncias.
   * Utiliza `firstValueFrom` para converter Observables em Promises.
   */
  private async loadData(): Promise<void> {
    this.isLoading = true;

    try {
      // Carregar cliente
      this.client = await firstValueFrom(this.clientService.getClientById(this.clientId));

      // Carregar bioimpedâncias
      const bioimpedancias = await firstValueFrom(this.bioimpedanciaService.getByClientId(this.clientId));

      this.bioimpedancias = (bioimpedancias || []).sort((a, b) =>
        new Date(a.dataMedicao || '').getTime() - new Date(b.dataMedicao || '').getTime()
      );

      this.updateCharts();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.showError('Erro ao carregar dados do histórico. Verifique a conexão.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Atualiza os dados de todos os gráficos com base nos filtros aplicados.
   */
  private updateCharts(): void {
    const filteredData = this.getFilteredData();

    this.availableCharts.forEach(chart => {
      switch (chart.id) {
        case 'weight-evolution':
          chart.data = this.generateWeightEvolutionChart(filteredData);
          break;
        case 'imc-evolution':
          chart.data = this.generateIMCEvolutionChart(filteredData);
          break;
        case 'body-fat-percentage':
          chart.data = this.generateBodyFatChart(filteredData);
          break;
        case 'muscle-mass':
          chart.data = this.generateMuscleMassChart(filteredData);
          break;
        case 'body-composition-pie':
          chart.data = this.generateBodyCompositionPieChart(filteredData);
          break;
        case 'water-percentage':
          chart.data = this.generateWaterPercentageChart(filteredData);
          break;
        case 'visceral-fat':
          chart.data = this.generateVisceralFatChart(filteredData);
          break;
        case 'skeletal-muscle':
          chart.data = this.generateSkeletalMuscleChart(filteredData);
          break;
        case 'bmr-evolution':
          chart.data = this.generateBMRChart(filteredData);
          break;
        case 'segmental-comparison':
          chart.data = this.generateSegmentalChart(filteredData);
          break;
      }
      chart.options = this.getChartOptions(chart.type);
    });
  }

  /**
   * Retorna os dados de bioimpedância filtrados por data.
   */
  private getFilteredData(): Bioimpedancia[] {
    let filtered = [...this.bioimpedancias];
    const startDate = this.filterForm.get('dateStart')?.value;
    const endDate = this.filterForm.get('dateEnd')?.value;

    if (startDate) {
      filtered = filtered.filter(b => new Date(b.dataMedicao || '') >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(b => new Date(b.dataMedicao || '') <= endDate);
    }

    return filtered;
  }

  /**
   * Gera os dados para o gráfico de evolução do peso.
   */
  private generateWeightEvolutionChart(data: Bioimpedancia[]): ChartData<'line'> {
    return {
      labels: data.map(b => new Date(b.dataMedicao || '').toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: 'Peso Atual (kg)',
          data: data.map(b => b.pesoAtual || 0),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4
        },
        {
          label: 'Peso Ideal (kg)',
          data: data.map(b => b.pesoIdeal || 0),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };
  }

  /**
   * Gera os dados para o gráfico de evolução do IMC.
   */
  private generateIMCEvolutionChart(data: Bioimpedancia[]): ChartData<'line'> {
    return {
      labels: data.map(b => new Date(b.dataMedicao || '').toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: 'IMC',
          data: data.map(b => b.imc || 0),
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  /**
   * Gera os dados para o gráfico de percentual de gordura.
   */
  private generateBodyFatChart(data: Bioimpedancia[]): ChartData<'line'> {
    return {
      labels: data.map(b => new Date(b.dataMedicao || '').toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: 'Gordura Corporal (%)',
          data: data.map(b => b.pgc || 0),
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  /**
   * Gera os dados para o gráfico de massa muscular.
   */
  private generateMuscleMassChart(data: Bioimpedancia[]): ChartData<'line'> {
    return {
      labels: data.map(b => new Date(b.dataMedicao || '').toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: 'Massa Muscular (kg)',
          data: data.map(b => b.analiseMusculoGordura?.massaMuscularEsqueletica || 0),
          borderColor: '#9C27B0',
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  /**
   * Gera os dados para o gráfico de pizza de composição corporal.
   */
  private generateBodyCompositionPieChart(data: Bioimpedancia[]): ChartData<'doughnut'> {
    const latest = data[data.length - 1];
    if (!latest) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: ['Água Corporal', 'Proteína', 'Minerais', 'Gordura'],
      datasets: [
        {
          data: [
            latest.composicaoCorporal?.aguaCorporal || 0,
            latest.composicaoCorporal?.proteina || 0,
            latest.composicaoCorporal?.minerais || 0,
            latest.composicaoCorporal?.massaGordura || 0
          ],
          backgroundColor: [
            '#2196F3',
            '#4CAF50',
            '#FF9800',
            '#F44336'
          ]
        }
      ]
    };
  }

  onSearchClient(searchValue: string): void {
    // TODO: Implement search logic here, e.g., call a service to fetch client by name
    console.log('Searching for client:', searchValue);
    // Example: this.clientService.searchClientByName(searchValue).subscribe(...)
  }

  getChartCategoryName(categoryId: string): string {
    const category = this.chartCategories?.find(c => c.id === categoryId);
    return category ? category.name : 'Categoria desconhecida';
  }

  // Add this method to your component class
  getChartCategoryIcon(category: string): string {
    // Example mapping, adjust as needed
    switch (category) {
      case 'bodyFat':
        return 'fitness_center';
      case 'muscleMass':
        return 'accessibility_new';
      case 'hydration':
        return 'water_drop';
      case 'weight':
        return 'monitor_weight';
      default:
        return 'insert_chart';
    }
  }

  /**
   * Gera os dados para o gráfico de percentual de água corporal.
   */
  private generateWaterPercentageChart(data: Bioimpedancia[]): ChartData<'line'> {
    return {
      labels: data.map(b => new Date(b.dataMedicao || '').toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: 'Água Corporal (L)',
          data: data.map(b => b.composicaoCorporal?.aguaCorporal || 0),
          borderColor: '#00BCD4',
          backgroundColor: 'rgba(0, 188, 212, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  /**
   * Gera os dados para o gráfico de gordura visceral.
   */
  private generateVisceralFatChart(data: Bioimpedancia[]): ChartData<'bar'> {
    return {
      labels: data.map(b => new Date(b.dataMedicao || '').toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: 'Gordura Visceral',
          data: data.map(b => b.nivelGorduraVisceral || 0),
          backgroundColor: '#FF5722',
          borderColor: '#D84315',
          borderWidth: 1
        }
      ]
    };
  }

  /**
   * Gera os dados para o gráfico de músculo esquelético.
   */
  private generateSkeletalMuscleChart(data: Bioimpedancia[]): ChartData<'line'> {
    return {
      labels: data.map(b => new Date(b.dataMedicao || '').toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: 'Músculo Esquelético (kg)',
          data: data.map(b => b.analiseMusculoGordura?.massaMuscularEsqueletica || 0),
          borderColor: '#673AB7',
          backgroundColor: 'rgba(103, 58, 183, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  /**
   * Gera os dados para o gráfico de TMB.
   */
  private generateBMRChart(data: Bioimpedancia[]): ChartData<'line'> {
    return {
      labels: data.map(b => new Date(b.dataMedicao || '').toLocaleDateString('pt-BR')),
      datasets: [
        {
          label: 'TMB (kcal)',
          data: data.map(b => b.tmb || 0),
          borderColor: '#FF5722',
          backgroundColor: 'rgba(255, 87, 34, 0.1)',
          tension: 0.4
        }
      ]
    };
  }

  /**
   * Gera os dados para o gráfico de comparação segmentar.
   */
  private generateSegmentalChart(data: Bioimpedancia[]): ChartData<'radar'> {
    const latest = data[data.length - 1];
    if (!latest?.massaMagraSegmentar) {
      return { labels: [], datasets: [] };
    }

    return {
      labels: ['Braço Esquerdo', 'Braço Direito', 'Tronco', 'Perna Esquerda', 'Perna Direita'],
      datasets: [
        {
          label: 'Massa Magra (%)',
          data: [
            latest.massaMagraSegmentar.bracoEsquerdoPct || 0,
            latest.massaMagraSegmentar.bracoDireitoPct || 0,
            latest.massaMagraSegmentar.troncoPct || 0,
            latest.massaMagraSegmentar.pernaEsquerdaPct || 0,
            latest.massaMagraSegmentar.pernaDireitaPct || 0
          ],
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: '#2196F3',
          pointBackgroundColor: '#2196F3'
        }
      ]
    };
  }

  /**
   * Retorna as opções de configuração base para os gráficos.
   */
  private getChartOptions(type: ChartType): ChartConfiguration['options'] {
    const baseOptions: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      }
    };

    if (type === 'line' || type === 'bar') {
      return {
        ...baseOptions,
        scales: {
          x: {
            display: true
          },
          y: {
            display: true,
            beginAtZero: false
          }
        }
      };
    }

    return baseOptions;
  }

  /**
   * Alterna a visibilidade de um gráfico no dashboard.
   */
  toggleChartVisibility(chartId: string): void {
    const chart = this.availableCharts.find(c => c.id === chartId);
    if (chart) {
      chart.visible = !chart.visible;
    }
  }

  /**
   * Retorna a lista de gráficos que estão visíveis no dashboard, considerando o filtro de categoria.
   */
  getVisibleCharts(): ChartConfig[] {
    const category = this.filterForm.get('chartCategory')?.value;
    let filtered = this.availableCharts.filter(c => c.visible);
    if (category && category !== 'all') {
      filtered = filtered.filter(c => c.category === category);
    }
    return filtered;
  }

  /**
   * Retorna a lista de gráficos que estão disponíveis para serem adicionados.
   */
  getAvailableCharts(): ChartConfig[] {
    const category = this.filterForm.get('chartCategory')?.value;
    let filtered = this.availableCharts.filter(c => !c.visible);
    if (category && category !== 'all') {
      filtered = filtered.filter(c => c.category === category);
    }
    return filtered;
  }

  /**
   * Navega para a tela de criação de uma nova bioimpedância.
   */
  onCreateNewBioimpedancia(): void {
    this.router.navigate(['/bioimpedancia', this.clientId]);
  }

  /**
   * Navega de volta para a tela de seleção de cliente.
   */
  onBack(): void {
    this.router.navigate(['/bioimpedancia/select-client']);
  }

  /**
   * Navega para a tela de visualização do cliente.
   */
  onViewClient(): void {
    this.router.navigate(['/client-dashboard', this.clientId]);
  }

  /**
   * Limpa todos os filtros do formulário.
   */
  clearFilters(): void {
    this.filterForm.patchValue({
      dateStart: null,
      dateEnd: null,
      chartCategory: 'all'
    });
  }

  /**
   * Exibe uma mensagem de erro na barra de notificação.
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Exibe uma mensagem de sucesso na barra de notificação.
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Getters
  get hasData(): boolean {
    return this.bioimpedancias.length > 0;
  }
}
