import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';

interface Measure {
  data: Date;
  ombro: number | null;
  bracoDireito: number | null;
  bracoEsquerdo: number | null;
  peitoral: number | null;
  cintura: number | null;
  abdomem: number | null;
  abdominal: number | null;
  torax: number | null;
  quadril: number | null;
  coxaDireita: number | null;
  coxaEsquerda: number | null;
  panturrilhaDireita: number | null;
  panturrilhaEsquerda: number | null;
  suprailiaca: number | null;
  subescapular: number | null;
  triceps: number | null;
  axilar: number | null;
}

@Component({
  selector: 'app-measures',
  templateUrl: './measures.component.html',
  styleUrls: ['./measures.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule
  ]
})
export class MeasuresComponent implements OnInit {
  @Input() userId!: string;
  measureForm: FormGroup;
  measuresDataSource: Measure[] = [];
  displayedMeasuresColumns: string[] = [
    'data',
    'ombro',
    'cintura',
    'quadril',
    'panturrilhaDireita',
    'panturrilhaEsquerda',
    'bracoDireito',
    'bracoEsquerdo',
    'coxaDireita',
    'coxaEsquerda',
    'peitoral',
    'abdomem',
    'abdominal',
    'suprailiaca',
    'subescapular',
    'triceps',
    'axilar',
    'torax'
  ];

  constructor(private fb: FormBuilder) {
    this.measureForm = this.fb.group({
      ombro: [''],
      bracoDireito: [''],
      bracoEsquerdo: [''],
      peitoral: [''],
      cintura: [''],
      abdomem: [''],
      abdominal: [''],
      torax: [''],
      quadril: [''],
      coxaDireita: [''],
      coxaEsquerda: [''],
      panturrilhaDireita: [''],
      panturrilhaEsquerda: [''],
      suprailiaca: [''],
      subescapular: [''],
      triceps: [''],
      axilar: ['']
    });
  }

  ngOnInit(): void {
    // Inicialização do componente
  }

  onSubmit(): void {
    if (this.measureForm.valid) {
      // Lógica para salvar as medidas
    }
  }

  formatMeasure(value: number | null, unit: string): string {
    return value !== null ? `${value} ${unit}` : '-';
  }
} 