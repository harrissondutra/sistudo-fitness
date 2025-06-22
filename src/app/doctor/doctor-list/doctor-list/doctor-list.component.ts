import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { ClientService } from '../../../services/client/client.service'; // Corrected service import
import { Client } from '../../../models/client'; // Corrected model import
import { Observable, catchError, tap, of } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { IonIcon } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-doctor-list',
  imports: [
    CommonModule, // Essential for directives
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    IonicModule
  ],
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.scss'
})
export class DoctorListComponent implements OnInit{


  // Original list of all doctors
  allDoctors: any[] = []; // Renamed from allUsers to allDoctors
  // Filtered list of doctors for display in HTML
  filteredDoctors: any[] = []; // Renamed from filteredUsers to filteredDoctors
  isLoading = false; // To control the loading indicator
  searchControl = new FormControl('');
  constructor(
    private doctorService: DoctorService, // Injected DoctorService
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }
  loadAllDoctors(): void {
    this.isLoading = true;
    this.doctorService.getAllDoctors().pipe(
      tap(doctors => {
        this.allDoctors = doctors;
        this.filteredDoctors = doctors; // Initialize filtered list
      }),
      catchError(error => {
        console.error('Error loading doctors:', error);
        this.snackBar.open('Erro ao carregar médicos', 'Fechar', { duration: 3000 });
        return of([]); // Return an empty array on error
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }
  onSearch(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    this.filteredDoctors = this.allDoctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchTerm) ||
      doctor.specialty.toLowerCase().includes(searchTerm)
    );
  }
  onViewDoctor(doctorId: number): void {
    this.router.navigate(['/doctor-view', doctorId]);
  }
  onEditDoctor(doctorId: number): void {
    this.router.navigate(['/doctor-update', doctorId]);
  }
  onDeleteDoctor(doctorId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Você tem certeza que deseja excluir este médico?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.doctorService.deleteDoctor(doctorId.toString()).pipe(
          tap(() => {
            this.snackBar.open('Médico excluído com sucesso', 'Fechar', { duration: 3000 });
            this.loadAllDoctors(); // Reload the list after deletion
          }),
          catchError(error => {
            console.error('Erro ao excluir médico:', error);
            this.snackBar.open('Erro ao excluir médico', 'Fechar', { duration: 3000 });
            return of(null); // Return null on error
          })
        ).subscribe();
      }
    });
  }
  applyFilter(filterValue: string): void {
    const lowerCaseFilter = filterValue.trim().toLowerCase();

    if (!lowerCaseFilter) {
      this.filteredDoctors = [...this.allDoctors]; // If no filter, show all doctors
      return;
    }

    this.filteredDoctors = this.allDoctors.filter(doctor =>
      doctor.name.toLowerCase().includes(lowerCaseFilter) ||
      doctor.specialty.toLowerCase().includes(lowerCaseFilter)
    );
  }
  ngAfterViewInit(): void {
    this.loadAllDoctors();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.onSearch());
  }
  onCreateDoctor(): void {
    this.router.navigate(['/doctor-create']);
  }



  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
