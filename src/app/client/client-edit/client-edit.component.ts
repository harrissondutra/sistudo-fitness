import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../../services/client/client.service'; // Renomeado para ClientService
import { Client } from '../../models/client'; // Importa a interface Client
import { Measure } from '../../models/measure'; // Importa a interface Measure
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
// import { EditMeasuresModule } from './measures/edit-measures.module'; // Remove se EditMeasuresComponent for standalone
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditMeasuresComponent } from '../../measures/edit-measures.component'; // Verifique o caminho e se é standalone
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card'; // Adicionado para consistência
import { Trainning } from '../../models/trainning'; // Importa a interface Training
import { MatDatepickerModule } from '@angular/material/datepicker';

interface EvolutionPhoto {
  id: string;
  url: string;
  date: Date;
  description: string;
}

@Component({
  selector: 'app-client-edit', // Renomeado o seletor
  templateUrl: './client-edit.component.html', // Renomeado o template
  styleUrls: ['./client-edit.component.scss'], // Renomeado o estilo
  standalone: true, // Adicionado como standalone
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatDatepickerModule,
    MatCardModule // Adicionado
  ]
})
export class ClientEditComponent implements OnInit, OnDestroy { // Renomeada a classe
  clientForm: FormGroup; // Renomeado de userForm para clientForm
  client: Client | null = null; // Para armazenar o cliente carregado
  isLoading = false;
  isNewClient = true; // Renomeado de isNewUser
  evolutionPhotos: EvolutionPhoto[] = [];
  currentTraining: Trainning | null = null;
  trainingHistory: Trainning[] = [];
  trainingColumns = ['startDate', 'endDate', 'goal', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService, // Injetado ClientService
    private route: ActivatedRoute,
    public router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Inicialização do formulário com os campos do modelo Client
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]], // CPF agora é parte do Client
      weight: [null, [Validators.min(20), Validators.max(500)]], // Peso em KG
      height: [null, [Validators.min(50), Validators.max(300)]], // Altura em CM
      // Campos de assistência, se houver necessidade de editá-los aqui
      hasDoctorAssistance: [false],
      hasPersonalAssistance: [false],
      hasNutritionistAssistance: [false],
    });
  }

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id'); // Renomeado para clientId
    if (clientId && clientId !== 'new') { // Verifica se é um ID válido ou 'new'
      this.isNewClient = false;
      this.loadClient(clientId); // Chamando loadClient
    } else {
      this.isNewClient = true;
      // Para um novo cliente, o formulário já está limpo
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadClient(id: string): void { // Renomeado para loadClient
    this.isLoading = true;
    this.clientService.getClientById(id) // Chamando getClientById
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (clientData: Client) => { // Tipado como Client
          this.client = clientData; // Armazena o objeto Client completo
          // Preenche o formulário com os dados do cliente
          this.clientForm.patchValue({
            name: clientData.name,
            email: clientData.email,
            cpf: clientData.cpf,
            weight: clientData.weight,
            height: clientData.height,
            hasDoctorAssistance: clientData.hasDoctorAssistance,
            hasPersonalAssistance: clientData.hasPersonalAssistance,
            hasNutritionistAssistance: clientData.hasNutritionistAssistance,
          });
          // Se tiver um objeto 'measure', podemos pré-carregar para o diálogo de medidas
          // ou simplesmente garantir que this.client.measure esteja populado
          // para quando o editMeasures for chamado.
        },
        error: (error: Error) => {
          console.error('Erro ao carregar Cliente:', error);
          this.snackBar.open('Erro ao carregar Cliente', 'Fechar', { duration: 3000 });
          this.router.navigate(['/clients-list']); // Redireciona para a lista de clientes
        }
      });
  }

  private loadPhotos(clientId: string): void { // Renomeado para clientId
    // TODO: Implementar carregamento de fotos
    this.evolutionPhotos = [];
  }

  private loadTrainings(clientId: string): void { // Renomeado para clientId
    // TODO: Implementar carregamento de treinos
    this.trainingHistory = [];
    this.currentTraining = null;
  }

  uploadPhoto(): void {
    // TODO: Implementar upload de foto
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  removePhoto(photo: EvolutionPhoto): void {
    // TODO: Implementar remoção de foto
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  viewTrainingDetails(training: Trainning): void {
    // TODO: Implementar visualização de detalhes do treino
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  editTraining(training: Trainning): void {
    // TODO: Implementar edição de treino
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  createNewTraining(): void {
    // TODO: Implementar criação de novo treino
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  onSubmit(): void {
    if (this.clientForm.valid) { // Usa clientForm
      this.isLoading = true;
      const clientId = this.route.snapshot.paramMap.get('id');
      const formData = this.clientForm.value;

      // Cria ou atualiza o objeto Client a ser enviado
      // Assumimos que this.client já existe (se for edição) e o atualizamos,
      // ou criamos um novo Client se for o caso de um novo cadastro.
      const clientToSave: Client = {
        ...(this.client || {}), // Copia as propriedades existentes do cliente, incluindo o 'measure'
        ...formData, // Sobrescreve com os dados do formulário
        id: clientId ? Number(clientId) : undefined // Define o ID se for uma edição
      };

      // Formata CPF, peso e altura antes de enviar
      clientToSave.cpf = clientToSave.cpf ? String(clientToSave.cpf).replace(/\D/g, '') : '';
      clientToSave.weight = clientToSave.weight ? parseFloat(String(clientToSave.weight).replace(',', '.')) : undefined;
      clientToSave.height = clientToSave.height ? parseFloat(String(clientToSave.height).replace(',', '.')) : undefined;


      const request$ = this.isNewClient // Usa isNewClient
        ? this.clientService.createClient(clientToSave) // Chamando createClient
        : this.clientService.updateClient(clientToSave); // Chamando updateClient

      request$
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            this.snackBar.open(
              `Cliente ${this.isNewClient ? 'criado' : 'atualizado'} com sucesso!`,
              'Fechar',
              { duration: 3000 }
            );
            this.router.navigate(['/clients']); // Redireciona para a lista de clientes
          },
          error: (error: Error) => {
            console.error(`Erro ao ${this.isNewClient ? 'criar' : 'atualizar'} Cliente:`, error);
            this.snackBar.open(
              `Erro ao ${this.isNewClient ? 'criar' : 'atualizar'} Cliente`,
              'Fechar',
              { duration: 3000 }
            );
          }
        });
    } else {
      this.markFormGroupTouched(this.clientForm); // Usa clientForm
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  formatNumber(value: number | null): string {
    return value !== null ? value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '';
  }

  formatMeasure(value: number | null): string {
    return value !== null ? value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '-';
  }

  editMeasures(): void {
    // Passa o objeto Measure completo, ou um novo objeto vazio se não existir
    const dialogRef = this.dialog.open(EditMeasuresComponent, {
      width: '800px',
      data: this.client?.measure || {} // Passa o objeto measure do cliente ou um objeto vazio
    });

    dialogRef.afterClosed().subscribe((result: Measure) => { // Tipa o resultado como Measure
      if (result) {
        // Atualiza o objeto measure dentro do this.client
        // O service enviará o objeto client completo com as medidas atualizadas
        this.client = { ...this.client, measure: result } as Client;

        this.snackBar.open('Medidas atualizadas com sucesso!', 'Fechar', {
          duration: 3000
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clients']); // Navega de volta para a lista de clientes
  }

}
