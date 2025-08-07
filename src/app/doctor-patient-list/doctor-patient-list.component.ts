import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DoctorService } from '../services/doctor/doctor.service';
import { Client } from '../models/client';

@Component({
  selector: 'app-doctor-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './doctor-patient-list.component.html',
  styleUrl: './doctor-patient-list.component.scss'
})
export class DoctorPatientListComponent implements OnInit {
  doctorId!: string;
  clients: Client[] = [];
  loading = true;
  error = '';
  doctorInfo: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.doctorId = params['id'];
      this.loadDoctorInfo();
      this.loadClients();
    });
  }

  loadDoctorInfo(): void {
    this.doctorService.getDoctorById(this.doctorId).subscribe({
      next: (doctor) => {
        this.doctorInfo = doctor;
      },
      error: (err) => {
        console.error('Erro ao carregar informações do médico:', err);
      }
    });
  }

  loadClients(): void {
    this.loading = true;
    this.error = '';
    
    this.doctorService.getClientsByDoctorId(this.doctorId).subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar clientes do médico:', err);
        this.error = 'Erro ao carregar a lista de clientes. Tente novamente.';
        this.loading = false;
      }
    });
  }

  viewClient(clientId: number): void {
    this.router.navigate(['/client', clientId]);
  }

  editClient(clientId: number): void {
    this.router.navigate(['/clients-edit', clientId]);
  }

  goBack(): void {
    this.router.navigate(['/doctor-list']);
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
