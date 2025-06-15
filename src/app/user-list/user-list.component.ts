import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../src/app/services/user/user.service'; // Ajuste o caminho
import { User } from '../../app/models/user'; // Ajuste o caminho
import { Observable, catchError, tap, of } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators'; // Adicionado finalize
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component'; // Verifique o caminho
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para MatSpinner

// Módulo Ionic (necessário para ion-list, ion-item, ion-button, ion-icon)
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    // Removido MatTableModule, MatPaginatorModule, MatSortModule
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule, // Adicionado para MatSpinner
    IonicModule // Adicionado para componentes Ionic
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  // Lista original de todos os usuários
  allUsers: User[] = [];
  // Lista de usuários filtrados para exibição no HTML
  filteredUsers: User[] = [];

  isLoading = false; // Para controlar o indicador de carregamento

  searchControl = new FormControl('');

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadAllUsers();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => this.applyFilter(value || '')) // Aplica o filtro a cada mudança no campo de busca
    ).subscribe();
  }

  // ngAfterViewInit não é mais necessário para MatPaginator/MatSort

  /**
   * Carrega todos os usuários da API usando o UserService.
   * Os usuários são armazenados em 'allUsers' e, em seguida, filtrados para 'filteredUsers'.
   */
  loadAllUsers(): void {
    this.isLoading = true; // Ativa o indicador de carregamento
    this.userService.getAllUsers().pipe( // Usando getUsers() conforme UserService
      tap(users => {
        this.allUsers = users; // Armazena a lista completa
        this.applyFilter(this.searchControl.value || ''); // Aplica o filtro inicial ou o filtro atual
      }),
      catchError(error => {
        console.error('Erro ao carregar usuários:', error);
        this.snackBar.open('Erro ao carregar usuários. Por favor, tente novamente mais tarde.', 'Fechar', { duration: 5000 });
        this.allUsers = []; // Garante que a lista esteja vazia em caso de erro
        this.filteredUsers = []; // Garante que a lista filtrada esteja vazia em caso de erro
        return of([]); // Retorna um Observable vazio para que a cadeia não seja quebrada
      }),
      finalize(() => this.isLoading = false) // Desativa o indicador de carregamento
    ).subscribe();
  }

  /**
   * Aplica o filtro manual aos dados dos usuários.
   * Filtra 'allUsers' e atualiza 'filteredUsers'.
   * @param filterValue O valor a ser usado como filtro.
   */
  applyFilter(filterValue: string): void {
    const lowerCaseFilter = filterValue.trim().toLowerCase();

    if (!lowerCaseFilter) {
      this.filteredUsers = [...this.allUsers]; // Se não houver filtro, mostra todos os usuários
      return;
    }

    this.filteredUsers = this.allUsers.filter(user => {
      // Filtra por nome, email ou CPF (ajuste as propriedades conforme seu modelo User)
      return (user.name?.toLowerCase().includes(lowerCaseFilter) ||
              user.email?.toLowerCase().includes(lowerCaseFilter) ||
              user.cpf?.toLowerCase().includes(lowerCaseFilter)); // Assumindo que cpf existe no User
    });
  }

  /**
   * Lida com a exclusão de um usuário após confirmação.
   * @param id O ID do usuário a ser apagado.
   */
  deleteUser(id: string | undefined): void {
    if (!id) {
      this.snackBar.open('ID do usuário inválido para exclusão.', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: 'Tem certeza que deseja excluir este usuário?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true; // Ativa o indicador de carregamento
        this.userService.deleteUser(id).pipe(
          finalize(() => this.isLoading = false) // Desativa o indicador
        ).subscribe({
          next: () => {
            this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', { duration: 3000 });
            this.loadAllUsers(); // Recarrega a lista após a exclusão
          },
          error: (error) => {
            console.error('Erro ao excluir usuário:', error);
            this.snackBar.open('Erro ao excluir usuário. Detalhes: ' + (error.error?.message || error.message), 'Fechar', { duration: 5000 });
          }
        });
      }
    });
  }

  /**
   * Navega para a tela de criação de um novo usuário.
   */
  createUser(): void {
    this.router.navigate(['/register']); // Rota para a tela de criação de usuário
  }

  /**
   * Navega para a tela de edição do usuário.
   * @param user O usuário a ser editado.
   */
  onEdit(user: User): void {
    this.router.navigate(['/users-edit', user.id]);
  }

  /**
   * Navega para a tela de visualização do usuário.
   * @param user O usuário a ser visualizado.
   */
  onView(user: User): void {
    this.router.navigate(['/user', user.id]);
  }
}
