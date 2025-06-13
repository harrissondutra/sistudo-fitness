import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // For feedback messages
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading spinner
import { MatCardModule } from '@angular/material/card'; // For Material card layout
import { MatGridListModule } from '@angular/material/grid-list'; // For Material grid layout
import { MatDividerModule } from '@angular/material/divider'; // For Material divider
import { MatIconModule } from '@angular/material/icon'; // For Material icons

import { UserService } from '../services/user/user.service'; // Adjust path
import { MeasureService } from '../services/measure/measure.service'; // Import MeasureService
import { User } from '../models/user'; // Adjust path
import { Measure } from '../models/measure'; // Import Measure model
import { catchError, filter, map, switchMap, tap, forkJoin, of, Observable } from 'rxjs'; // Corrected: Added 'of' and 'Observable'
import { NgxMaskDirective } from 'ngx-mask'; // For masks
import { MatFormField } from '@angular/material/form-field';

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
    MatCardModule, // Add MatCardModule
    MatGridListModule, // Add MatGridListModule
    MatDividerModule, // Add MatDividerModule
    MatIconModule, // Add MatIconModule
    NgxMaskDirective,
    MatFormField // Add MatFormField for form field styling
  ],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {
  userId: number | null = null;
  userForm!: FormGroup;
  measureForm!: FormGroup; // New FormGroup for measures
  isLoading: boolean = true; // To control loading state
  selectedFile: File | null = null; // For photo upload

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute, // To get route parameters
    private userService: UserService,
    private measureService: MeasureService, // Inject MeasureService
    private router: Router,
    private snackBar: MatSnackBar // To display messages to the user
  ) { }

  ngOnInit(): void {
    this.initializeForms(); // Initializes both forms
    this.loadUserDataAndMeasures();   // Loads user data and measures
  }

  /**
   * Initializes both FormGroups (userForm and measureForm).
   */
  private initializeForms(): void {
    this.userForm = this.fb.group({
      id: [null], // ID is kept in the form, but usually not editable by the user
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      // CPF validation: 11 numeric digits
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      // Weight in kg: between 30 and 300
      weight: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      // Height in centimeters: between 50 and 300 cm (to represent 0.5m to 3.0m)
      height: [null, [Validators.required, Validators.min(50), Validators.max(300)]]
    });

    // Initializes the measures form with all fields from the Measure interface
    this.measureForm = this.fb.group({
      id: [null], // Measure ID (if exists)
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
      userId: [null] // Will be populated with the user ID
    });
  }

  /**
   * Loads user data and their measures.
   */
  private loadUserDataAndMeasures(): void {
    this.isLoading = true;
    this.route.paramMap.pipe(
      filter(params => params.has('id')),
      map(params => Number(params.get('id'))),
      tap(id => this.userId = id),
      switchMap(id => {
        // Makes parallel requests for user data and measures
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
            // Returns an empty Measure object or null if no measures
            return of(null);
          })
        );
        return forkJoin({ user: userRequest, measures: measureRequest });
      })
    ).subscribe(({ user, measures }) => {
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
        this.measureForm.get('userId')?.setValue(this.userId); // Ensure userId is set
      } else {
        // If no measures, initialize userId in measureForm for a new entry
        this.measureForm.get('userId')?.setValue(this.userId);
      }

      // Force revalidation and mark fields as touched
      this.userForm.markAllAsTouched();
      this.userForm.updateValueAndValidity();
      this.measureForm.markAllAsTouched();
      this.measureForm.updateValueAndValidity();

      console.log("Dados do usuário:", user);
      console.log("Dados das medidas:", measures);
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
      // Here you would implement the actual upload logic to the backend
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

      // Prepare User object for backend
      const updatedUser: User = {
        id: this.userId || userData.id,
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf ? String(userData.cpf).replace(/\D/g, '') : '',
        weight: userData.weight ? parseFloat(String(userData.weight).replace(',', '.')) : null,
        height: userData.height ? parseFloat(String(userData.height).replace(',', '.')!) / 100 : null,
      };

      // Prepare Measure object for backend
      const updatedMeasure: Measure = {
        ...measureData,
        userId: this.userId! // Ensure userId is in the measure
      };
      if (updatedMeasure.id === null) {
        delete updatedMeasure.id; // Ensure ID is not sent if it's for creating a new measure
      }

      // Array to store update Observables
      const updateRequests: Observable<any>[] = [];

      // User update request
      updateRequests.push(this.userService.updateUser(updatedUser).pipe(
        tap(() => console.log('User updated successfully!')),
        catchError(error => {
          console.error('Error updating user:', error);
          this.snackBar.open('Error updating user data.', 'Fechar', { duration: 5000 });
          return of(null); // Return null so forkJoin continues
        })
      ));

      // Measure update/creation request
      if (measureData.id) { // If measure ID exists, update
        updateRequests.push(this.measureService.updateMeasure(updatedMeasure).pipe(
          tap(() => console.log('Measures updated successfully!')),
          catchError(error => {
            console.error('Error updating measures:', error);
            this.snackBar.open('Error updating measure data.', 'Fechar', { duration: 5000 });
            return of(null);
          })
        ));
      } else { // If measure ID does not exist, create
        updateRequests.push(this.measureService.createMeasure(updatedMeasure).pipe(
          tap(() => console.log('Measures created successfully!')),
          catchError(error => {
            console.error('Error creating measures:', error);
            this.snackBar.open('Error creating measure data.', 'Fechar', { duration: 5000 });
            return of(null);
          })
        ));
      }

      // Execute all requests in parallel
      forkJoin(updateRequests).subscribe({
        next: (results) => {
          // Check if all requests were successful (did not return null due to error)
          const allSuccessful = results.every(result => result !== null);
          if (allSuccessful) {
            this.snackBar.open('Dados atualizados com sucesso!', 'Fechar', { duration: 3000 });
            this.router.navigate(['/users-list']); // Redirect after complete success
          } else {
            this.snackBar.open('Algumas atualizações falharam. Verifique o console.', 'Fechar', { duration: 5000 });
          }
        },
        error: (error) => {
          // This error would only be caught if forkJoin fails completely before any internal catchError
          console.error('General error in form submission:', error);
          this.snackBar.open('General error saving data. Check the console.', 'Fechar', { duration: 5000 });
        }
      });

    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios corretamente.', 'Fechar', { duration: 3000 });
      this.userForm.markAllAsTouched();
      this.measureForm.markAllAsTouched(); // Mark measure fields as touched
      this.userForm.updateValueAndValidity();
      this.measureForm.updateValueAndValidity();
    }
  }

  /**
   * Cancels editing and returns to the user list without saving.
   */
  cancel(): void {
    this.router.navigate(['/users-list']);
  }
}
