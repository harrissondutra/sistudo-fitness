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

  constructor(
    private router: Router,
    private route: ActivatedRoute, // Injeta ActivatedRoute para acessar os parâmetros da URL
    private trainningService: TrainningService
  ) { }

  ngOnInit(): void {
    // Inscreve-se para observar as mudanças nos parâmetros da rota
    this.route.paramMap.subscribe(params => {
      const trainningId = params.get('id'); // Obtém o 'id' do parâmetro da rota
      if (trainningId) {
        this.loadTrainningById(trainningId); // Carrega os dados do treino se o ID for encontrado
      } else {
        console.warn('Nenhum ID de treino encontrado nos parâmetros da rota.');
        // Opcional: Redirecionar para uma página de erro ou lista de treinos
        this.router.navigate(['/trainnings']);
      }
    });
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
        this.trainning = trainning; // Atribui o treino carregado à propriedade 'trainning'
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Erro ao carregar treino:', error);
        // Exemplo: mostrar uma mensagem de erro ao usuário usando MatSnackBar
        // this.snackBar.open('Erro ao carregar treino.', 'Fechar', { duration: 3000 });
      }
    });
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
}
