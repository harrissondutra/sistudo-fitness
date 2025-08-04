import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { Subject, takeUntil, finalize, catchError, of } from 'rxjs';

// Services
import { ClientService } from './../../services/client/client.service';
import { DoctorService } from '../../services/doctor/doctor.service';
import { PersonalService } from '../../services/personal/personal.service';
import { NutritionistService } from '../../services/nutritionist/nutritionist.service';
import { TrainningService } from '../../services/trainning/trainning.service';
import { MeasureService } from '../../services/measure/measure.service';

// Models
import { Client } from '../../models/client';
import { Measure } from '../../models/measure';
import { Doctor } from '../../models/doctor';
import { Personal } from '../../models/personal';
import { Nutritionist } from '../../models/nutritionist';
import { Trainning } from '../../models/trainning';

// Components
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

interface PanelState {
  measures: boolean;
  doctors: boolean;
  personals: boolean;
  nutritionists: boolean;
  trainings: boolean;
  history: boolean;
}

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
    MatDialogModule,
    RouterModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatExpansionModule
  ]
})
export class ClientViewComponent implements OnInit, OnDestroy {
  // Client data
  client: Client | null = null;
  editingClient = false;
  editableClient: Partial<Client> = {};

  // Measures data
  editingMeasures = false;
  editableMeasures: Partial<Measure> = {};

  // Training data
  currentClientTraining: Trainning | null = null;
  clientTrainings: Trainning[] = [];
  inactiveTrainings: Trainning[] = [];
  expandedExercisesMap = new Map<string, boolean>();

  // Associated professionals
  associatedDoctors: Doctor[] = [];
  associatedPersonals: Personal[] = [];
  associatedNutritionists: Nutritionist[] = [];

  // Selection dialogs
  showAddDoctorDialog = false;
  showAddPersonalDialog = false;
  showAddNutritionistDialog = false;

  // Available professionals for selection
  availableDoctors: Doctor[] = [];
  availablePersonals: Personal[] = [];
  availableNutritionists: Nutritionist[] = [];

  // Selected professional IDs
  selectedDoctorIds = new Set<string>();
  selectedPersonalIds = new Set<string>();
  selectedNutritionistIds = new Set<string>();

  // UI state
  isLoading = false;
  panelOpenState: PanelState = {
    measures: false,
    doctors: false,
    personals: false,
    nutritionists: false,
    trainings: false,
    history: false
  };

  private createEmptyMeasure(): Partial<Measure> {
    return {
      // Utilizando os nomes de propriedades do backend
      ombro: undefined,
      cintura: undefined,
      quadril: undefined,
      panturrilha_direita: undefined,
      panturrilha_esquerda: undefined,
      braco_direito: undefined,  // Usando o formato do backend
      braco_esquerdo: undefined, // Usando o formato do backend
      coxa_direita: undefined,
      coxa_esquerda: undefined,
      peitoral: undefined,
      abdomem: undefined,
      abdominal: undefined,
      suprailiaca: undefined,
      subescapular: undefined,
      triceps: undefined,
      axilar: undefined,
      torax: undefined,
      // Campo adicional para data da medição
      data: new Date()
    };
  }

  // Subscription cleanup
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private doctorService: DoctorService,
    private personalService: PersonalService,
    private nutritionistService: NutritionistService,
    private dialog: MatDialog,
    private trainningService: TrainningService,
    private measureService: MeasureService
  ) { }

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    console.log('🔍 ClientViewComponent - ID bruto da rota:', clientId);
    console.log('🔍 ClientViewComponent - Tipo do ID:', typeof clientId);
    console.log('🔍 ClientViewComponent - URL completa:', this.router.url);
    console.log('🔍 ClientViewComponent - Parâmetros da rota:', this.route.snapshot.paramMap);
    
    // Testa conversão para número
    if (clientId) {
      console.log('🔍 ClientViewComponent - Number(clientId):', Number(clientId));
      console.log('🔍 ClientViewComponent - isNaN(Number(clientId)):', isNaN(Number(clientId)));
      console.log('🔍 ClientViewComponent - clientId !== "NaN":', clientId !== 'NaN');
    }
    
    if (clientId && clientId !== 'NaN' && !isNaN(Number(clientId))) {
      this.initializeClient(clientId);
    } else {
      console.error('❌ ID do cliente inválido:', clientId);
      this.handleError('ID do cliente não fornecido ou inválido na URL.');
      this.navigateToClientsList();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============== Client Initialization Methods ==============

  private initializeClient(clientId: string): void {
    this.loadClient(clientId);
    // Carrega dados associados de forma independente, sem bloquear a tela
    this.loadAssociatedProfessionalsAsync(clientId);
    this.loadClientTrainingsAsync(clientId);
  }

  private loadClient(id: string): void {
    this.isLoading = true;
    this.clientService.getClientById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(error => {
          this.handleError('Erro ao carregar dados do cliente.', error);
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(clientData => {
        if (clientData) {
          this.client = clientData;
          this.processClientData();
          // Carrega medidas de forma assíncrona e independente
          this.loadClientMeasures(id);
        } else {
          this.navigateToClientsList();
        }
      });
  }

  private processClientData(): void {
    if (!this.client?.dateOfBirth) return;

    // Handle dateOfBirth as array format
    if (Array.isArray(this.client.dateOfBirth)) {
      try {
        const [year, month, day, hour = 0, minute = 0] = this.client.dateOfBirth as any[];
        this.client.dateOfBirth = new Date(year, month - 1, day, hour, minute);
      } catch (error) {
        console.error('Error converting date from array:', error);
        this.client.dateOfBirth = undefined;
      }
    }
    // Handle dateOfBirth as string format
    else if (typeof this.client.dateOfBirth === 'string') {
      const parsedDate = this.parseDate(this.client.dateOfBirth);
      this.client.dateOfBirth = parsedDate !== null ? parsedDate : undefined;
    }
  }

  private loadClientMeasures(clientId: string): void {
    // Não define isLoading aqui para não bloquear a interface
    this.measureService.getMeasureByClientId(Number(clientId))
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.warn('Nenhuma medida encontrada para o cliente ou erro ao carregar:', error);
          return of(null);
        })
      )
      .subscribe(measureData => {
        if (this.client && measureData) {
          this.client.measure = measureData;
        }
      });
  }

  private loadAssociatedProfessionals(clientId: string): void {
    this.loadAssociatedDoctors(clientId);
    this.loadAssociatedPersonals(clientId);
    this.loadAssociatedNutritionists(clientId);
  }

  // Método assíncrono que não bloqueia o carregamento principal
  private loadAssociatedProfessionalsAsync(clientId: string): void {
    // Executa em paralelo sem bloquear a interface
    Promise.all([
      this.loadAssociatedDoctorsAsync(clientId),
      this.loadAssociatedPersonalsAsync(clientId),
      this.loadAssociatedNutritionistsAsync(clientId)
    ]).catch(error => {
      console.warn('Alguns dados de profissionais não puderam ser carregados:', error);
    });
  }

  private loadAssociatedDoctors(clientId: string): void {
    this.doctorService.getDoctorByClientId(Number(clientId))
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading associated doctors:', error);
          return of([]);
        })
      )
      .subscribe(doctors => {
        this.associatedDoctors = doctors || [];
      });
  }

  // Método assíncrono para carregar médicos
  private async loadAssociatedDoctorsAsync(clientId: string): Promise<void> {
    try {
      const doctors = await this.doctorService.getDoctorByClientId(Number(clientId)).toPromise();
      this.associatedDoctors = doctors || [];
    } catch (error) {
      console.warn('Nenhum médico associado encontrado ou erro ao carregar:', error);
      this.associatedDoctors = [];
    }
  }

  private loadAssociatedPersonals(clientId: string): void {
    this.personalService.getPersonalByClientId(Number(clientId))
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      )
      .subscribe(response => {
        if (Array.isArray(response)) {
          this.associatedPersonals = response;
        } else if (response) {
          this.associatedPersonals = [response];
        } else {
          this.associatedPersonals = [];
        }
      });
  }

  // Método assíncrono para carregar personal trainers
  private async loadAssociatedPersonalsAsync(clientId: string): Promise<void> {
    try {
      const response = await this.personalService.getPersonalByClientId(Number(clientId)).toPromise();
      if (Array.isArray(response)) {
        this.associatedPersonals = response;
      } else if (response) {
        this.associatedPersonals = [response];
      } else {
        this.associatedPersonals = [];
      }
    } catch (error) {
      console.warn('Nenhum personal trainer associado encontrado ou erro ao carregar:', error);
      this.associatedPersonals = [];
    }
  }

  private loadAssociatedNutritionists(clientId: string): void {
    this.nutritionistService.getNutritionistByClientId(Number(clientId))
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      )
      .subscribe(response => {
        if (Array.isArray(response)) {
          this.associatedNutritionists = response;
        } else if (response) {
          this.associatedNutritionists = [response];
        } else {
          this.associatedNutritionists = [];
        }
      });
  }

  // Método assíncrono para carregar nutricionistas
  private async loadAssociatedNutritionistsAsync(clientId: string): Promise<void> {
    try {
      const response = await this.nutritionistService.getNutritionistByClientId(Number(clientId)).toPromise();
      if (Array.isArray(response)) {
        this.associatedNutritionists = response;
      } else if (response) {
        this.associatedNutritionists = [response];
      } else {
        this.associatedNutritionists = [];
      }
    } catch (error) {
      console.warn('Nenhum nutricionista associado encontrado ou erro ao carregar:', error);
      this.associatedNutritionists = [];
    }
  }

  private loadClientTrainings(clientId: string): void {
    this.loadActiveTrainings(clientId);
    this.loadInactiveTrainings(clientId);
  }

  // Método assíncrono para carregar treinos
  private async loadClientTrainingsAsync(clientId: string): Promise<void> {
    try {
      // Executa em paralelo
      await Promise.all([
        this.loadActiveTrainingsAsync(clientId),
        this.loadInactiveTrainingsAsync(clientId)
      ]);
    } catch (error) {
      console.warn('Alguns dados de treinos não puderam ser carregados:', error);
    }
  }

  private loadActiveTrainings(clientId: string): void {
    this.trainningService.getTrainningByClientId(Number(clientId))
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleError('Erro ao carregar treinos do cliente.', error);
          return of([]);
        })
      )
      .subscribe(trainings => {
        const activeTrainings = trainings.filter(t => t.active === true);
        this.clientTrainings = activeTrainings;

        // Initialize expanded state for all trainings
        this.clientTrainings.forEach(training => {
          if (training.id !== undefined && training.id !== null) {
            this.expandedExercisesMap.set(training.id.toString(), false);
          }
        });

        // Set first active training as current
        if (this.clientTrainings.length > 0) {
          this.currentClientTraining = this.clientTrainings[0];
        }
      });
  }

  // Método assíncrono para carregar treinos ativos
  private async loadActiveTrainingsAsync(clientId: string): Promise<void> {
    try {
      const trainings = await this.trainningService.getTrainningByClientId(Number(clientId)).toPromise();
      const activeTrainings = (trainings || []).filter(t => t.active === true);
      this.clientTrainings = activeTrainings;

      // Initialize expanded state for all trainings
      this.clientTrainings.forEach(training => {
        if (training.id !== undefined && training.id !== null) {
          this.expandedExercisesMap.set(training.id.toString(), false);
        }
      });

      // Set first active training as current
      if (this.clientTrainings.length > 0) {
        this.currentClientTraining = this.clientTrainings[0];
      }
    } catch (error) {
      console.warn('Nenhum treino ativo encontrado ou erro ao carregar:', error);
      this.clientTrainings = [];
    }
  }

  private loadInactiveTrainings(clientId: string): void {
    this.trainningService.listInactiveTrainningsByClientId(Number(clientId))
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleError('Erro ao carregar histórico de treinos.', error);
          return of([]);
        })
      )
      .subscribe(inactiveTrainings => {
        this.inactiveTrainings = inactiveTrainings || [];
      });
  }

  // Método assíncrono para carregar treinos inativos
  private async loadInactiveTrainingsAsync(clientId: string): Promise<void> {
    try {
      const inactiveTrainings = await this.trainningService.listInactiveTrainningsByClientId(Number(clientId)).toPromise();
      this.inactiveTrainings = inactiveTrainings || [];
    } catch (error) {
      console.warn('Nenhum treino inativo encontrado ou erro ao carregar:', error);
      this.inactiveTrainings = [];
    }
  }

  // ============== Client Edit Methods ==============

  toggleEditClient(): void {
    if (!this.editingClient) {
      this.startEditingClient();
    } else {
      this.saveEditedClient();
    }
  }

  private startEditingClient(): void {
    if (!this.client) return;

    this.editableClient = {
      id: this.client.id,
      name: this.client.name,
      email: this.client.email,
      phone: this.client.phone,    // Adicionado telefone
      cpf: this.client.cpf,        // Adicionado CPF
      dateOfBirth: this.client.dateOfBirth ? new Date(this.client.dateOfBirth) : undefined,
      height: this.client.height,
      weight: this.client.weight
    };

    this.editingClient = true;
  }

  saveEditedClient(): void {
    if (!this.client?.id) {
      this.showSnackBar('Erro: ID do cliente não encontrado.');
      return;
    }

    this.isLoading = true;
    this.clientService.updateClient(this.client.id, this.editableClient)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false),
        catchError(error => {
          this.handleError('Erro ao atualizar informações do cliente.', error);
          return of(null);
        })
      )
      .subscribe(updatedClient => {
        if (updatedClient && this.client) {
          // Update only editable fields
          this.client.email = this.editableClient.email ?? this.client.email;
          this.client.phone = this.editableClient.phone ?? this.client.phone;  // Adicionado telefone
          this.client.cpf = this.editableClient.cpf ?? this.client.cpf;        // Adicionado CPF
          this.client.dateOfBirth = this.editableClient.dateOfBirth;
          this.client.height = this.editableClient.height;
          this.client.weight = this.editableClient.weight;

          this.editingClient = false;
          this.showSnackBar('Informações atualizadas com sucesso!');
        }
      });
  }

  cancelEditClient(): void {
    this.editingClient = false;
    this.editableClient = {};
  }

  /**
 * Calcula a idade com base na data de nascimento
 */
  calculateAge(dateOfBirth: Date | string | undefined): number | null {
    if (!dateOfBirth) {
      return null;
    }

    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      return null; // Data inválida
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    // Ajuste para caso o aniversário ainda não tenha ocorrido no ano atual
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }


  // ============== Measures Edit Methods ==============

  toggleEditMeasures(): void {
    if (this.editingMeasures) {
      // Se já está editando, salva as alterações
      if (!this.client?.id) {
        this.showSnackBar('Erro: ID do cliente não disponível.');
        return;
      }

      // IMPORTANTE: Envie diretamente o objeto editableMeasures, sem aninhamento
      // NÃO envie { measure: this.editableMeasures }

      this.isLoading = true;
      this.clientService.updateMeasure(this.client.id, this.editableMeasures)
        .pipe(
          finalize(() => this.isLoading = false),
          catchError(error => {
            this.showSnackBar('Erro ao atualizar medidas do cliente.');
            console.error('Erro ao atualizar medidas:', error);
            return of(null);
          })
        )
        .subscribe(response => {
          if (response) {
            // Atualiza o cliente local com os novos dados
            if (this.client) {
              this.client = {
                ...this.client,
                measure: this.editableMeasures
              };
            }
            this.showSnackBar('Medidas atualizadas com sucesso!');
          }
          this.editingMeasures = false;
        });
    } else {
      // Inicia a edição, copiando valores atuais para o editável
      this.editableMeasures = this.client?.measure
        ? { ...this.client.measure }
        : this.createEmptyMeasure();

      // Se não existir data de medição, define como hoje
      if (!this.editableMeasures.data) {
        this.editableMeasures.data = new Date();
      }

      this.editingMeasures = true;
    }
  }

  private startEditingMeasures(): void {
    this.editableMeasures = { ...(this.client?.measure ?? {}) };
    this.editingMeasures = true;
  }

  saveEditedMeasures(): void {
    if (!this.client?.id) {
      this.showSnackBar('Erro: ID do cliente não encontrado.');
      return;
    }

    this.isLoading = true;
    const measureToUpdate = {
      ...this.editableMeasures,
      id: this.client.measure?.id
    };

    this.measureService.updateMeasure(this.client.id, measureToUpdate)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false),
        catchError(error => {
          this.handleError('Erro ao atualizar medidas.', error);
          return of(null);
        })
      )
      .subscribe(updatedMeasures => {
        if (updatedMeasures && this.client) {
          this.client.measure = updatedMeasures;
          this.editingMeasures = false;
          this.showSnackBar('Medidas atualizadas com sucesso!');
        }
      });
  }

  cancelEditMeasures(): void {
    this.editingMeasures = false;
    this.editableMeasures = {};
  }

  // ============== Training Management Methods ==============

  toggleExerciseVisibility(trainingId: string): void {
    const currentState = this.expandedExercisesMap.get(trainingId) || false;
    this.expandedExercisesMap.set(trainingId, !currentState);
  }

  isExerciseListVisible(trainingId: string): boolean {
    return this.expandedExercisesMap.get(trainingId) || false;
  }

  setAsCurrentTraining(training: Trainning): void {
    if (!training.active) {
      this.showSnackBar(`Não é possível definir "${training.name}" como atual pois está inativo`);
      return;
    }

    this.currentClientTraining = training;
    this.showSnackBar(`"${training.name}" definido como treino atual`);
  }

  assignNewTraining(): void {
    if (!this.client?.id) {
      this.showSnackBar('ID do cliente não disponível para criar treino.');
      return;
    }

    this.router.navigate(['/trainning-create', this.client.id]);
  }

  viewTrainingDetails(training: Trainning): void {
    if (!training) return;

    const trainingCopy = { ...training };

    // Convert dates if needed
    trainingCopy.startDate = this.parseDate(trainingCopy.startDate);
    trainingCopy.endDate = this.parseDate(trainingCopy.endDate);

    // For inactive trainings, just show details in dialog
    if (!trainingCopy.active) {
      this.showTrainingDetailsInDialog(trainingCopy);
      return;
    }

    this.currentClientTraining = trainingCopy;

    // Scroll to section
    setTimeout(() => {
      document.querySelector('.current-training-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  }

  showTrainingDetailsInDialog(training: Trainning): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '600px',
      data: {
        title: `Detalhes do Treino: ${training.name}`,
        message: this.formatTrainingDetails(training),
        confirmText: 'Fechar',
        showCancel: false
      }
    });
  }

  formatTrainingDetails(training: Trainning): string {
    let details = `
      <strong>Nome:</strong> ${training.name || 'Não definido'}<br>
      <strong>Data de Início:</strong> ${this.formatDate(training.startDate)}<br>
      <strong>Data de Fim:</strong> ${this.formatDate(training.endDate)}<br>
      <strong>Status:</strong> ${training.active ? 'Ativo' : 'Inativo'}<br>
    `;

    if (training.exercises && training.exercises.length > 0) {
      details += '<br><strong>Exercícios:</strong><br>';
      training.exercises.forEach(ex => {
        details += `- ${ex.name}<br>`;
      });
    }

    return details;
  }

  restoreTraining(training: Trainning): void {
    if (!this.client?.id || !training.id) {
      this.showSnackBar('Erro: ID do cliente ou do treino não disponível.');
      return;
    }

    // Confirmação antes de restaurar o treino
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Restaurar Treino',
        message: `Deseja realmente restaurar o treino "${training.name}" e torná-lo ativo novamente?`,
        confirmText: 'Restaurar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;

        // Preparar o objeto de treino para restauração
        const trainingToRestore = {
          ...training,
          active: true,
          endDate: null // Remove a data de término
        };

        // Atualizar status do treino para ativo
        this.trainningService.updateTrainning(training.id!, trainingToRestore)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isLoading = false),
            catchError(error => {
              this.handleError('Erro ao restaurar treino.', error);
              return of(null);
            })
          )
          .subscribe(updatedTraining => {
            if (updatedTraining) {
              // Remover da lista de treinos inativos
              this.inactiveTrainings = this.inactiveTrainings.filter(t => t.id !== training.id);

              // Adicionar à lista de treinos ativos
              const restoredTraining = {
                ...updatedTraining,
                active: true,
                // Garantir que as datas sejam objetos Date
                startDate: this.parseDate(updatedTraining.startDate),
                endDate: null // Já definido como null
              };
              this.clientTrainings = [...this.clientTrainings, restoredTraining];

              // Inicializar o estado expandido para este treino
              if (restoredTraining.id) {
                this.expandedExercisesMap.set(restoredTraining.id.toString(), false);
              }

              // Atualizar painel para exibir treinos ativos
              this.panelOpenState.trainings = true;
              this.panelOpenState.history = false;

              // Mostrar mensagem de sucesso
              this.showSnackBar(`Treino "${restoredTraining.name}" restaurado com sucesso!`);

              // Opcionalmente, perguntar se deseja definir como treino atual
              this.askSetAsCurrentTraining(restoredTraining);

              // Rolar para a seção de treinos ativos após um curto delay
              setTimeout(() => {
                const trainingsSection = document.querySelector('.trainings-container');
                if (trainingsSection) {
                  trainingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 300);
            }
          });
      }
    });
  }

  deactivateTraining(training: Trainning): void {
    if (!this.client?.id || !training.id) {
      this.showSnackBar('Erro: ID do cliente ou do treino não disponível.');
      return;
    }

    // Confirmação antes de inativar o treino
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Inativar Treino',
        message: `Deseja realmente inativar o treino "${training.name}"?`,
        confirmText: 'Inativar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;

        // Preparar o objeto de treino para inativação
        const trainingToDeactivate = {
          ...training,
          active: false,
          endDate: new Date() // Define a data de término como a data atual
        };

        // Atualizar status do treino para inativo
        this.trainningService.updateTrainning(training.id!, trainingToDeactivate)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isLoading = false),
            catchError(error => {
              this.handleError('Erro ao inativar treino.', error);
              return of(null);
            })
          )
          .subscribe(updatedTraining => {
            if (updatedTraining) {
              // Remover da lista de treinos ativos
              this.clientTrainings = this.clientTrainings.filter(t => t.id !== training.id);

              // Se era o treino atual, atualizar a referência
              if (this.currentClientTraining?.id === training.id) {
                this.currentClientTraining = this.clientTrainings.length > 0 ? this.clientTrainings[0] : null;
              }

              // Adicionar à lista de treinos inativos
              const inactivatedTraining = {
                ...updatedTraining,
                active: false,
                // Garantir que as datas sejam objetos Date
                startDate: this.parseDate(updatedTraining.startDate),
                endDate: this.parseDate(updatedTraining.endDate)
              }; this.inactiveTrainings = [inactivatedTraining, ...this.inactiveTrainings];

              // Atualizar painel para exibir histórico de treinos
              this.panelOpenState.history = true;

              // Mostrar mensagem de sucesso
              this.showSnackBar(`Treino "${inactivatedTraining.name}" inativado com sucesso!`);

              // Rolar para a seção de histórico após um curto delay
              setTimeout(() => {
                const historySection = document.querySelector('.training-history-table-wrapper');
                if (historySection) {
                  historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 300);
            }
          });
      }
    });
  }

  // Método auxiliar para perguntar se deseja definir como treino atual
  private askSetAsCurrentTraining(training: Trainning): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Definir como Atual',
        message: `Deseja definir "${training.name}" como treino atual?`,
        confirmText: 'Sim',
        cancelText: 'Não'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.setAsCurrentTraining(training);
      }
    });
  }

  // ============== Doctor Management Methods ==============

  openAddDoctorDialog(): void {
    if (!this.client?.id) {
      this.showSnackBar('Não é possível adicionar médico: ID do cliente não disponível.');
      return;
    }

    this.doctorService.getAllDoctors()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleError('Erro ao carregar médicos disponíveis.', error);
          return of([]);
        })
      )
      .subscribe(doctors => {
        this.availableDoctors = doctors;
        this.selectedDoctorIds = new Set(
          this.associatedDoctors.map(d => d.id?.toString() || '')
        );
        this.showAddDoctorDialog = true;
      });
  }

  closeAddDoctorDialog(): void {
    this.showAddDoctorDialog = false;
  }

  isDoctorSelected(doctorId: string): boolean {
    return this.selectedDoctorIds.has(doctorId);
  }

  toggleDoctorSelection(doctorId: string): void {
    this.toggleSelection(doctorId, this.selectedDoctorIds);
  }

  saveSelectedDoctors(): void {
    if (!this.client?.id) {
      this.showSnackBar('ID do cliente não disponível para salvar médicos.');
      return;
    }

    if (this.selectedDoctorIds.size === 0) {
      this.showSnackBar('Nenhum médico selecionado.');
      return;
    }

    const selectedDoctorIds = Array.from(this.selectedDoctorIds)
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id > 0);

    this.doctorService.associateDoctorToClient(this.client.id, selectedDoctorIds)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleError('Erro ao associar médicos.', error);
          return of(null);
        })
      )
      .subscribe(updatedClient => {
        if (updatedClient) {
          this.client = updatedClient;
          this.closeAddDoctorDialog();
          this.loadAssociatedProfessionals(updatedClient.id!.toString());
          this.showSnackBar('Médicos associados com sucesso!');
        }
      });
  }

  removeDoctor(doctor: Doctor): void {
    this.confirmRemoveProfessional(
      'médico',
      doctor.name || 'Selecionado',
      () => {
        if (!this.client?.id || !doctor.id) {
          this.showSnackBar('ID do cliente ou médico inválido.');
          return;
        }

        this.doctorService.disassociateDoctorsFromClient(this.client.id, [doctor.id])
          .pipe(
            takeUntil(this.destroy$),
            catchError(error => {
              this.handleError('Erro ao desassociar médico.', error);
              return of(null);
            })
          )
          .subscribe(updatedClient => {
            if (updatedClient) {
              this.client = updatedClient;
              this.loadAssociatedProfessionals(updatedClient.id!.toString());
              this.showSnackBar('Médico desassociado com sucesso!');
            }
          });
      }
    );
  }

  // ============== Personal Trainer Management Methods ==============

  openAddPersonalDialog(): void {
    if (!this.client?.id) {
      this.showSnackBar('Não é possível adicionar personal: ID do cliente não disponível.');
      return;
    }

    this.personalService.getAllPersonal()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleError('Erro ao carregar personals disponíveis.', error);
          return of([]);
        })
      )
      .subscribe(personals => {
        this.availablePersonals = personals;
        this.selectedPersonalIds = new Set(
          this.associatedPersonals.map(p => p.id?.toString() || '')
        );
        this.showAddPersonalDialog = true;
      });
  }

  closeAddPersonalDialog(): void {
    this.showAddPersonalDialog = false;
  }

  isPersonalSelected(personalId: string): boolean {
    return this.selectedPersonalIds.has(personalId);
  }

  togglePersonalSelection(personalId: string): void {
    this.toggleSelection(personalId, this.selectedPersonalIds);
  }

  saveSelectedPersonals(): void {
    if (!this.client?.id) {
      this.showSnackBar('ID do cliente não disponível para salvar personals.');
      return;
    }

    if (this.selectedPersonalIds.size === 0) {
      this.showSnackBar('Nenhum personal trainer selecionado.');
      return;
    }

    const selectedPersonalIds = Array.from(this.selectedPersonalIds)
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id > 0);

    this.personalService.associatePersonalToClient(this.client.id, selectedPersonalIds)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleError('Erro ao associar personal trainers.', error);
          return of(null);
        })
      )
      .subscribe(updatedClient => {
        if (updatedClient) {
          this.client = updatedClient;
          this.closeAddPersonalDialog();
          this.loadAssociatedProfessionals(updatedClient.id!.toString());
          this.showSnackBar('Personal trainers associados com sucesso!');
        }
      });
  }

  removePersonal(personal: Personal): void {
    this.confirmRemoveProfessional(
      'personal',
      personal.name || 'Selecionado',
      () => {
        if (!this.client?.id || !personal.id) {
          this.showSnackBar('ID do cliente ou personal inválido.');
          return;
        }

        this.personalService.disassociatePersonalsFromClient(this.client.id, [personal.id])
          .pipe(
            takeUntil(this.destroy$),
            catchError(error => {
              this.handleError('Erro ao desassociar personal.', error);
              return of(null);
            })
          )
          .subscribe(updatedClient => {
            if (updatedClient) {
              this.client = updatedClient;
              this.loadAssociatedProfessionals(updatedClient.id!.toString());
              this.showSnackBar('Personal desassociado com sucesso!');
            }
          });
      }
    );
  }

  // ============== Nutritionist Management Methods ==============

  openAddNutritionistDialog(): void {
    if (!this.client?.id) {
      this.showSnackBar('Não é possível adicionar nutricionista: ID do cliente não disponível.');
      return;
    }

    this.nutritionistService.getAllNutritionists()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleError('Erro ao carregar nutricionistas disponíveis.', error);
          return of([]);
        })
      )
      .subscribe(nutritionists => {
        this.availableNutritionists = nutritionists;
        this.selectedNutritionistIds = new Set(
          this.associatedNutritionists
            .filter(n => n && n.id)
            .map(n => n.id?.toString() || '')
        );
        this.showAddNutritionistDialog = true;
      });
  }

  closeAddNutritionistDialog(): void {
    this.showAddNutritionistDialog = false;
  }

  isNutritionistSelected(nutritionistId: string): boolean {
    return this.selectedNutritionistIds.has(nutritionistId);
  }

  toggleNutritionistSelection(nutritionistId: string): void {
    if (!nutritionistId || nutritionistId === 'null' || nutritionistId === 'undefined' || nutritionistId === '0') {
      this.showSnackBar('ID de nutricionista inválido');
      return;
    }

    this.toggleSelection(nutritionistId, this.selectedNutritionistIds);
  }

  saveSelectedNutritionists(): void {
    if (!this.client?.id) {
      this.showSnackBar('ID do cliente não disponível para salvar nutricionistas.');
      return;
    }

    if (this.selectedNutritionistIds.size === 0) {
      this.showSnackBar('Nenhum nutricionista selecionado.');
      return;
    }

    const selectedNutritionistIds = Array.from(this.selectedNutritionistIds)
      .filter(id => id && id.trim() !== '' && id !== '0')
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id > 0);

    if (selectedNutritionistIds.length === 0) {
      this.showSnackBar('Nenhum ID de nutricionista válido foi selecionado.');
      return;
    }

    this.nutritionistService.associateNutritionistToClient(this.client.id, selectedNutritionistIds)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          const errorMsg = error.error?.message || error.message || 'Erro desconhecido';
          this.showSnackBar(`Erro ao associar nutricionistas: ${errorMsg}`);
          return of(null);
        })
      )
      .subscribe(updatedClient => {
        if (updatedClient) {
          this.client = updatedClient;
          this.closeAddNutritionistDialog();
          this.loadAssociatedProfessionals(updatedClient.id!.toString());
          this.showSnackBar('Nutricionistas associados com sucesso!');
        }
      });
  }

  removeNutritionist(nutritionist: Nutritionist): void {
    this.confirmRemoveProfessional(
      'nutricionista',
      nutritionist.name || 'Selecionado',
      () => {
        if (!this.client?.id || !nutritionist.id) {
          this.showSnackBar('ID do cliente ou nutricionista inválido.');
          return;
        }

        this.nutritionistService.disassociateNutritionistsFromClient(this.client.id, [nutritionist.id])
          .pipe(
            takeUntil(this.destroy$),
            catchError(error => {
              this.handleError('Erro ao desassociar nutricionista.', error);
              return of(null);
            })
          )
          .subscribe(updatedClient => {
            if (updatedClient) {
              this.client = updatedClient;
              this.loadAssociatedProfessionals(updatedClient.id!.toString());
              this.showSnackBar('Nutricionista desassociado com sucesso!');
            }
          });
      }
    );
  }

  // ============== Panel State Methods ==============

  expandAllPanels(): void {
    Object.keys(this.panelOpenState).forEach(key => {
      this.panelOpenState[key as keyof PanelState] = true;
    });
  }

  collapseAllPanels(): void {
    Object.keys(this.panelOpenState).forEach(key => {
      this.panelOpenState[key as keyof PanelState] = false;
    });
  }

  // ============== Utility Methods ==============

  formatMeasure(value: number | null | undefined, unit: string = 'cm'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '-';
    }

    const formattedValue = value.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });

    return `${formattedValue} ${unit}`;
  }

  formatDate(date: any): string {
    const parsed = this.parseDate(date);
    if (!parsed) return 'Não definida';
    return parsed.toLocaleDateString('pt-BR');
  }

  parseDate(dateValue: any): Date | null {
    if (!dateValue) return null;

    try {
      // Array format [2025, 7, 31, 3, 0]
      if (Array.isArray(dateValue)) {
        const [year, month, day, hour = 0, minute = 0] = dateValue;
        return new Date(year, month - 1, day, hour, minute);
      }

      // String format "2025,7,31,3,0"
      if (typeof dateValue === 'string' && dateValue.includes(',')) {
        const parts = dateValue.split(',').map(part => parseInt(part.trim()));
        return new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0);
      }

      // Date object
      if (dateValue instanceof Date) {
        return dateValue;
      }

      // Other string formats
      return new Date(dateValue);
    } catch (e) {
      console.error('Error converting date:', e, dateValue);
      return null;
    }
  }

  isValidDate(dateValue: any): boolean {
    return this.parseDate(dateValue) !== null;
  }

  navigateToClientsList(): void {
    this.router.navigate(['/clients-list']);
  }

  onBack(): void {
    this.navigateToClientsList();
  }

  editClientDetails(clientId: number | undefined): void {
    if (clientId) {
      this.router.navigate(['/clients-edit', clientId.toString()]);
    } else {
      this.showSnackBar('Não é possível editar: ID do Cliente não carregado.');
    }
  }

  editMeasures(clientId: string | undefined): void {
    if (clientId) {
      this.router.navigate(['/edit-measures', clientId]);
    } else {
      this.showSnackBar('Não é possível editar medidas: ID do Cliente não carregado.');
    }
  }

  // Track By methods for ngFor performance
  trackByTrainingId(index: number, training: any): string {
    return training.id || index.toString();
  }

  trackByDoctorId(index: number, doctor: any): any {
    return doctor?.id || index;
  }

  trackByPersonalId(index: number, personal: any): string | number {
    return personal?.id != null ? personal.id : index;
  }

  trackByNutritionistId(index: number, nutritionist: any): any {
    return nutritionist?.id || index;
  }

  // ============== Helper Methods ==============

  private showSnackBar(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Fechar', { duration });
  }

  private handleError(message: string, error?: any): void {
    console.error(message, error);
    this.showSnackBar(message);
  }

  private toggleSelection(id: string, selectionSet: Set<string>): void {
    if (selectionSet.has(id)) {
      selectionSet.delete(id);
    } else {
      selectionSet.add(id);
    }
  }

  private confirmRemoveProfessional(
    type: string,
    name: string,
    onConfirm: () => void
  ): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Desassociação',
        message: `Deseja realmente desassociar o ${type} ${name}?`,
        confirmText: 'Desassociar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        onConfirm();
      }
    });
  }
}
