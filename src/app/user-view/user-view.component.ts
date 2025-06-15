import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../services/user/user.service';
import { User } from '../models/user';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class UserViewComponent implements OnInit {
  user: User | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
  }

  private loadUser(id: string): void {
    this.isLoading = true;
    this.userService.getUserById(id).subscribe({
      next: (user: User) => {
        this.user = user;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuário:', error);
        this.snackBar.open('Erro ao carregar usuário', 'Fechar', { duration: 3000 });
        this.router.navigate(['/users']);
      }
    });
  }

  formatMeasure(value: number | null | undefined): string {
    if (value === null || value === undefined) return '-';
    return value.toString();
  }

  onBack(): void {
    this.router.navigate(['/users']);
  }

  onEdit(): void {
    if (this.user?.id) {
      this.router.navigate(['/users', this.user.id, 'edit']);
    }
  }
}
