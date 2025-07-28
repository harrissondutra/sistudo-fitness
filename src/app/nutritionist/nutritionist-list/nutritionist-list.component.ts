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
        console.log('Nutricionistas carregados:', nutritionists);

        // Verificar a estrutura do primeiro objeto para diagnóstico
        if (nutritionists && nutritionists.length > 0) {
          console.log('Exemplo do primeiro nutricionista:', JSON.stringify(nutritionists[0]));
          console.log('Propriedades disponíveis:', Object.keys(nutritionists[0]));
        }

        this.allNutritionists = nutritionists;
        this.filteredNutritionists = nutritionists;
      }),
      catchError(error => {
        console.error('Error loading nutritionists:', error);
        this.snackBar.open('Erro ao carregar nutricionistas', 'Fechar', { duration: 3000 });
        return of([]);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  onSearch(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    this.filteredNutritionists = this.allNutritionists.filter(nutritionist =>
      nutritionist.name?.toLowerCase().includes(searchTerm) ||
      nutritionist.specialty?.toLowerCase().includes(searchTerm) ||
      nutritionist.registry?.toLowerCase().includes(searchTerm) || // Corrigido: registry em vez de crn
      nutritionist.email?.toLowerCase().includes(searchTerm)
    );
  }

  onViewNutritionist(nutritionist: any): void {
  console.log('Tentando visualizar nutricionista:', nutritionist);

  // Verificar se o nutricionista existe
  if (!nutritionist) {
    this.snackBar.open('Erro: dados do nutricionista não disponíveis', 'Fechar', { duration: 3000 });
    return;
  }

  // Tentar diferentes propriedades de ID que podem estar presentes
  const nutritionistId = nutritionist.id || nutritionist._id || nutritionist.nutritionistId;

  if (nutritionistId === undefined || nutritionistId === null) {
    console.error('Erro: ID do nutricionista não encontrado:', nutritionist);
    console.log('Propriedades disponíveis:', Object.keys(nutritionist));
    this.snackBar.open('Erro: ID do nutricionista não encontrado', 'Fechar', { duration: 3000 });
    return;
  }

  console.log('Navegando para nutricionista ID:', nutritionistId);
  this.router.navigate(['/nutritionist-view', nutritionistId]);
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
      this.filteredNutritionists = [...this.allNutritionists];
      return;
    }

    this.filteredNutritionists = this.allNutritionists.filter(nutritionist =>
      nutritionist.name?.toLowerCase().includes(lowerCaseFilter) ||
      nutritionist.specialty?.toLowerCase().includes(lowerCaseFilter) ||
      nutritionist.registry?.toLowerCase().includes(lowerCaseFilter) || // Corrigido: registry em vez de crn
      nutritionist.email?.toLowerCase().includes(lowerCaseFilter)
    );
  }

  ngAfterViewInit(): void {

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.onSearch());
  }

  ngOnInit(): void {
    this.loadAllNutritionists();  // ✅ Mantenha apenas esta chamada
  }

  onCreateNutritionist(): void {
    this.router.navigate(['/nutritionist-create']);
  }


}
