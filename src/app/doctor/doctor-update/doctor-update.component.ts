import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IonicModule } from '@ionic/angular';

import { Doctor } from '../../models/doctor';
import { DoctorService } from '../../services/doctor/doctor.service';

@Component({
  selector: 'app-doctor-update',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    IonicModule
  ],
  templateUrl: './doctor-update.component.html',
  styleUrl: './doctor-update.component.scss'
})
export class DoctorUpdateComponent implements OnInit {
  doctorForm!: FormGroup;
  doctorId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.doctorId = this.route.snapshot.paramMap.get('id');

    if (this.doctorId) {
      this.loadDoctorData(this.doctorId);
    }
  }

  initializeForm(): void {
    this.doctorForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      crm: ['', Validators.required],
      specialty: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      clientId: [null]
    });
  }

  loadDoctorData(id: string): void {
    this.isLoading = true;
    this.doctorService.getDoctorById(id).subscribe({
      next: (doctor: Doctor) => {
        this.doctorForm.patchValue(doctor);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar médico:', error);
        // This is the snackbar message and navigation when doctor is not found or other load error occurs
        this.snackBar.open('Médicos não cadastrados.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/doctor-list']); // Redirects to the doctor list
      }
    });
  }

  onSubmit(): void {
    if (this.doctorForm.valid) {
      this.isLoading = true;
      const doctor: Doctor = this.doctorForm.value;

      if (this.doctorId) {
        this.doctorService.updateDoctor(doctor).subscribe({ // Assuming updateDoctor takes the full Doctor object
          next: () => {
            this.snackBar.open('Médico atualizado com sucesso!', 'Fechar', { duration: 3000 });
            this.router.navigate(['/doctor-list']);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erro ao atualizar médico:', error);
            this.snackBar.open('Erro ao atualizar médico.', 'Fechar', { duration: 3000 });
            this.isLoading = false;
          }
        });
      } else {
        this.doctorService.createDoctor(doctor).subscribe({
          next: () => {
            this.snackBar.open('Médico cadastrado com sucesso!', 'Fechar', { duration: 3000 });
            this.router.navigate(['/doctor-list']);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erro ao cadastrar médico:', error);
            this.snackBar.open('Erro ao cadastrar médico.', 'Fechar', { duration: 3000 });
            this.isLoading = false;
          }
        });
      }
    } else {
      this.doctorForm.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
    }
  }

  onCancel(): void {
    this.router.navigate(['/doctor-list']);
  }
}
