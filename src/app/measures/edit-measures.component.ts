import { Component, Inject, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Measure } from '../models/measure';
import { MeasureService } from '../services/measure/measure.service';

@Component({
    selector: 'app-edit-measures',
    templateUrl: './edit-measures.component.html',
    styleUrls: ['./edit-measures.component.scss'],
    standalone: true,
    imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
]
})
export class EditMeasuresComponent implements OnInit {
  measuresForm: FormGroup;
  clientId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditMeasuresComponent>,
    private snackBar: MatSnackBar,
    private measureService: MeasureService,
    @Inject(MAT_DIALOG_DATA) public data: { measure: Measure, clientId?: number }
  ) {
    this.clientId = data.clientId;

    // Inicializa o formulário com valores do modelo, usando operador de coalescência nula para tratar valores indefinidos
    this.measuresForm = this.fb.group({
      ombro: [data.measure?.ombro ?? null, [Validators.min(0), Validators.max(200)]],
      peitoral: [data.measure?.peitoral ?? null, [Validators.min(0), Validators.max(200)]],
      cintura: [data.measure?.cintura ?? null, [Validators.min(0), Validators.max(200)]],
      quadril: [data.measure?.quadril ?? null, [Validators.min(0), Validators.max(200)]],
      abdomem: [data.measure?.abdomem ?? null, [Validators.min(0), Validators.max(200)]],
      torax: [data.measure?.torax ?? null, [Validators.min(0), Validators.max(200)]],
      bracoDireito: [data.measure?.braco_direito ?? null, [Validators.min(0), Validators.max(100)]],
      bracoEsquerdo: [data.measure?.braco_esquerdo ?? null, [Validators.min(0), Validators.max(100)]],
      coxaDireita: [data.measure?.coxa_direita ?? null, [Validators.min(0), Validators.max(100)]],
      coxaEsquerda: [data.measure?.coxa_esquerda ?? null, [Validators.min(0), Validators.max(100)]],
      panturrilhaDireita: [data.measure?.panturrilha_direita ?? null, [Validators.min(0), Validators.max(100)]],
      panturrilhaEsquerda: [data.measure?.panturrilha_esquerda ?? null, [Validators.min(0), Validators.max(100)]],
      abdominal: [data.measure?.abdominal ?? null, [Validators.min(0), Validators.max(100)]],
      suprailiaca: [data.measure?.suprailiaca ?? null, [Validators.min(0), Validators.max(100)]],
      subescapular: [data.measure?.subescapular ?? null, [Validators.min(0), Validators.max(100)]],
      triceps: [data.measure?.triceps ?? null, [Validators.min(0), Validators.max(100)]],
      axilar: [data.measure?.axilar ?? null, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    // Inicialização adicional se necessário
  }

  onSubmit(): void {
    if (this.measuresForm.valid) {
      const measureData: Measure = this.measuresForm.value;

      // Se temos um id de medida existente, incluí-lo nos dados para atualização
      if (this.data.measure?.id) {
        measureData.id = this.data.measure.id;
      }

      // Inclui a data atual se for uma nova medida
      if (!measureData.data) {
        measureData.data = new Date();
      }

      // Verifica se está no fluxo de criação para um cliente específico
      if (this.clientId) {
        this.measureService.createMeasure(this.clientId, measureData)
          .subscribe({
            next: (result) => {
              this.snackBar.open('Medidas salvas com sucesso!', 'Fechar', {
                duration: 3000
              });
              this.dialogRef.close(result);
            },
            error: (error) => {
              console.error('Erro ao salvar medidas:', error);
              this.snackBar.open('Erro ao salvar medidas. Por favor, tente novamente.', 'Fechar', {
                duration: 5000
              });
            }
          });
      } else if (measureData.id) {
        // Está atualizando uma medida existente
        if (typeof this.clientId === 'number') {
          this.measureService.updateMeasure(this.clientId, measureData)
            .subscribe({
              next: (result) => {
                this.snackBar.open('Medidas atualizadas com sucesso!', 'Fechar', {
                  duration: 3000
                });
                this.dialogRef.close(result);
              },
              error: (error) => {
                console.error('Erro ao atualizar medidas:', error);
                this.snackBar.open('Erro ao atualizar medidas. Por favor, tente novamente.', 'Fechar', {
                  duration: 5000
                });
              }
            });
        } else {
          this.snackBar.open('Não foi possível identificar o cliente para atualizar as medidas', 'Fechar', {
            duration: 3000
          });
        }
      } else {
        // Não temos informações suficientes
        this.snackBar.open('Não foi possível identificar o cliente para salvar as medidas', 'Fechar', {
          duration: 3000
        });
      }
    } else {
      // Formulário inválido
      this.snackBar.open('Por favor, corrija os erros no formulário', 'Fechar', {
        duration: 3000
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
