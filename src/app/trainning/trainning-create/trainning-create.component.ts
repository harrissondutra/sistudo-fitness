import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrainningService } from '../../services/trainning/trainning.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-trainning-create',
  templateUrl: './trainning-create.component.html',
  styleUrls: ['./trainning-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [TrainningService]
})
export class TrainningCreateComponent implements OnInit {
  trainingForm: FormGroup;
  intensityLevels = ['Iniciante', 'Intermediário', 'Avançado'];

  constructor(
    private fb: FormBuilder,
    private trainningService: TrainningService,
    private router: Router
  ) {
    this.trainingForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      durationMinutes: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      intensityLevel: ['', Validators.required],
      date: ['', Validators.required],
      userId: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.trainingForm.valid) {
      this.trainningService.createTrainning(this.trainingForm.value).subscribe({
        next: () => {
          this.router.navigate(['/trainning']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erro ao criar treino:', error);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/trainning']);
  }
}
