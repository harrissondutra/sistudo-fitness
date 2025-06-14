import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';


import { UserService } from '../services/user/user.service';
import { MeasureService } from '../services/measure/measure.service';
import { TrainningService } from '../services/trainning/trainning.service';
import { User } from '../models/user';
import { Measure } from '../models/measure';
import { Trainning } from '../models/trainning';
import { catchError, filter, map, switchMap, tap, forkJoin, of, Observable } from 'rxjs';
import { NgxMaskDirective } from 'ngx-mask';


@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatGridListModule,
    MatDividerModule,
    MatIconModule,
    NgxMaskDirective,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, AfterViewInit {
  userId: number | null = null;
  userForm!: FormGroup;
  measureForm!: FormGroup;
  isLoading: boolean = true;
  selectedFile: File | null = null;

  userTrainings: Trainning[] = [];
  trainingsDataSource: MatTableDataSource<Trainning> = new MatTableDataSource();
  displayedTrainingsColumns: string[] = ['id', 'name', 'description', 'durationMinutes', 'intensityLevel', 'date', 'active', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('trainingsPaginator') trainingsPaginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private measureService: MeasureService,
    private trainningService: TrainningService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForms();
    this.loadUserDataAndMeasures();
  }

  ngAfterViewInit(): void {
    this.trainingsDataSource.paginator = this.trainingsPaginator;
  }

  /**
   * Initializes both FormGroups (userForm and measureForm).
   */
  private initializeForms(): void {
    this.userForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      weight: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(50), Validators.max(300)]]
    });

    this.measureForm = this.fb.group({
      id: [null],
      ombro: [null, [Validators.min(0), Validators.max(200)]],
      cintura: [null, [Validators.min(0), Validators.max(200)]],
      quadril: [null, [Validators.min(0), Validators.max(200)]],
      panturrilhaDireita: [null, [Validators.min(0), Validators.max(100)]],
      panturrilhaEsquerda: [null, [Validators.min(0), Validators.max(100)]],
      bracoDireito: [null, [Validators.min(0), Validators.max(100)]],
      bracoEsquerdo: [null, [Validators.min(0), Validators.max(100)]],
      coxaDireita: [null, [Validators.min(0), Validators.max(150)]],
      coxaEsquerda: [null, [Validators.min(0), Validators.max(150)]],
      peitoral: [null, [Validators.min(0), Validators.max(200)]],
      abdomem: [null, [Validators.min(0), Validators.max(200)]],
      abdominal: [null, [Validators.min(0), Validators.max(200)]],
      suprailiaca: [null, [Validators.min(0), Validators.max(100)]],
      subescapular: [null, [Validators.min(0), Validators.max(100)]],
      triceps: [null, [Validators.min(0), Validators.max(100)]],
      axilar: [null, [Validators.min(0), Validators.max(100)]],
      torax: [null, [Validators.min(0), Validators.max(200)]],
      userId: [null]
    });
  }

  /**
   * Loads user data and their measures, and now also user-specific trainings.
   */
  private loadUserDataAndMeasures(): void {
    this.isLoading = true;
    this.route.paramMap.pipe(
      filter(params => params.has('id')),
      map(params => Number(params.get('id'))),
      tap(id => this.userId = id),
      switchMap(id => {
        const userRequest = this.userService.getUserById(id).pipe(
          catchError(error => {
            console.error('Error fetching user:', error);
            this.snackBar.open('Error loading user data. Please try again.', 'Close', { duration: 5000 });
            this.router.navigate(['/users-list']);
            return of(null);
          })
        );
        const measureRequest = this.measureService.getMeasureByUserId(id).pipe(
          catchError(error => {
            console.warn('Measures for this user not found or error loading:', error);
            return of(null);
          })
        );
        const trainingsRequest = this.trainningService.listAllTrainnings().pipe(
          map(allTrainings => allTrainings.filter(t => t.userId === id)),
          catchError(error => {
            console.error('Error fetching user trainings:', error);
            this.snackBar.open('Error loading user trainings. Please try again.', 'Close', { duration: 5000 });
            return of([]);
          })
        );
        return forkJoin({ user: userRequest, measures: measureRequest, trainings: trainingsRequest });
      })
    ).subscribe(({ user, measures, trainings }) => {
      if (user) {
        const cpfFormattedForPatch = user.cpf ? user.cpf.replace(/\D/g, '') : null;
        this.userForm.patchValue({
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: cpfFormattedForPatch,
          weight: user.weight,
          height: user.height != null ? user.height * 100 : null
        });
      }

      if (measures) {
        this.measureForm.patchValue(measures);
        this.measureForm.get('userId')?.setValue(this.userId);
      } else {
        this.measureForm.get('userId')?.setValue(this.userId);
      }

      if (trainings) {
        this.userTrainings = trainings;
        this.trainingsDataSource.data = trainings;
      }

      this.userForm.markAllAsTouched();
      this.userForm.updateValueAndValidity();
      this.measureForm.markAllAsTouched();
      this.measureForm.updateValueAndValidity();

      console.log("Dados do usuário:", user);
      console.log("Dados das medidas:", measures);
      console.log("Treinos do usuário:", this.userTrainings);
      console.log("Status do Formulário de Usuário:", this.userForm.status, "Erros:", this.userForm.errors);
      console.log("Status do Formulário de Medidas:", this.measureForm.status, "Erros:", this.measureForm.errors);

      this.isLoading = false;
    });
  }

  /**
   * Handles file selection for upload.
   * @param event The change event from the file input.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.snackBar.open(`Arquivo selecionado: ${this.selectedFile.name}`, 'Fechar', { duration: 2000 });
    } else {
      this.selectedFile = null;
    }
  }

  /**
   * Handles the submission of both forms (user and measures).
   */
  onSubmit(): void {
    const isUserFormValid = this.userForm.valid;
    const isMeasureFormValid = this.measureForm.valid;

    if (isUserFormValid && isMeasureFormValid) {
      const userData = this.userForm.value;
      const measureData = this.measureForm.value;

      const updatedUser: User = {
        id: this.userId || userData.id,
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf ? String(userData.cpf).replace(/\D/g, '') : '',
        weight: userData.weight ? parseFloat(String(userData.weight).replace(',', '.')) : null,
        height: userData.height ? parseFloat(String(userData.height).replace(',', '.')!) / 100 : null,
      };

      const updatedMeasure: Measure = {
        ...measureData,
        userId: this.userId!
      };
      if (updatedMeasure.id === null) {
        delete updatedMeasure.id;
      }

      const updateRequests: Observable<any>[] = [];

      updateRequests.push(this.userService.updateUser(updatedUser).pipe(
        tap(() => console.log('User updated successfully!')),
        catchError(error => {
          console.error('Error updating user:', error);
          this.snackBar.open('Error updating user data.', 'Fechar', { duration: 5000 });
          return of(null);
        })
      ));

      if (measureData.id) {
        updateRequests.push(this.measureService.updateMeasure(updatedMeasure).pipe(
          tap(() => console.log('Measures updated successfully!')),
          catchError(error => {
            console.error('Error updating measures:', error);
            this.snackBar.open('Error updating measure data.', 'Fechar', { duration: 5000 });
            return of(null);
          })
        ));
      } else {
        updateRequests.push(this.measureService.createMeasure(updatedMeasure).pipe(
          tap(() => console.log('Measures created successfully!')),
          catchError(error => {
            console.error('Error creating measures:', error);
            this.snackBar.open('Error creating measure data.', 'Fechar', { duration: 5000 });
            return of(null);
          })
        ));
      }

      forkJoin(updateRequests).subscribe({
        next: (results) => {
          const allSuccessful = results.every(result => result !== null);
          if (allSuccessful) {
            this.snackBar.open('Dados atualizados com sucesso!', 'Fechar', { duration: 3000 });
            this.router.navigate(['/users-list']);
          } else {
            this.snackBar.open('Algumas atualizações falharam. Verifique o console.', 'Fechar', { duration: 5000 });
          }
        },
        error: (error) => {
          console.error('General error in form submission:', error);
          this.snackBar.open('General error saving data. Check the console.', 'Fechar', { duration: 5000 });
        }
      });

    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
      this.userForm.markAllAsTouched();
      this.measureForm.markAllAsTouched();
      this.userForm.updateValueAndValidity();
      this.measureForm.updateValueAndValidity();
    }
  }

  /**
   * Navega para a tela de criação de um novo treino, passando o ID do usuário.
   */
  createNewTraining(): void {
    if (this.userId) {
      // Navega para a rota de criação de treino, passando o userId como query parameter
      this.router.navigate(['/trainning-create'], { queryParams: { userId: this.userId } });
    } else {
      this.snackBar.open('Não foi possível determinar o ID do usuário para criar o treino.', 'Fechar', { duration: 3000 });
    }
  }

  /**
   * Navega para a tela de edição de um treino específico.
   * @param trainingId O ID do treino a ser editado.
   */
  editTraining(trainingId: number): void {
    // CORREÇÃO: Implementa a navegação real para a tela de edição de treinos
    this.router.navigate(['/trainings-edit', trainingId]);
    this.snackBar.open(`Navegando para edição do treino ${trainingId}.`, 'Fechar', { duration: 2000 });
  }

  /**
   * Lida com a exclusão de um treino após confirmação.
   * @param trainingId O ID do treino a ser apagado.
   */
  deleteTraining(trainingId: number): void {
    if (confirm('Tem certeza que deseja apagar este treino? Esta ação é irreversível.')) {
      this.trainningService.deleteTrainning(trainingId).subscribe({
        next: () => {
          this.snackBar.open('Treino apagado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadUserDataAndMeasures(); // Recarrega os dados do usuário, incluindo os treinos
        },
        error: (error) => {
          console.error('Erro ao apagar treino:', error);
          this.snackBar.open('Erro ao apagar treino. Verifique o console para mais detalhes.', 'Fechar', { duration: 5000 });
        }
      });
    }
  }

  /**
   * Cancels editing and returns to the user list without saving.
   */
  cancel(): void {
    this.router.navigate(['/users-list']);
  }
}
