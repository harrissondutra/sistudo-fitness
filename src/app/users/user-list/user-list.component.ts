import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  providers: [UserService],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = false;
  searchControl = new FormControl('');

  constructor(
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.searchControl.valueChanges.subscribe(value => {
      this.filterUsers(value ?? '');
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Erro ao carregar usuários.', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  filterUsers(value: string): void {
    const filter = value?.toLowerCase() || '';
    this.filteredUsers = this.users.filter(user =>
      user.name?.toLowerCase().includes(filter) ||
      user.email?.toLowerCase().includes(filter) ||
      user.username?.toLowerCase().includes(filter)
    );
  }

  onEdit(user: any): void {
    this.router.navigate(['user-edit', user.id]);
  }

  onDelete(user: any): void {
    // Implemente a lógica de exclusão conforme o padrão do sistema
    this.snackBar.open('Funcionalidade de exclusão ainda não implementada.', 'Fechar', { duration: 3000 });
  }
}
