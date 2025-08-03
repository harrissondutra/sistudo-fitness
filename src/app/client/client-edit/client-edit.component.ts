import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientService } from '../../services/client/client.service'; // Renomeado para ClientService
import { MeasureService } from '../../services/measure/measure.service'; // Adicionado MeasureService
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
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxMaskDirective } from 'ngx-mask';

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
    MatNativeDateModule,
    MatCardModule,
    MatCheckboxModule,
    NgxMaskDirective
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
    private measureService: MeasureService, // Adicionado MeasureService
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
      dateOfBirth: [null],
      phone: [''],
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
            dateOfBirth: clientData.dateOfBirth,
            phone: clientData.phone,
            weight: clientData.weight,
            height: clientData.height,
            hasDoctorAssistance: clientData.hasDoctorAssistance,
            hasPersonalAssistance: clientData.hasPersonalAssistance,
            hasNutritionistAssistance: clientData.hasNutritionistAssistance,
          });

          // Carrega as medidas do cliente
          this.loadClientMeasures(id);
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

  private loadClientMeasures(clientId: string): void {
    this.measureService.getMeasureByClientId(Number(clientId)).subscribe(
      (measureData: Measure | null) => {
        if (this.client) {
          this.client.measure = measureData ?? undefined;
        }
      },
      (error) => {
        console.error('Erro ao carregar medidas do cliente:', error);
        this.snackBar.open('Erro ao carregar medidas do cliente.', 'Fechar', { duration: 3000 });
      }
    );
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
    if (this.clientForm.valid) {
      this.isLoading = true;
      const clientId = this.route.snapshot.paramMap.get('id');

      // Obtemos apenas os valores alterados do formulário
      const formData = this.getChangedValues();

      // Se não há mudanças, não fazemos requisição
      if (Object.keys(formData).length === 0) {
        this.snackBar.open('Nenhuma alteração detectada', 'Fechar', { duration: 3000 });
        this.isLoading = false;
        return;
      }

      // Formatação dos dados, se necessário
      if (formData.cpf) {
        formData.cpf = String(formData.cpf).replace(/\D/g, '');
      }
      if (formData.weight) {
        formData.weight = parseFloat(String(formData.weight).replace(',', '.'));
      }
      if (formData.height) {
        formData.height = parseFloat(String(formData.height).replace(',', '.'));
      }

      let request$;
      if (this.isNewClient) {
        // Para cliente novo, enviamos todos os dados do formulário
        const newClient: Client = {
          ...this.clientForm.value,
          cpf: this.clientForm.value.cpf ? String(this.clientForm.value.cpf).replace(/\D/g, '') : '',
          weight: this.clientForm.value.weight ? parseFloat(String(this.clientForm.value.weight).replace(',', '.')) : undefined,
          height: this.clientForm.value.height ? parseFloat(String(this.clientForm.value.height).replace(',', '.')) : undefined,
        };
        request$ = this.clientService.createClient(newClient);
      } else if (clientId) {
        // Para atualização, enviamos apenas os campos alterados
        request$ = this.clientService.updateClient(Number(clientId), formData);
      } else {
        this.snackBar.open('ID do cliente inválido para atualização.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
        return;
      }

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
            this.router.navigate(['/clients']);
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
      this.markFormGroupTouched(this.clientForm);
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
    }
  }

  /**
   * Compara os valores do formulário com os valores originais do cliente
   * e retorna apenas os campos que foram alterados
   */
  private getChangedValues(): any {
    if (this.isNewClient) {
      return this.clientForm.value; // Para cliente novo, retorna todos os valores
    }

    const changes: any = {};
    const formValue = this.clientForm.value;
    const originalClient: Partial<Client> = this.client || {};

    // Compara cada campo e inclui no objeto de alterações apenas os que foram modificados
    Object.keys(formValue).forEach(key => {
      // Verifica se o valor foi alterado
      if (formValue[key] !== originalClient[key as keyof Client]) {
        changes[key] = formValue[key];
      }
    });

    return changes;
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

  formatMeasure(value: number | null | undefined, unit: string = 'cm'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '-';
    }

    // Formata números para sempre exibir uma casa decimal
    const formattedValue = value.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });

    return `${formattedValue} ${unit}`;
  }

  editMeasures(): void {
    if (!this.client?.id) {
      this.snackBar.open('É necessário salvar o cliente antes de editar medidas.', 'Fechar', { duration: 3000 });
      return;
    }

    // Passa o objeto Measure completo, ou um novo objeto vazio se não existir
    const dialogRef = this.dialog.open(EditMeasuresComponent, {
      width: '800px',
      data: this.client?.measure || {}
    });

    dialogRef.afterClosed().subscribe((result: Measure) => {
      if (result) {
        // Atualiza apenas as medidas, sem alterar o resto do cliente
        this.isLoading = true;

        // Uso direto do MeasureService para atualizar apenas as medidas
        this.measureService.updateMeasure(this.client!.id!, result)
          .pipe(
            finalize(() => this.isLoading = false),
            takeUntil(this.destroy$)
          )
          .subscribe({
            next: (updatedMeasure) => {
              // Atualiza apenas as medidas no objeto cliente local
              if (this.client) {
                this.client.measure = updatedMeasure || result;
              }
              this.snackBar.open('Medidas atualizadas com sucesso!', 'Fechar', { duration: 3000 });
            },
            error: (error) => {
              console.error('Erro ao atualizar medidas:', error);
              this.snackBar.open('Erro ao atualizar medidas do cliente.', 'Fechar', { duration: 3000 });
            }
          });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clients']); // Navega de volta para a lista de clientes
  }

}
