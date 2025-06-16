import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface Measure {
  ombro: number | null;
  peitoral: number | null;
  cintura: number | null;
  quadril: number | null;
  abdomem: number | null;
  torax: number | null;
  bracoDireito: number | null;
  bracoEsquerdo: number | null;
  coxaDireita: number | null;
  coxaEsquerda: number | null;
  panturrilhaDireita: number | null;
  panturrilhaEsquerda: number | null;
  abdominal: number | null;
  suprailiaca: number | null;
  subescapular: number | null;
  triceps: number | null;
  axilar: number | null;
}

@Component({
    selector: 'app-edit-measures',
    templateUrl: './edit-measures.component.html',
    styleUrls: ['./edit-measures.component.scss'],
    imports: [
        CommonModule,
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

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditMeasuresComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Measure
  ) {
    this.measuresForm = this.fb.group({
      ombro: [data.ombro, [Validators.min(0), Validators.max(200)]],
      peitoral: [data.peitoral, [Validators.min(0), Validators.max(200)]],
      cintura: [data.cintura, [Validators.min(0), Validators.max(200)]],
      quadril: [data.quadril, [Validators.min(0), Validators.max(200)]],
      abdomem: [data.abdomem, [Validators.min(0), Validators.max(200)]],
      torax: [data.torax, [Validators.min(0), Validators.max(200)]],
      bracoDireito: [data.bracoDireito, [Validators.min(0), Validators.max(100)]],
      bracoEsquerdo: [data.bracoEsquerdo, [Validators.min(0), Validators.max(100)]],
      coxaDireita: [data.coxaDireita, [Validators.min(0), Validators.max(100)]],
      coxaEsquerda: [data.coxaEsquerda, [Validators.min(0), Validators.max(100)]],
      panturrilhaDireita: [data.panturrilhaDireita, [Validators.min(0), Validators.max(100)]],
      panturrilhaEsquerda: [data.panturrilhaEsquerda, [Validators.min(0), Validators.max(100)]],
      abdominal: [data.abdominal, [Validators.min(0), Validators.max(100)]],
      suprailiaca: [data.suprailiaca, [Validators.min(0), Validators.max(100)]],
      subescapular: [data.subescapular, [Validators.min(0), Validators.max(100)]],
      triceps: [data.triceps, [Validators.min(0), Validators.max(100)]],
      axilar: [data.axilar, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    // Inicialização adicional se necessário
  }

  onSubmit(): void {
    if (this.measuresForm.valid) {
      this.dialogRef.close(this.measuresForm.value);
    } else {
      this.snackBar.open('Por favor, corrija os erros no formulário', 'Fechar', {
        duration: 3000
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 