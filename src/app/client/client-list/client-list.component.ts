import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { ClientService } from '../../services/client/client.service'; // Corrected service import
import { Client } from '../../models/client'; // Corrected model import
import { Observable, catchError, tap, of } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component'; // Verify path
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Ionic Module (needed for ion-list, ion-item, ion-button, ion-icon)
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common'; // Added CommonModule for directives like ngIf, ngFor

@Component({
  selector: 'app-client-list', // Renamed selector
  standalone: true, // Marking as standalone
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
  templateUrl: './client-list.component.html', // Renamed template file
  styleUrls: ['./client-list.component.scss'] // Renamed stylesheet file
})
export class ClientListComponent implements OnInit { // Renamed class
  // Original list of all clients
  allClients: Client[] = []; // Renamed from allUsers to allClients
  // Filtered list of clients for display in HTML
  filteredClients: Client[] = []; // Renamed from filteredUsers to filteredClients

  isLoading = false; // To control the loading indicator

  searchControl = new FormControl('');

  constructor(
    private clientService: ClientService, // Injected ClientService
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAllClients(); // Call loadAllClients

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => this.applyFilter(value || '')) // Apply filter on search input changes
    ).subscribe();
  }

  /**
   * Loads all clients from the API using the ClientService.
   * Clients are stored in 'allClients' and then filtered into 'filteredClients'.
   */
  loadAllClients(): void { // Renamed method
    this.isLoading = true;
    this.clientService.getAllClients().pipe( // Using getAllClients() from ClientService
      tap(clients => { // Renamed parameter to clients
        this.allClients = clients; // Store the complete list
        this.applyFilter(this.searchControl.value || ''); // Apply initial or current filter
      }),
      catchError(error => {
        console.error('Erro ao carregar clientes:', error);
        this.snackBar.open('Erro ao carregar clientes. Por favor, tente novamente mais tarde.', 'Fechar', { duration: 5000 });
        this.allClients = [];
        this.filteredClients = [];
        return of([]);
      }),
      finalize(() => this.isLoading = false)
    ).subscribe();
  }

  /**
   * Applies the manual filter to the client data.
   * Filters 'allClients' and updates 'filteredClients'.
   * @param filterValue The value to be used as a filter.
   */
  applyFilter(filterValue: string): void {
    const lowerCaseFilter = filterValue.trim().toLowerCase();

    if (!lowerCaseFilter) {
      this.filteredClients = [...this.allClients]; // If no filter, show all clients
      return;
    }

    this.filteredClients = this.allClients.filter(client => { // Renamed user to client
      // Filter by name, email or CPF (adjust properties according to your Client model)
      return (client.name?.toLowerCase().includes(lowerCaseFilter) ||
        client.email?.toLowerCase().includes(lowerCaseFilter) ||
        client.cpf?.toLowerCase().includes(lowerCaseFilter)); // Assuming cpf exists in Client
    });
  }

  /**
   * Handles the deletion of a Client after confirmation.
   * @param id The ID of the Client to be deleted.
   */
  deleteClient(id: string | undefined): void { // Renamed method and parameter
    if (!id) {
      this.snackBar.open('ID do Cliente inválido para exclusão.', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja excluir este Cliente?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.clientService.deleteClient(id).pipe( // Using deleteClient() from ClientService
          finalize(() => this.isLoading = false)
        ).subscribe({
          next: () => {
            this.snackBar.open('Cliente excluído com sucesso!', 'Fechar', { duration: 3000 });
            this.loadAllClients(); // Reload the list after deletion
          },
          error: (error) => {
            console.error('Erro ao excluir Cliente:', error);
            this.snackBar.open('Erro ao excluir Cliente. Detalhes: ' + (error.error?.message || error.message), 'Fechar', { duration: 5000 });
          }
        });
      }
    });
  }

  /**
   * Navigates to the client creation screen.
   */
  createClient(): void { // Renamed method
    this.router.navigate(['/clients/new']); // Adjusted route for client creation
  }

  /**
   * Navigates to the client edit screen.
   * @param client The Client to be edited.
   */
  onEdit(client: Client): void { // Renamed parameter
    this.router.navigate(['/clients', client.id, 'edit']); // Adjusted route for client edit
  }

  /**
   * Navigates to the client view screen.
   * @param client The Client to be viewed.
   */
  onView(client: Client): void { // Renamed parameter
    this.router.navigate(['/clients', client.id]); // Adjusted route for client view
  }

  goToClient(clientId: string | undefined): void { // Renamed method and parameter
    if (clientId) {
      this.router.navigate(['/clients', clientId]); // Adjusted route
    }
  }
}
