import { ClientService } from './../../services/client/client.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Client } from '../../models/client'; // Importa a interface Client atualizada
import { Measure } from '../../models/measure'; // Importa a interface Measure
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Doctor } from '../../models/doctor';
import { DoctorService } from '../../services/doctor/doctor.service'; // Importa o serviço de médico
import { Personal } from '../../models/personal';
import { PersonalService } from '../../services/personal/personal.service';
import { NutritionistService } from '../../services/nutritionist/nutritionist.service';
import { MatCheckboxModule } from '@angular/material/checkbox'; // Usar MatCheckboxModule
import { Nutritionist } from '../../models/nutritionist';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component'; // Ajuste o caminho conforme necessário
import { TrainningService } from '../../services/trainning/trainning.service';

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
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDialogModule
  ]
})
export class ClientViewComponent implements OnInit {
  client: Client | null = null;
  isLoading = false;

  currentClientTraining: any = null;
  clientTrainings: any[] = []; // Array para armazenar todos os treinos
  associatedDoctors: Doctor[] = [];
  associatedPersonals: Personal[] = [];
  associatedNutritionists: any[] = []; // Ajuste o tipo conforme necessário

  showAddDoctorDialog: boolean = false;
  showAddPersonalDialog: boolean = false;
  showAddNutritionistDialog: boolean = false;
  availableDoctors: Doctor[] = []; // Lista de todos os médicos disponíveis no sistema
  availablePersonals: any[] = [];
  availableNutritionists: any[] = []; // Lista de todos os nutricionistas disponíveis no sistema
  selectedPersonalIds: Set<string> = new Set(); // IDs dos personals selecionados no diálogo
  selectedClientForPersonal?: string; // Adiciona a propriedade para armazenar o clientId selecionado para o personal
  selectedClientForNutritionist?: string; // Adiciona a propriedade para armazenar o clientId selecionado para o nutricionista
  selectedNutritionistIds: Set<string> = new Set(); // IDs dos nutricionistas
  selectedDoctorIds: Set<string> = new Set(); // IDs dos médicos selecionados no diálogo
  selectedClientIdForDoctor?: string; // Adiciona a propriedade para armazenar o clientId selecionado para o médico

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private doctorService: DoctorService, // Renomeado para seguir convenção
    private personalService: PersonalService,
    private nutritionistService: NutritionistService,
    private dialog: MatDialog,
    private trainningService: TrainningService
  ) { }

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.loadClient(clientId);
      this.loadAssociatedProfessionals(clientId);
      this.loadClientTrainings(clientId);
    } else {
      console.warn('ID do cliente não fornecido na URL.');
      this.snackBar.open('ID do cliente não encontrado.', 'Fechar', { duration: 3000 });
      this.router.navigate(['/clients-list']);
    }
  }
  private loadClient(id: string): void {
    this.isLoading = true;
    this.clientService.getClientById(id).subscribe({
      next: (clientData: Client) => {
        console.log('Cliente recebido:', clientData);
        console.log('Data de nascimento (tipo):', typeof clientData.dateOfBirth);
        console.log('Data de nascimento (valor):', clientData.dateOfBirth);

        this.client = clientData;

        // Tratar dateOfBirth quando é um array (como está chegando do backend)
        if (this.client?.dateOfBirth && Array.isArray(this.client.dateOfBirth)) {
          try {
            const [year, month, day, hour = 0, minute = 0] = this.client.dateOfBirth as any[];
            this.client.dateOfBirth = new Date(year, month - 1, day, hour, minute);
            console.log('Data convertida de array:', this.client.dateOfBirth);
          } catch (error) {
            console.error('Erro ao converter data de array:', error);
            this.client.dateOfBirth = undefined;
          }
        }
        // Código existente - tratar quando é string
        else if (this.client?.dateOfBirth && typeof this.client.dateOfBirth === 'string') {
          // Seu código atual para processar strings...
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar dados do cliente.', 'Fechar', { duration: 3000 });
      }
    });
  }

  private loadAssociatedProfessionals(clientId: string): void {
    console.log(`Carregando profissionais para o cliente ID: ${clientId}`);

    // Carregar médicos associados (este é o método correto para buscar médicos ASSOCIADOS)
    this.doctorService.getDoctorByClientId(Number(clientId)).subscribe({
      next: (doctors: Doctor[]) => {
        console.log('Médicos associados recebidos:', doctors);
        this.associatedDoctors = doctors;
      },
      error: (err) => console.error('Erro ao carregar médicos associados:', err)
    });

    // Carregar personals associados
    this.personalService.getPersonalByClientId(Number(clientId)).subscribe({
      next: (response: Personal | Personal[]) => {
        console.log('Personals associados recebidos:', response);

        // Verifica se a resposta é um objeto único ou um array
        if (Array.isArray(response)) {
          this.associatedPersonals = response;
        } else if (response) {
          // Se for um objeto único, coloca-o em um array
          this.associatedPersonals = [response];
        } else {
          this.associatedPersonals = [];
        }
      },
      error: (err) => {
        // Verifica se é o erro específico de "Personal não cadastrado para o cliente"
        if (err && err.message && err.message.includes('Personal não cadastrado para o cliente')) {
          console.log('Nenhum personal associado a este cliente - tratando como array vazio');
          this.associatedPersonals = []; // Define como array vazio em vez de mostrar erro
        } else {
          console.error('Erro ao carregar personals associados:', err);
          this.snackBar.open('Erro ao carregar personals associados.', 'Fechar', { duration: 3000 });
        }
      }
    });

    // Carregar nutricionistas associados
    this.nutritionistService.getNutritionistByClientId(Number(clientId)).subscribe({
      next: (response: any) => {
        console.log('Nutricionistas associados recebidos:', response);

        // Verifica se a resposta é um objeto único ou um array
        if (Array.isArray(response)) {
          this.associatedNutritionists = response;
        } else if (response) {
          // Se for um objeto único, coloca-o em um array
          this.associatedNutritionists = [response];
        } else {
          this.associatedNutritionists = [];
        }
      },
      error: (err) => {
        console.error('Erro ao carregar nutricionistas associados:', err);
        // Define como array vazio em caso de erro
        this.associatedNutritionists = [];
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
    this.router.navigate(['/clients-list']);
  }

  editClientDetails(clientId: string | undefined): void {
    if (clientId) {
      this.router.navigate(['/clients-edit', clientId]);
    } else {
      this.snackBar.open('Não é possível editar: ID do Cliente não carregado.', 'Fechar', { duration: 3000 });
      console.warn('Não é possível editar: ID do Cliente não carregado.');
    }
  }

  editMeasures(clientId: string | undefined): void {
    if (clientId) {
      this.router.navigate(['/edit-measures', clientId]);
    } else {
      this.snackBar.open('Não é possível editar medidas: ID do Cliente não carregado.', 'Fechar', { duration: 3000 });
      console.warn('Não é possível editar medidas: ID do Cliente não carregado.');
    }
  }

  trackByTrainingId(index: number, training: any): string {
    return training.id || index.toString();
  }

  // Removed duplicate implementation of viewTrainingDetails

  deleteTraining(trainingId: string): void {
    console.log('Deleting training with ID:', trainingId);
    // Implemente a lógica para deletar um treino.
  }

  assignNewTraining(): void {
    console.log('Assigning new training.');
    this.router.navigate(['/trainning-create', this.client?.id]); // Passa o ID do cliente para a criação do treino
  }

  // ============== Lógica para Adicionar/Selecionar Médico ==============

  openAddDoctorDialog(): void {
    if (!this.client?.id) {
      this.snackBar.open('Não é possível adicionar médico: ID do cliente não disponível.', 'Fechar', { duration: 3000 });
      return;
    }

    // Carrega todos os médicos disponíveis no sistema
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors: Doctor[]) => {
        this.availableDoctors = doctors;
        // Pré-seleciona os médicos já associados
        this.selectedDoctorIds = new Set(this.associatedDoctors.map(d => d.id!.toString()));
        this.showAddDoctorDialog = true;
      },
      error: (error) => {
        console.error('Erro ao carregar médicos disponíveis:', error);
        this.snackBar.open('Erro ao carregar médicos disponíveis.', 'Fechar', { duration: 3000 });
      }
    });
  }

  openAddPersonalDialog(): void {
    if (!this.client?.id) {
      this.snackBar.open('Não é possível adicionar personal: ID do cliente não disponível.', 'Fechar', { duration: 3000 });
      return;
    }

    // Carrega todos os personals disponíveis no sistema
    this.personalService.getAllPersonal().subscribe({
      next: (personals: Personal[]) => {
        this.availablePersonals = personals; // CORRIGIDO: atribui à availablePersonals e não à associatedPersonals

        // Pré-seleciona os personals já associados
        this.selectedPersonalIds = new Set(this.associatedPersonals.map(p => p.id!.toString()));

        this.showAddPersonalDialog = true; // Abre o diálogo após carregar os dados
      },
      error: (error) => {
        console.error('Erro ao carregar personals disponíveis:', error);
        this.snackBar.open('Erro ao carregar personals disponíveis.', 'Fechar', { duration: 3000 });
      }
    });
  }

  openAddNutritionistDialog(): void {
    if (!this.client?.id) {
      this.snackBar.open('Não é possível adicionar nutricionista: ID do cliente não disponível.', 'Fechar', { duration: 3000 });
      return;
    }

    // Carrega todos os nutricionistas disponíveis no sistema
    this.nutritionistService.getAllNutritionists().subscribe({
      next: (nutritionists: Nutritionist[]) => {
        console.log('Nutricionistas disponíveis:', nutritionists);

        // Verificar detalhadamente o primeiro nutricionista
        if (nutritionists && nutritionists.length > 0) {
          console.log('Primeiro nutricionista:', nutritionists[0]);
          console.log('Tipo do ID:', typeof nutritionists[0].id);
          console.log('Valor do ID:', nutritionists[0].id);
          console.log('Propriedades disponíveis:', Object.keys(nutritionists[0]));
        }

        this.availableNutritionists = nutritionists;

        // Pré-seleciona os nutricionistas já associados com segurança
        this.selectedNutritionistIds = new Set(
          this.associatedNutritionists
            .filter(n => n && n.id) // Garante que só nutricionistas com ID serão considerados
            .map(n => n.id?.toString() || '')
        );

        this.showAddNutritionistDialog = true;
      },
      error: (error) => {
        console.error('Erro ao carregar nutricionistas disponíveis:', error);
        this.snackBar.open('Erro ao carregar nutricionistas disponíveis.', 'Fechar', { duration: 3000 });
      }
    });
  }

  closeAddDoctorDialog(): void {
    this.showAddDoctorDialog = false;
  }

  closeAddPersonalDialog(): void {
    this.showAddPersonalDialog = false;
  }

  isDoctorSelected(doctorId: string): boolean {
    return this.selectedDoctorIds.has(doctorId);
  }

  toggleDoctorSelection(doctorId: string): void {
    if (this.selectedDoctorIds.has(doctorId)) {
      this.selectedDoctorIds.delete(doctorId);
    } else {
      this.selectedDoctorIds.add(doctorId);
    }
  }

  saveSelectedDoctors(): void {
    if (!this.client?.id) {
      this.snackBar.open('ID do cliente não disponível para salvar médicos.', 'Fechar', { duration: 3000 });
      return;
    }

    // Verificar se há médicos selecionados
    if (this.selectedDoctorIds.size === 0) {
      this.snackBar.open('Nenhum médico selecionado.', 'Fechar', { duration: 3000 });
      return;
    }

    // No saveSelectedDoctors()
    const selectedDoctorIds = Array.from(this.selectedDoctorIds).map(id => Number(id));

    this.doctorService.associateDoctorToClient(this.client.id, selectedDoctorIds)
      .subscribe({
        next: (updatedClient) => {
          this.snackBar.open('Médicos associados com sucesso!', 'Fechar', { duration: 3000 });
          this.client = updatedClient;
          this.closeAddDoctorDialog();
          this.loadAssociatedProfessionals(updatedClient.id!.toString());
        },
        error: (error) => {
          console.error('Erro ao associar médicos:', error);
          this.snackBar.open('Erro ao associar médicos.', 'Fechar', { duration: 3000 });
        }
      });
  }
  addDoctorToClient(clientId: string): void {
    // Implement your logic here, e.g., open a dialog or set a flag
    this.showAddDoctorDialog = true;
    // Optionally store the clientId if needed
    this.selectedClientIdForDoctor = clientId;
  }

  // Métodos para Personal e Nutricionista (a serem expandidos com lógica de diálogo/seleção)
  addPersonalToClient(clientId: string): void {
    console.log('Adicionando personal ao cliente com ID:', clientId);
    // Lógica para abrir diálogo de seleção de personal ou navegar para criação
    this.router.navigate(['/personal-create', clientId]);
  }

  saveSelectedNutritionists(): void {
    if (!this.client?.id) {
      this.snackBar.open('ID do cliente não disponível para salvar nutricionistas.', 'Fechar', { duration: 3000 });
      return;
    }

    console.log('Conteúdo do Set selectedNutritionistIds:', Array.from(this.selectedNutritionistIds));

    // Verificar se há nutricionistas selecionados
    if (this.selectedNutritionistIds.size === 0) {
      this.snackBar.open('Nenhum nutricionista selecionado.', 'Fechar', { duration: 3000 });
      return;
    }

    // Filtrar IDs inválidos e convertê-los para números
    const selectedNutritionistIds = Array.from(this.selectedNutritionistIds)
      .filter(id => {
        const isValid = id && id.trim() !== '' && id !== '0';
        if (!isValid) console.log(`Removendo ID inválido: "${id}"`);
        return isValid;
      })
      .map(id => {
        const numId = Number(id);
        console.log(`Convertendo ID "${id}" para número: ${numId}`);
        return numId;
      })
      .filter(numId => {
        const isValid = !isNaN(numId) && numId > 0;
        if (!isValid) console.log(`Removendo número inválido: ${numId}`);
        return isValid;
      });

    console.log('IDs de nutricionistas após filtragem:', selectedNutritionistIds);

    // Verificar se ainda há IDs válidos após a filtragem
    if (selectedNutritionistIds.length === 0) {
      this.snackBar.open('Nenhum ID de nutricionista válido foi selecionado.', 'Fechar', { duration: 3000 });
      return;
    }

    // Chama o serviço para associar os nutricionistas ao cliente
    this.nutritionistService.associateNutritionistToClient(this.client.id, selectedNutritionistIds)
      .subscribe({
        next: (updatedClient) => {
          this.snackBar.open('Nutricionistas associados com sucesso!', 'Fechar', { duration: 3000 });
          this.client = updatedClient;
          this.closeAddNutritionistDialog();
          this.loadAssociatedProfessionals(updatedClient.id!.toString());
        },
        error: (error) => {
          console.error('Erro ao associar nutricionistas:', error);
          const errorMsg = error.error?.message || error.message || 'Erro desconhecido';
          this.snackBar.open(`Erro ao associar nutricionistas: ${errorMsg}`, 'Fechar', { duration: 5000 });
        }
      });
  }

  togglePersonalSelection(personalId: string): void {
    if (this.selectedPersonalIds.has(personalId)) {
      this.selectedPersonalIds.delete(personalId);
    } else {
      this.selectedPersonalIds.add(personalId);
    }
  }

  isPersonalSelected(personalId: string): boolean {
    return this.selectedPersonalIds.has(personalId);
  }

  saveSelectedPersonals(): void {
    if (!this.client?.id) {
      this.snackBar.open('ID do cliente não disponível para salvar personals.', 'Fechar', { duration: 3000 });
      return;
    }

    // Verificar se há personals selecionados
    if (this.selectedPersonalIds.size === 0) {
      this.snackBar.open('Nenhum personal trainer selecionado.', 'Fechar', { duration: 3000 });
      return;
    }

    // Converte os IDs dos personals selecionados para números
    const selectedPersonalIds = Array.from(this.selectedPersonalIds).map(id => Number(id));

    this.personalService.associatePersonalToClient(this.client.id, selectedPersonalIds)
      .subscribe({
        next: (updatedClient) => {
          this.snackBar.open('Personal trainers associados com sucesso!', 'Fechar', { duration: 3000 });
          this.client = updatedClient;
          this.closeAddPersonalDialog();
          this.loadAssociatedProfessionals(updatedClient.id!.toString());
        },
        error: (error) => {
          console.error('Erro ao associar personal trainers:', error);
          this.snackBar.open('Erro ao associar personal trainers.', 'Fechar', { duration: 3000 });
        }
      });
  }

  closeAddNutritionistDialog(): void {
    this.showAddNutritionistDialog = false;
  }

  toggleNutritionistSelection(nutritionistId: string): void {
    console.log(`Toggle nutricionista ID: "${nutritionistId}"`);

    // Valida o ID antes de qualquer operação
    if (!nutritionistId || nutritionistId === 'null' || nutritionistId === 'undefined' || nutritionistId === '0') {
      console.error('Tentativa de selecionar ID inválido:', nutritionistId);
      this.snackBar.open('ID de nutricionista inválido', 'Fechar', { duration: 3000 });
      return;
    }

    if (this.selectedNutritionistIds.has(nutritionistId)) {
      this.selectedNutritionistIds.delete(nutritionistId);
      console.log(`Removido nutricionista ID ${nutritionistId}, Total: ${this.selectedNutritionistIds.size}`);
    } else {
      this.selectedNutritionistIds.add(nutritionistId);
      console.log(`Adicionado nutricionista ID ${nutritionistId}, Total: ${this.selectedNutritionistIds.size}`);
    }
  }

  isNutritionistSelected(nutritionistId: string): boolean {
    return this.selectedNutritionistIds.has(nutritionistId);
  }



  trackByDoctorId(index: number, doctor: any): any {
    return doctor?.id;
  }

  trackByPersonalId(index: number, personal: any): string | number {
    return personal && personal.id != null ? personal.id : index;
  }

  trackByNutritionistId(index: number, nutritionist: any): any {
    return nutritionist?.id || index;
  }

  // Método para desassociar um único médico
  removeDoctor(doctor: Doctor): void {
    if (!this.client?.id) {
      this.snackBar.open('ID do cliente não disponível.', 'Fechar', { duration: 3000 });
      return;
    }

    const doctorName = doctor.name || 'Selecionado';

    // Abre diálogo de confirmação do Material
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Desassociação',
        message: `Deseja realmente desassociar o médico ${doctorName}?`,
        confirmText: 'Desassociar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.client?.id !== undefined && doctor.id !== undefined) {
          this.doctorService.disassociateDoctorsFromClient(this.client.id, [doctor.id])
            .subscribe({
              next: (updatedClient) => {
                this.snackBar.open('Médico desassociado com sucesso!', 'Fechar', { duration: 3000 });
                this.client = updatedClient;
                this.loadAssociatedProfessionals(updatedClient.id!.toString());
              },
              error: (error) => {
                console.error('Erro ao desassociar médico:', error);
                this.snackBar.open('Erro ao desassociar médico.', 'Fechar', { duration: 3000 });
              }
            });
        } else {
          this.snackBar.open('ID do cliente ou médico inválido.', 'Fechar', { duration: 3000 });
        }
      }
    });
  }

  // Método para desassociar múltiplos médicos selecionados
  // Método para desassociar múltiplos médicos selecionados
  removeSelectedDoctors(): void {
    if (!this.client?.id) {
      this.snackBar.open('ID do cliente não disponível.', 'Fechar', { duration: 3000 });
      return;
    }

    if (this.selectedDoctorIds.size === 0) {
      this.snackBar.open('Nenhum médico selecionado para desassociar.', 'Fechar', { duration: 3000 });
      return;
    }

    const doctorCount = this.selectedDoctorIds.size;

    // Abre diálogo de confirmação do Material
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Desassociação',
        message: `Deseja realmente desassociar ${doctorCount} médico(s)?`,
        confirmText: 'Desassociar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const selectedDoctorIds = Array.from(this.selectedDoctorIds).map(id => Number(id));

        this.doctorService.disassociateDoctorsFromClient(Number(this.client!.id), selectedDoctorIds)
          .subscribe({
            next: (updatedClient) => {
              this.snackBar.open('Médicos desassociados com sucesso!', 'Fechar', { duration: 3000 });
              this.client = updatedClient;
              this.selectedDoctorIds.clear();
              this.closeAddDoctorDialog();
              this.loadAssociatedProfessionals(updatedClient.id!.toString());
            },
            error: (error) => {
              console.error('Erro ao desassociar médicos:', error);
              this.snackBar.open('Erro ao desassociar médicos.', 'Fechar', { duration: 3000 });
            }
          });
      }
    });
  }
  // Método para desassociar um único personal
  removePersonal(personal: Personal): void {
    if (!this.client?.id) {
      this.snackBar.open('ID do cliente não disponível.', 'Fechar', { duration: 3000 });
      return;
    }

    const personalName = personal.name || 'Selecionado';

    // Abre diálogo de confirmação do Material
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Desassociação',
        message: `Deseja realmente desassociar o personal ${personalName}?`,
        confirmText: 'Desassociar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.client?.id !== undefined && personal.id !== undefined) {
          this.personalService.disassociatePersonalsFromClient(this.client.id, [personal.id])
            .subscribe({
              next: (updatedClient) => {
                this.snackBar.open('Personal desassociado com sucesso!', 'Fechar', { duration: 3000 });
                this.client = updatedClient;
                this.loadAssociatedProfessionals(updatedClient.id!.toString());
              },
              error: (error) => {
                console.error('Erro ao desassociar personal:', error);
                this.snackBar.open('Erro ao desassociar personal.', 'Fechar', { duration: 3000 });
              }
            });
        } else {
          this.snackBar.open('ID do cliente ou personal inválido.', 'Fechar', { duration: 3000 });
        }
      }
    });
  }

  // Método para desassociar múltiplos personals selecionados
  removeSelectedPersonals(): void {
    if (!this.client?.id) {
      this.snackBar.open('ID do cliente não disponível.', 'Fechar', { duration: 3000 });
      return;
    }

    if (this.selectedPersonalIds.size === 0) {
      this.snackBar.open('Nenhum personal selecionado para desassociar.', 'Fechar', { duration: 3000 });
      return;
    }

    const personalCount = this.selectedPersonalIds.size;

    // Abre diálogo de confirmação do Material
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Desassociação',
        message: `Deseja realmente desassociar ${personalCount} personal(s)?`,
        confirmText: 'Desassociar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const selectedPersonalIds = Array.from(this.selectedPersonalIds).map(id => Number(id));

        this.personalService.disassociatePersonalsFromClient(Number(this.client!.id), selectedPersonalIds)
          .subscribe({
            next: (updatedClient) => {
              this.snackBar.open('Personals desassociados com sucesso!', 'Fechar', { duration: 3000 });
              this.client = updatedClient;
              this.selectedPersonalIds.clear();
              this.closeAddPersonalDialog();
              this.loadAssociatedProfessionals(updatedClient.id!.toString());
            },
            error: (error) => {
              console.error('Erro ao desassociar personals:', error);
              this.snackBar.open('Erro ao desassociar personals.', 'Fechar', { duration: 3000 });
            }
          });
      }
    });
  }

  // Método para desassociar um único nutricionista
  removeNutritionist(nutritionist: Nutritionist): void {
    if (!this.client?.id) {
      this.snackBar.open('ID do cliente não disponível.', 'Fechar', { duration: 3000 });
      return;
    }

    const nutritionistName = nutritionist.name || 'Selecionado';

    // Abre diálogo de confirmação do Material
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Desassociação',
        message: `Deseja realmente desassociar o nutricionista ${nutritionistName}?`,
        confirmText: 'Desassociar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.client?.id !== undefined && nutritionist.id !== undefined) {
          this.nutritionistService.disassociateNutritionistsFromClient(this.client.id, [nutritionist.id])
            .subscribe({
              next: (updatedClient) => {
                this.snackBar.open('Nutricionista desassociado com sucesso!', 'Fechar', { duration: 3000 });
                this.client = updatedClient;
                this.loadAssociatedProfessionals(updatedClient.id!.toString());
              },
              error: (error) => {
                console.error('Erro ao desassociar nutricionista:', error);
                this.snackBar.open('Erro ao desassociar nutricionista.', 'Fechar', { duration: 3000 });
              }
            });
        } else {
          this.snackBar.open('ID do cliente ou nutricionista inválido.', 'Fechar', { duration: 3000 });
        }
      }
    });
  }

  // Método para desassociar múltiplos nutricionistas selecionados
removeSelectedNutritionists(): void {
  if (!this.client?.id) {
    this.snackBar.open('ID do cliente não disponível.', 'Fechar', { duration: 3000 });
    return;
  }

  if (this.selectedNutritionistIds.size === 0) {
    this.snackBar.open('Nenhum nutricionista selecionado para desassociar.', 'Fechar', { duration: 3000 });
    return;
  }

  const nutritionistCount = this.selectedNutritionistIds.size;

  // Abre diálogo de confirmação do Material
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: 'Confirmar Desassociação',
      message: `Deseja realmente desassociar ${nutritionistCount} nutricionista(s)?`,
      confirmText: 'Desassociar',
      cancelText: 'Cancelar'
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      const selectedNutritionistIds = Array.from(this.selectedNutritionistIds)
        .filter(id => id && id !== '0')
        .map(id => Number(id));

      this.nutritionistService.disassociateNutritionistsFromClient(Number(this.client!.id), selectedNutritionistIds)
        .subscribe({
          next: (updatedClient) => {
            this.snackBar.open('Nutricionistas desassociados com sucesso!', 'Fechar', { duration: 3000 });
            this.client = updatedClient;
            this.selectedNutritionistIds.clear();
            this.closeAddNutritionistDialog();
            this.loadAssociatedProfessionals(updatedClient.id!.toString());
          },
          error: (error) => {
            console.error('Erro ao desassociar nutricionistas:', error);
            this.snackBar.open('Erro ao desassociar nutricionistas.', 'Fechar', { duration: 3000 });
          }
        });
    }
  });
}

private loadClientTrainings(clientId: string): void {
  this.trainningService.getTrainningByClientId(Number(clientId)).subscribe({
    next: (trainings) => {
      console.log('Treinos do cliente carregados:', trainings);
      this.clientTrainings = trainings || [];

      // Se houver treinos, define o primeiro como atual (ou outro critério)
      this.currentClientTraining = this.clientTrainings.length > 0 ?
        this.clientTrainings[0] : null;
    },
    error: (error) => {
      console.error('Erro ao carregar treinos do cliente:', error);
      this.clientTrainings = [];
      this.currentClientTraining = null;
      this.snackBar.open('Erro ao carregar treinos do cliente.', 'Fechar', { duration: 3000 });
    }
  });
}

setCurrentTraining(training: any): void {
  this.currentClientTraining = training;
  console.log('Treino selecionado:', training);
}

// Adicione console.logs para debugging
isValidDate(dateValue: any): boolean {
  return this.parseDate(dateValue) !== null;
}

// Método para visualizar detalhes do treino
viewTrainingDetails(training: any): void {
  if (!training) return;

  // Cria uma cópia do treino
  const trainingCopy = { ...training };

  // Converte as datas se necessário
  if (trainingCopy.startDate) {
    const parsedDate = this.parseDate(trainingCopy.startDate);
    if (parsedDate) {
      trainingCopy.startDate = parsedDate;
    }
  }

  if (trainingCopy.endDate) {
    const parsedDate = this.parseDate(trainingCopy.endDate);
    if (parsedDate) {
      trainingCopy.endDate = parsedDate;
    }
  }

  this.currentClientTraining = trainingCopy;

  // Scroll para a seção
  setTimeout(() => {
    document.querySelector('.current-training-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 100);
}

// Método para definir um treino como o atual
setAsCurrentTraining(training: any): void {
  this.currentClientTraining = training;
  this.snackBar.open(`"${training.name}" definido como treino atual`, 'Fechar', { duration: 3000 });
}

// Adicione ao client-view.component.ts
parseDate(dateValue: any): Date | null {
  if (!dateValue) return null;

  try {
    // Para array como [2025, 7, 31, 3, 0]
    if (Array.isArray(dateValue)) {
      const [year, month, day, hour = 0, minute = 0] = dateValue;
      return new Date(year, month-1, day, hour, minute);
    }

    // Para string com formato "2025,7,31,3,0"
    if (typeof dateValue === 'string' && dateValue.includes(',')) {
      const parts = dateValue.split(',').map(part => parseInt(part.trim()));
      return new Date(parts[0], parts[1]-1, parts[2], parts[3] || 0, parts[4] || 0);
    }

    // Se já for um objeto Date
    if (dateValue instanceof Date) {
      return dateValue;
    }

    // Para outros formatos de string
    return new Date(dateValue);
  } catch (e) {
    console.error('Erro ao converter data:', e, dateValue);
    return null;
  }
}

}
