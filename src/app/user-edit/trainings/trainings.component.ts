import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-trainings',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class TrainingsComponent implements OnInit {
  @Input() userId!: string;
  trainingsDataSource: any[] = [];
  displayedTrainingsColumns: string[] = [
    'id',
    'name',
    'description',
    'durationMinutes',
    'intensityLevel',
    'date',
    'active',
    'actions'
  ];

  constructor() {}

  ngOnInit(): void {
    // Inicialização do componente
  }

  createNewTraining(): void {
    // Lógica para criar novo treino
  }

  editTraining(id: string): void {
    // Lógica para editar treino
  }

  deleteTraining(id: string): void {
    // Lógica para excluir treino
  }
} 