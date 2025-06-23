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
    MatCheckboxModule // Importa MatCheckboxModule
  ]
})
export class ClientViewComponent implements OnInit {
  client: Client | null = null;
  isLoading = false;

  currentClientTraining: any = null;
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
    private nutritionistService: NutritionistService
  ) { }

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.loadClient(clientId);
      this.loadAssociatedProfessionals(clientId);
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
        this.client = clientData;
        this.isLoading = false;
        // Se houver treinos no cliente, tenta definir o treino atual (exemplo, o primeiro)
        if (this.client?.trainings && this.client.trainings.length > 0) {
          this.currentClientTraining = this.client.trainings[0]; // Ou defina uma lógica para o 'treino atual'
        }
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        this.snackBar.open('Erro ao carregar dados do cliente.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/clients-list']);
      }
    });
  }

  private loadAssociatedProfessionals(clientId: string): void {
    // Carregar médicos associados
    this.doctorService.getDoctorByClientId(Number(clientId)).subscribe({ // Assumindo método no DoctorService
      next: (doctors: Doctor[]) => this.associatedDoctors = doctors,
      error: (err) => console.error('Erro ao carregar médicos associados:', err)
    });

    // Carregar personals associados
    this.personalService.getPersonalByClientId(Number(clientId)).subscribe({ // Corrigido para o nome correto do método
      next: (personals: Personal[]) => this.associatedPersonals = personals,
      error: (err) => console.error('Erro ao carregar personals associados:', err)
    });

    // Carregar nutricionistas associados
    this.nutritionistService.getNutritionistByClientId(Number(clientId)).subscribe({ // Corrigido para o nome correto do método
      next: (nutritionists: any[]) => this.associatedNutritionists = nutritionists,
      error: (err) => console.error('Erro ao carregar nutricionistas associados:', err)
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

  viewTrainingDetails(trainingId: string | number): void {
    console.log('View training details for training ID:', trainingId);
    // this.router.navigate(['/trainning-view', trainingId]);
  }

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
        this.showAddDoctorDialog = true; // Abre o diálogo após carregar os dados
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
        this.associatedPersonals = personals;
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
      next: (nutritionists: any[]) => {
        this.associatedNutritionists = nutritionists;
        this.showAddNutritionistDialog = true; // Abre o diálogo após carregar os dados
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

    const doctorIdsToAssociate = Array.from(this.selectedDoctorIds);

    this.clientService.getDoctorByClientId(this.client.id.toString()).subscribe({
      next: () => {
        this.snackBar.open('Médicos associados com sucesso!', 'Fechar', { duration: 3000 });
        this.closeAddDoctorDialog();
        this.loadAssociatedProfessionals(this.client!.id!.toString()); // Recarrega para refletir as mudanças
      },
      error: (error: any) => {
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

  addNutritionistToClient(clientId: string): void {
    console.log('Adicionando nutricionista ao cliente com ID:', clientId);
    // Lógica para abrir diálogo de seleção de nutricionista ou navegar para criação
    this.router.navigate(['/nutritionist-create', clientId]);
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
    // Implement your logic to save selected personals here
    // For example, you might emit an event, call a service, or update the client
    // This is a placeholder implementation:
    // Example: this.clientService.addPersonalsToClient(this.client.id, this.selectedPersonalIds);
    this.closeAddPersonalDialog();
  }

   closeAddNutritionistDialog(): void {
    this.showAddNutritionistDialog = false;
  }

  toggleNutritionistSelection(nutritionistId: string): void {
    if (this.selectedNutritionistIds.has(nutritionistId)) {
      this.selectedNutritionistIds.delete(nutritionistId);
    } else {
      this.selectedNutritionistIds.add(nutritionistId);
    }
  }

  isNutritionistSelected(nutritionistId: string): boolean {
    return this.selectedNutritionistIds.has(nutritionistId);
  }

   saveSelectedNutritionists(): void {
    // Implement your logic to save selected nutritionists here
    // For example, you might emit an event, call a service, or update the client object
    // Example placeholder:
    // this.clientService.addNutritionistsToClient(this.client.id, this.selectedNutritionistIds).subscribe(...);
    this.closeAddNutritionistDialog();
  }

  trackByDoctorId(index: number, doctor: any): any {
    return doctor?.id;
  }

   trackByPersonalId(index: number, personal: any): string | number {
    return personal && personal.id != null ? personal.id : index;
  }

  trackByNutritionistId(index: number, nutritionist: any): string | number {
    return nutritionist && nutritionist.id != null ? nutritionist.id : index;
  }

  // Assumindo que você tem métodos para buscar os profissionais associados por client ID
  // e um método para buscar TODOS os profissionais em seus respectivos services.
  // Exemplo no DoctorService (você precisará criar esses métodos nos seus services):

  // doctor.service.ts
  /*
  @Injectable({ providedIn: 'root' })
  export class DoctorService {
    private apiUrl = 'api/doctors'; // Ajuste sua URL da API

    constructor(private http: HttpClient) { }

    getAllDoctors(): Observable<Doctor[]> {
      return this.http.get<Doctor[]>(this.apiUrl);
    }

    getDoctorsByClientId(clientId: string): Observable<Doctor[]> {
      return this.http.get<Doctor[]>(`${this.apiUrl}/client/${clientId}`); // Exemplo
    }
  }
  */

  // client.service.ts
  /*
  @Injectable({ providedIn: 'root' })
  export class ClientService {
    private apiUrl = 'api/clients'; // Ajuste sua URL da API

    constructor(private http: HttpClient) { }

    associateDoctors(clientId: string, doctorIds: string[]): Observable<any> {
      return this.http.post(`${this.apiUrl}/${clientId}/associate-doctors`, { doctorIds });
    }
  }
  */

}
