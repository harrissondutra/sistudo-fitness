import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../../services/client/client.service';
import { Client } from '../../models/client'; // Importa a interface Client atualizada
import { Measure } from '../../models/measure'; // Importa a interface Measure
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Doctor } from '../../models/doctor';
import { DoctorService } from '../../services/doctor/doctor.service'; // Importa o serviço de médico, se necessário
import { Personal } from '../../models/personal';
import { PersonalService } from '../../services/personal/personal.service';
import { NutritionistService } from '../../services/nutritionist/nutritionist.service';

@Component({
  selector: 'app-client-view',
  templateUrl: './client-view.component.html',
  styleUrls: ['./client-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatProgressSpinnerModule
  ]
})
export class ClientViewComponent implements OnInit {
  client: Client | null = null;
  isLoading = false;

  currentClientTraining: any = null;
  associatedDoctors: Doctor[] = [];
  associatedPersonals: Personal[] = [];
  associatedNutritionists: any[] = []; // Ajuste o tipo conforme necessário

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private DoctorService: DoctorService ,
    private PersonalService: PersonalService,
    private NutritionistService: NutritionistService
  ) { }

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.loadClient(clientId);
    } else {
      console.warn('ID do cliente não fornecido na URL.');
      this.snackBar.open('ID do cliente não encontrado.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/clients-list']); // Alterado para clients-list, rota correta de listagem
    }
  }

  private loadClient(id: string): void {
    this.isLoading = true;
    this.clientService.getClientById(id).subscribe({
      next: (clientData: Client) => {
        this.client = clientData;
        this.isLoading = false;
        // Não é necessário carregar 'measure' separadamente se ele já vem no objeto client
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        this.snackBar.open('Erro ao carregar dados do cliente.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/clients-list']); // Alterado para clients-list
      }
    });
  }

  formatMeasure(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '-';
    }
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  onBack(): void {
    this.router.navigate(['/clients-list']); // Alterado para clients-list
  }

  // A função onEdit() foi removida, pois editClientDetails() serve ao mesmo propósito.
  // Certifique-se de que o HTML chama editClientDetails(client.id) para edição de dados do cliente.

  editClientDetails(clientId: string | undefined): void {
    if (clientId) {
      // CORRIGIDO: O ID é passado como um segmento SEPARADO na array.
      // Esta função é para navegar para a tela de edição de dados gerais do cliente.
      this.router.navigate(['/clients-edit', clientId]);
    } else {
      this.snackBar.open('Não é possível editar: ID do Cliente não carregado.', 'Fechar', { duration: 3000 });
      console.warn('Não é possível editar: ID do Cliente não carregado.');
    }
  }

  editMeasures(clientId: string | undefined): void {
    if (clientId) {
      // Usando a nova rota dedicada para edição de medidas
      this.router.navigate(['/edit-measures', clientId]);
    } else {
      this.snackBar.open('Não é possível editar medidas: ID do Cliente não carregado.', 'Fechar', { duration: 3000 });
      console.warn('Não é possível editar medidas: ID do Cliente não carregado.');
    }
  }

  trackByTrainingId(index: number, training: any): string {
    return training.id || index.toString(); // Use o ID do treinamento ou o índice como fallback
  }

  viewTrainingDetails(trainingId: string | number): void {
    // TODO: Implement logic to view training details, e.g., open a dialog or navigate to a details page
    console.log('View training details for training ID:', trainingId);
    // Exemplo de navegação para a rota de visualização de treino, se aplicável
    // this.router.navigate(['/trainning-view', trainingId]);
  }

  deleteTraining(trainingId: string): void {
    // TODO: Implement the logic to delete a training by its ID.
    // Example: Call a service to delete the training and update the UI accordingly.
    console.log('Deleting training with ID:', trainingId);
  }

  assignNewTraining(): void {
    // TODO: Implement logic to assign a new training, e.g., navigate to trainning-create
    console.log('Assigning new training.');
    this.router.navigate(['/trainning-create']);
  }

  getDoctorByClientId(clientId: number): void {
    // Implementa a lógica para obter o médico associado ao cliente, se necessário
    this.DoctorService.getDoctorByClientId(clientId).subscribe({
      next: (doctor: Doctor[]) => {
        console.log('Médico(s) associado(s) ao cliente:', doctor);
        // Aqui você pode armazenar o médico em uma variável ou exibir em um modal
      },
      error: (error) => {
        console.error('Erro ao obter médico por ID do cliente:', error);
        this.snackBar.open('Erro ao obter médico associado.', 'Fechar', { duration: 3000 });
      }
    });
  }

  getPersonalByClientId(clientId: number): void {
    // Implementa a lógica para obter o personal associado ao cliente, se necessário
    this.PersonalService.getPersonalByClientId(clientId).subscribe({
      next: (personal: Personal[]) => {
        console.log('Personal(s) associado(s) ao cliente:', personal);
        // Aqui você pode armazenar o personal em uma variável ou exibir em um modal
      },
      error: (error) => {
        console.error('Erro ao obter personal por ID do cliente:', error);
        this.snackBar.open('Erro ao obter personal associado.', 'Fechar', { duration: 3000 });
      }
    });
  }

  getNutritionistByClientId(clientId: number): void {
    // Implementa a lógica para obter o nutricionista associado ao cliente, se necessário
    this.NutritionistService.getNutritionistByClientId(clientId).subscribe({
      next: (nutritionists: any[]) => {
        console.log('Nutricionista(s) associado(s) ao cliente:', nutritionists);
        // Aqui você pode armazenar o nutricionista em uma variável ou exibir em um modal
      },
      error: (error) => {
        console.error('Erro ao obter nutricionista por ID do cliente:', error);
        this.snackBar.open('Erro ao obter nutricionista associado.', 'Fechar', { duration: 3000 });
      }
    });
  }


}
