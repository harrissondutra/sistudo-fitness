import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../services/user/user.service';
import { User } from '../models/user';
import { Measure } from '../models/measure';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { EditMeasuresModule } from './measures/edit-measures.module';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditMeasuresComponent } from './measures/edit-measures.component';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

interface EvolutionPhoto {
  id: string;
  url: string;
  date: Date;
  description: string;
}

interface Training {
  id: string;
  startDate: Date;
  endDate?: Date;
  goal: string;
  frequency: number;
}

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
  standalone: true,
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
    EditMeasuresModule,
    MatDialogModule
  ]
})
export class UserEditComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  isLoading = false;
  isNewUser = true;
  evolutionPhotos: EvolutionPhoto[] = [];
  currentTraining: Training | null = null;
  trainingHistory: Training[] = [];
  trainingColumns = ['startDate', 'endDate', 'goal', 'actions'];
  private destroy$ = new Subject<void>();

  // Medidas
  ombro: number | null = null;
  peitoral: number | null = null;
  cintura: number | null = null;
  quadril: number | null = null;
  abdomem: number | null = null;
  torax: number | null = null;
  bracoDireito: number | null = null;
  bracoEsquerdo: number | null = null;
  coxaDireita: number | null = null;
  coxaEsquerda: number | null = null;
  panturrilhaDireita: number | null = null;
  panturrilhaEsquerda: number | null = null;
  abdominal: number | null = null;
  suprailiaca: number | null = null;
  subescapular: number | null = null;
  triceps: number | null = null;
  axilar: number | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    public router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)]],
      birthDate: [null],
      height: [null, [Validators.min(50), Validators.max(300)]],
      weight: [null, [Validators.min(20), Validators.max(500)]],
      arm: [null, [Validators.min(0), Validators.max(100)]],
      chest: [null, [Validators.min(0), Validators.max(200)]],
      waist: [null, [Validators.min(0), Validators.max(200)]],
      hip: [null, [Validators.min(0), Validators.max(200)]]
    });
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.isNewUser = false;
      this.loadUser(userId);
      this.loadPhotos(userId);
      this.loadTrainings(userId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUser(id: string): void {
    this.isLoading = true;
    this.userService.getUserById(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (user: User) => {
          this.userForm.patchValue(user);
        },
        error: (error: Error) => {
          console.error('Erro ao carregar usuário:', error);
          this.snackBar.open('Erro ao carregar usuário', 'Fechar', { duration: 3000 });
        }
      });
  }

  private loadPhotos(userId: string): void {
    // TODO: Implementar carregamento de fotos
    this.evolutionPhotos = [];
  }

  private loadTrainings(userId: string): void {
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

  viewTrainingDetails(training: Training): void {
    // TODO: Implementar visualização de detalhes do treino
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  editTraining(training: Training): void {
    // TODO: Implementar edição de treino
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  createNewTraining(): void {
    // TODO: Implementar criação de novo treino
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 3000 });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const userId = this.route.snapshot.paramMap.get('id');
      const userData: User = this.userForm.value;

      if (userId) {
        userData.id = userId;
      }

      const request$ = userId
        ? this.userService.updateUser(userData)
        : this.userService.createUser(userData);

      request$
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => this.isLoading = false)
        )
        .subscribe({
          next: () => {
            this.snackBar.open(
              `Usuário ${userId ? 'atualizado' : 'criado'} com sucesso!`,
              'Fechar',
              { duration: 3000 }
            );
            this.router.navigate(['/users']);
          },
          error: (error: Error) => {
            console.error(`Erro ao ${userId ? 'atualizar' : 'criar'} usuário:`, error);
            this.snackBar.open(
              `Erro ao ${userId ? 'atualizar' : 'criar'} usuário`,
              'Fechar',
              { duration: 3000 }
            );
          }
        });
    } else {
      this.markFormGroupTouched(this.userForm);
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
    return value !== null ? value.toString() : '';
  }

  formatMeasure(value: number | null): string {
    return value !== null ? value.toFixed(1) : '-';
  }

  editMeasures(): void {
    const dialogRef = this.dialog.open(EditMeasuresComponent, {
      width: '800px',
      data: {
        ombro: this.ombro,
        peitoral: this.peitoral,
        cintura: this.cintura,
        quadril: this.quadril,
        abdomem: this.abdomem,
        torax: this.torax,
        bracoDireito: this.bracoDireito,
        bracoEsquerdo: this.bracoEsquerdo,
        coxaDireita: this.coxaDireita,
        coxaEsquerda: this.coxaEsquerda,
        panturrilhaDireita: this.panturrilhaDireita,
        panturrilhaEsquerda: this.panturrilhaEsquerda,
        abdominal: this.abdominal,
        suprailiaca: this.suprailiaca,
        subescapular: this.subescapular,
        triceps: this.triceps,
        axilar: this.axilar
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ombro = result.ombro;
        this.peitoral = result.peitoral;
        this.cintura = result.cintura;
        this.quadril = result.quadril;
        this.abdomem = result.abdomem;
        this.torax = result.torax;
        this.bracoDireito = result.bracoDireito;
        this.bracoEsquerdo = result.bracoEsquerdo;
        this.coxaDireita = result.coxaDireita;
        this.coxaEsquerda = result.coxaEsquerda;
        this.panturrilhaDireita = result.panturrilhaDireita;
        this.panturrilhaEsquerda = result.panturrilhaEsquerda;
        this.abdominal = result.abdominal;
        this.suprailiaca = result.suprailiaca;
        this.subescapular = result.subescapular;
        this.triceps = result.triceps;
        this.axilar = result.axilar;

        this.snackBar.open('Medidas atualizadas com sucesso!', 'Fechar', {
          duration: 3000
        });
      }
    });
  }
}
