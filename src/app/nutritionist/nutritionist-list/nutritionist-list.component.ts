import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { Observable, catchError, tap, of } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NutritionistService } from '../../services/nutritionist/nutritionist.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nutritionist-list',
  standalone: true,
  imports: [
    CommonModule,
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
  templateUrl: './nutritionist-list.component.html',
  styleUrl: './nutritionist-list.component.scss'
})
export class NutritionistListComponent implements OnInit {
  // Original list of all nutritionists
  allNutritionists: any[] = [];
  // Filtered list of nutritionists for display in HTML
  filteredNutritionists: any[] = [];
  isLoading = false; // To control the loading indicator
  searchControl = new FormControl('');

  constructor(
    private nutritionistService: NutritionistService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  loadAllNutritionists(): void {
    this.isLoading = true;
    this.nutritionistService.getAllNutritionists().pipe(
      tap(nutritionists => {
        this.allNutritionists = nutritionists;
        this.filteredNutritionists = nutritionists; // Initialize filtered list
      }),
      catchError(error => {
        console.error('Error loading nutritionists:', error);
        this.snackBar.open('Erro ao carregar nutricionistas', 'Fechar', { duration: 3000 });
        return of([]); // Return an empty array on error
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  onSearch(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    this.filteredNutritionists = this.allNutritionists.filter(nutritionist =>
      nutritionist.name?.toLowerCase().includes(searchTerm) ||
      nutritionist.specialty?.toLowerCase().includes(searchTerm) ||
      nutritionist.crn?.toLowerCase().includes(searchTerm) ||
      nutritionist.email?.toLowerCase().includes(searchTerm)
    );
  }

  onViewNutritionist(nutritionist: any): void {
    this.router.navigate(['/nutritionist-view', nutritionist.id]);
  }

  onEditNutritionist(nutritionist: any): void {
    this.router.navigate(['/nutritionist-update', nutritionist.id]);
  }

  onDeleteNutritionist(nutritionistId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Você tem certeza que deseja excluir este nutricionista?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.nutritionistService.deleteNutritionist(nutritionistId).pipe(
          tap(() => {
            this.snackBar.open('Nutricionista excluído com sucesso', 'Fechar', { duration: 3000 });
            this.loadAllNutritionists(); // Reload the list after deletion
          }),
          catchError(error => {
            console.error('Erro ao excluir nutricionista:', error);
            this.snackBar.open('Erro ao excluir nutricionista', 'Fechar', { duration: 3000 });
            return of(null); // Return null on error
          })
        ).subscribe();
      }
    });
  }

  applyFilter(filterValue: string): void {
    const lowerCaseFilter = filterValue.trim().toLowerCase();

    if (!lowerCaseFilter) {
      this.filteredNutritionists = [...this.allNutritionists]; // If no filter, show all nutritionists
      return;
    }

    this.filteredNutritionists = this.allNutritionists.filter(nutritionist =>
      nutritionist.name?.toLowerCase().includes(lowerCaseFilter) ||
      nutritionist.specialty?.toLowerCase().includes(lowerCaseFilter) ||
      nutritionist.crn?.toLowerCase().includes(lowerCaseFilter) ||
      nutritionist.email?.toLowerCase().includes(lowerCaseFilter)
    );
  }

  ngAfterViewInit(): void {
    this.loadAllNutritionists();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.onSearch());
  }

  onCreateNutritionist(): void {
    this.router.navigate(['/nutritionist-create']);
  }

  ngOnInit(): void {
    this.loadAllNutritionists();
  }
}
