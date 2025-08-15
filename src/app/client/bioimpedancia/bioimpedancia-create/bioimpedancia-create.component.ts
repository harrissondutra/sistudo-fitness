import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion'; // Módulo de expansão adicionado
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { BioimpedanciaService } from '../../../services/bioimpedancia/bioimpedancia.service';
import { ClientService } from '../../../services/client/client.service';
import { Client } from '../../../models/client';
import { BioimpedanciaDTO } from '../../../models/Bioimpedancia';

@Component({
  selector: 'app-bioimpedancia-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatTabsModule,
    MatDividerModule
  ],
  templateUrl: './bioimpedancia-create.component.html',
  styleUrls: ['./bioimpedancia-create.component.scss']
})
export class BioimpedanciaCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private bioimpedanciaService = inject(BioimpedanciaService);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  clientId!: number;
  client!: Client;
  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  bioimpedanciaId?: number;

  // Formulário principal
  bioimpedanciaForm!: FormGroup;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clientId = +params['clientId'];
      this.bioimpedanciaId = params['id'] ? +params['id'] : undefined;
      this.isEditMode = !!this.bioimpedanciaId;

      if (!this.clientId || isNaN(this.clientId) || this.clientId <= 0) {
        this.showError('ID do cliente inválido.');
        this.router.navigate(['/']); // Redireciona para a home ou lista de clientes
        return;
      }

      this.initializeForms();
      this.loadClient();

      if (this.isEditMode) {
        this.loadBioimpedancia();
      }
    });
  }

  /**
   * Inicializa o formulário principal com todos os subgrupos aninhados.
   */
  private initializeForms(): void {
    this.bioimpedanciaForm = this.fb.group({
      dataMedicao: [new Date(), Validators.required],
      pontuacaoInbody: [null],
      pesoAtual: [null, [Validators.min(0)]],
      pesoIdeal: [null, [Validators.min(0)]],
      controlePeso: [null],
      controleGordura: [null],
      controleMuscular: [null],
      imc: [null, [Validators.min(0)]],
      pgc: [null, [Validators.min(0), Validators.max(100)]],
      relacaoCinturaQuadril: [null, [Validators.min(0)]],
      nivelGorduraVisceral: [null, [Validators.min(0)]],
      massaLivreGordura: [null, [Validators.min(0)]],
      tmb: [null, [Validators.min(0)]],
      grauObesidade: [null],
      smi: [null, [Validators.min(0)]],
      ingestaoCaloricaRecomendada: [null, [Validators.min(0)]],

      composicaoCorporal: this.fb.group({
        aguaCorporal: [null, [Validators.min(0)]],
        proteina: [null, [Validators.min(0)]],
        minerais: [null, [Validators.min(0)]],
        massaGordura: [null, [Validators.min(0)]]
      }),

      analiseMusculoGordura: this.fb.group({
        massaMuscularEsqueletica: [null, [Validators.min(0)]],
        massaGorduraTotal: [null, [Validators.min(0)]]
      }),

      massaMagraSegmentar: this.fb.group({
        bracoEsquerdo: [null, [Validators.min(0)]],
        bracoEsquerdoPct: [null, [Validators.min(0), Validators.max(100)]],
        bracoDireito: [null, [Validators.min(0)]],
        bracoDireitoPct: [null, [Validators.min(0), Validators.max(100)]],
        tronco: [null, [Validators.min(0)]],
        troncoPct: [null, [Validators.min(0), Validators.max(100)]],
        pernaEsquerda: [null, [Validators.min(0)]],
        pernaEsquerdaPct: [null, [Validators.min(0), Validators.max(100)]],
        pernaDireita: [null, [Validators.min(0)]],
        pernaDireitaPct: [null, [Validators.min(0), Validators.max(100)]]
      }),

      gorduraSegmentar: this.fb.group({
        bracoEsquerdo: [null, [Validators.min(0)]],
        bracoEsquerdoPct: [null, [Validators.min(0), Validators.max(100)]],
        bracoDireito: [null, [Validators.min(0)]],
        bracoDireitoPct: [null, [Validators.min(0), Validators.max(100)]],
        tronco: [null, [Validators.min(0)]],
        troncoPct: [null, [Validators.min(0), Validators.max(100)]],
        pernaEsquerda: [null, [Validators.min(0)]],
        pernaEsquerdaPct: [null, [Validators.min(0), Validators.max(100)]],
        pernaDireita: [null, [Validators.min(0)]],
        pernaDireitaPct: [null, [Validators.min(0), Validators.max(100)]]
      })
    });
  }

  private loadClient(): void {
    this.clientService.getClientById(this.clientId).subscribe({
      next: (client) => {
        this.client = client;
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        this.showError('Erro ao carregar dados do cliente');
      }
    });
  }

  private loadBioimpedancia(): void {
    if (!this.bioimpedanciaId) {
      return;
    }

    this.isLoading = true;
    this.bioimpedanciaService.getById(this.bioimpedanciaId).subscribe({
      next: (bioimpedancia) => {
        if (bioimpedancia) {
          this.populateForm(bioimpedancia);
        } else {
          this.showError('Bioimpedância não encontrada.');
          this.router.navigate(['/client-dashboard', this.clientId]);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar bioimpedância:', error);
        this.showError('Erro ao carregar dados da bioimpedância');
        this.isLoading = false;
      }
    });
  }

  private populateForm(bioimpedancia: any): void {
    this.bioimpedanciaForm.patchValue({
      ...bioimpedancia,
      dataMedicao: bioimpedancia.dataMedicao ? new Date(bioimpedancia.dataMedicao) : null,
      composicaoCorporal: bioimpedancia.composicaoCorporal || {},
      analiseMusculoGordura: bioimpedancia.analiseMusculoGordura || {},
      massaMagraSegmentar: bioimpedancia.massaMagraSegmentar || {},
      gorduraSegmentar: bioimpedancia.gorduraSegmentar || {}
    });
  }

  onSubmit(): void {
    if (this.bioimpedanciaForm.valid) {
      this.isSubmitting = true;

      const bioimpedanciaData: BioimpedanciaDTO = {
        ...this.bioimpedanciaForm.value,
        clientId: this.clientId,
        dataMedicao: this.bioimpedanciaForm.value.dataMedicao?.toISOString()
      };

      const operation = this.isEditMode && this.bioimpedanciaId
        ? this.bioimpedanciaService.update(this.bioimpedanciaId, bioimpedanciaData)
        : this.bioimpedanciaService.create(bioimpedanciaData);

      operation.subscribe({
        next: () => {
          this.showSuccess(
            this.isEditMode
              ? 'Bioimpedância atualizada com sucesso!'
              : 'Bioimpedância criada com sucesso!'
          );
          this.router.navigate(['/client-dashboard', this.clientId]);
        },
        error: (error) => {
          console.error('Erro ao salvar bioimpedância:', error);
          this.showError('Erro ao salvar bioimpedância');
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.bioimpedanciaForm);
      this.showError('Por favor, preencha todos os campos obrigatórios e válidos.');
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/client-dashboard', this.clientId]);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  saveBioimpedancia(): void {
  // Implement your save logic here, e.g., call a service to save the form data
  if (this.bioimpedanciaForm.valid) {
    // Example: this.bioimpedanciaService.save(this.bioimpedanciaForm.value).subscribe(...)
    console.log('Saving bioimpedancia:', this.bioimpedanciaForm.value);
  }
}
}
