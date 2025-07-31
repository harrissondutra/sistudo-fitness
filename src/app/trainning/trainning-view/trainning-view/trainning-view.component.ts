import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { OnInit } from '@angular/core';
import { TrainningService } from '../../../services/trainning/trainning.service';
import { IonicModule } from '@ionic/angular';
import { Trainning } from '../../../models/trainning';
import { IonCard } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-trainning-view',
  standalone: true, // Componente agora é standalone
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  providers: [],
  templateUrl: './trainning-view.component.html',
  styleUrls: ['./trainning-view.component.scss']
})
export class TrainningViewComponent implements OnInit {

  // O treino será carregado com base no ID da rota
  trainning: Trainning | null = null;
  isLoading = false; // Para controlar o indicador de carregamento
  private subscription: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute, // Injeta ActivatedRoute para acessar os parâmetros da URL
    private trainningService: TrainningService
  ) { }

  ngOnInit(): void {
    // Inscreve-se para observar as mudanças nos parâmetros da rota
    this.subscription = this.route.paramMap.subscribe(params => {
      const trainningId = params.get('id'); // Obtém o 'id' do parâmetro da rota
      if (trainningId) {
        this.loadTrainningById(trainningId); // Carrega os dados do treino se o ID for encontrado
      } else {
        console.warn('Nenhum ID de treino encontrado nos parâmetros da rota.');
        this.router.navigate(['/trainnings']); // Redireciona para lista de treinos
      }
    });
  }

  ngOnDestroy(): void {
    // Limpa a subscription quando o componente é destruído
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  // Método para editar o treino, recebe o objeto Trainning
  editTrainningById(trainning: Trainning): void {
    if (trainning && trainning.id) {
      this.router.navigate(['/trainning-edit', trainning.id]);
    } else {
      console.error('Não é possível editar: treino ou ID do treino ausente.');
    }
  }

  // Método para exclusão, recebe o objeto Trainning
  onDelete(trainning: Trainning): void {
    if (trainning && trainning.id) {
      console.log('Solicitação de exclusão para o treino com ID:', trainning.id);
      // Implemente a lógica de exclusão real aqui,
      // por exemplo, chamando o serviço e depois navegando
      // this.trainningService.deleteTrainning(trainning.id).subscribe({
      //   next: () => {
      //     console.log('Treino excluído com sucesso!');
      //     this.router.navigate(['/trainnings']); // Redireciona após a exclusão
      //   },
      //   error: (err) => console.error('Erro ao excluir treino:', err)
      // });
      alert('Funcionalidade de exclusão não implementada.'); // Placeholder
    } else {
      console.error('Não é possível excluir: treino ou ID do treino ausente.');
    }
  }

  // Método para voltar à página anterior (ex: lista de treinos)
  goBack(): void {
    this.router.navigate(['/trainnings']); // Assumindo que '/trainnings' é a rota para a lista
  }

  // Carrega os dados do treino a partir do serviço
 private loadTrainningById(trainningId: string): void {
  this.isLoading = true;
  this.trainningService.getTrainningById(Number(trainningId)).subscribe({
    next: (trainning: Trainning) => {
      this.isLoading = false;

      // O serviço já deve ter convertido as datas para objetos Date
      // Mas vamos garantir aqui também
      if (trainning.startDate && !(trainning.startDate instanceof Date)) {
        console.warn('startDate não é um objeto Date após processamento do serviço');
        // Converter para Date se ainda não for
        if (Array.isArray(trainning.startDate)) {
          const [year, month, day, hour = 0, minute = 0] = trainning.startDate as any;
          trainning.startDate = new Date(year, month-1, day, hour, minute);
        }
      }

      // Mesmo para endDate
      if (trainning.endDate && !(trainning.endDate instanceof Date)) {
        console.warn('endDate não é um objeto Date após processamento do serviço');
        if (Array.isArray(trainning.endDate)) {
          const [year, month, day, hour = 0, minute = 0] = trainning.endDate as any;
          trainning.endDate = new Date(year, month-1, day, hour, minute);
        }
      }

      this.trainning = trainning;
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Erro ao carregar treino:', error);
    }
  });
}

  // Verifica se uma data é válida, independente do formato
isValidDate(dateValue: any): boolean {
  // Se for string especial já formatada
  if (typeof dateValue === 'string' &&
     (dateValue === 'Não definida' || dateValue === 'N/A')) {
    return true;
  }

  try {
    // Se for string com vírgulas
    if (typeof dateValue === 'string' && dateValue.includes(',')) {
      const parts = dateValue.split(',').map(part => parseInt(part.trim()));
      if (parts.length >= 3) {
        const testDate = new Date(parts[0], parts[1]-1, parts[2]);
        return !isNaN(testDate.getTime());
      }
      return false;
    }

    // Se for string de data ISO ou similar
    if (typeof dateValue === 'string') {
      const testDate = new Date(dateValue);
      return !isNaN(testDate.getTime());
    }

    // Se for objeto Date
    if (dateValue instanceof Date) {
      return !isNaN(dateValue.getTime());
    }

    return false;
  } catch (e) {
    console.error('Erro ao verificar validade da data:', e);
    return false;
  }
}

  // Método para formatar as datas sem depender do pipe date

  formatDate(date: Date | null): string {
  if (!date) return 'Não definida';

  try {
    // Verifica se é uma data válida
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }

    // Formata a data no padrão DD/MM/YYYY
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();

    return `${dia}/${mes}/${ano}`;
  } catch (e) {
    console.error('Erro ao formatar data:', e);
    return 'Não definida';
  }
}

// Método auxiliar para verificar se um valor é um array
isArray(value: any): boolean {
  return Array.isArray(value);
}
isStartDateArrayWithThreeElements(date: any): boolean {
  return Array.isArray(date) && date.length === 3;
}
  // O método goToTrainning parece estar fora de contexto para este componente de visualização
  // e geralmente seria usado em um componente de listagem. Mantido se houver outro uso.
  goToTrainning(id: string | number) {
    this.router.navigate(['/trainning-view', id]);
  }

  getCategoryNames(trainning: Trainning): string {
    if (!trainning || !trainning.categories || trainning.categories.length === 0) {
      return 'Sem categorias'; // Retorna uma mensagem padrão se não houver categorias
    }
    return trainning.categories.map(category => category.name).join(', '); // Junta os nomes das categorias
  }
  // Função para converter strings de data no formato "2025,7,31,3,0" para objetos Date
  parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;

    try {
      // Para string com valores separados por vírgula
      if (typeof dateValue === 'string' && dateValue.includes(',')) {
        const parts = dateValue.split(',').map(part => parseInt(part.trim()));
        // Mês é 0-indexed em JavaScript
        return new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0);
      }

      // Para string ISO
      if (typeof dateValue === 'string') {
        const d = new Date(dateValue);
        return !isNaN(d.getTime()) ? d : null;
      }

      // Se já for um Date
      if (dateValue instanceof Date) {
        return !isNaN(dateValue.getTime()) ? dateValue : null;
      }

      return null;
    } catch (e) {
      console.error('Erro ao analisar data:', e);
      return null;
    }
  }
}
