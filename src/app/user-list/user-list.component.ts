import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { User } from '../models/user';
import { Observable, catchError, tap, of } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Importe MatSnackBar e MatSnackBarModule


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule // Adicionar MatSnackBarModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<User> = new MatTableDataSource();
  displayedColumns: string[] = ['id', 'name', 'email', 'cpf', 'weight', 'height', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  totalUsers: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  searchControl = new FormControl('');

  constructor(private userService: UserService, private router: Router, private snackBar: MatSnackBar) { } // Injetar MatSnackBar

  ngOnInit(): void {
    this.loadAllUsers();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => this.applyFilter(value || ''))
    ).subscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Carrega todos os usuários da API usando o UserService.
   */
  loadAllUsers(): void {
    this.userService.getAllUsers().pipe(
      tap(users => {
        this.dataSource.data = users;
        this.totalUsers = users.length;
        if (this.paginator) {
          this.paginator.length = users.length;
        }
      }),
      catchError(error => {
        console.error('Erro ao carregar usuários:', error);
        this.snackBar.open('Erro ao carregar usuários. Por favor, tente novamente mais tarde.', 'Fechar', { duration: 5000 }); // Substitui alert()
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Aplica o filtro aos dados da tabela com base no valor de busca.
   * A função `filterPredicate` é sobrescrita para buscar em múltiplas colunas.
   * @param filterValue O valor a ser usado como filtro.
   */
  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * Implementação placeholder para editar um usuário específico.
   * @param id O ID do usuário a ser editado.
   */
  editUser(id: number): void {
    this.router.navigate(['/users-edit', id]);
  }

  /**
   * Lida com a exclusão de um usuário após confirmação.
   * @param id O ID do usuário a ser apagado.
   */
  deleteUser(id: number): void {
    // Mantém o confirm() para a confirmação inicial da ação
    if (confirm('Tem certeza que deseja apagar este usuário? Esta ação é irreversível.')) {
      // Implementar a chamada ao serviço para apagar o usuário
      // Exemplo:
      // this.userService.deleteUser(id).subscribe({
      //   next: () => {
      //     this.snackBar.open('Usuário apagado com sucesso!', 'Fechar', { duration: 3000 }); // Substitui alert()
      //     this.loadAllUsers(); // Recarrega a lista após a exclusão
      //   },
      //   error: (error) => {
      //     console.error('Erro ao apagar usuário:', error);
      //     this.snackBar.open('Erro ao apagar usuário. Verifique o console para mais detalhes.', 'Fechar', { duration: 5000 }); // Substitui alert()
      //   }
      // });
      console.log('Funcionalidade de apagar usuário com ID:', id);
      this.snackBar.open(`Funcionalidade de apagar para o usuário ${id} não implementada.`, 'Fechar', { duration: 3000 }); // Substitui alert()
    }
  }

  /**
   * Navega para a tela de criação de um novo usuário.
   */
  createUser(): void {
    this.router.navigate(['/register']);
  }
}
