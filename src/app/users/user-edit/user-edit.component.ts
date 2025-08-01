import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../services/user/user.service';
import { USER_ROLE_OPTIONS } from '../../models/user_role';


@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.scss'
})
export class UserEditComponent implements OnInit {
  userForm: FormGroup;
  userId: number;
  isLoading = false;
  roles = USER_ROLE_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      id: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Opcional em edições
      role: ['', Validators.required]
    });

    this.userId = 0;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = +params['id'];
        this.loadUser();
      } else {
        this.snackBar.open('ID de usuário não fornecido', 'Fechar', { duration: 3000 });
        this.router.navigate(['/user-list']);
      }
    });
  }

  loadUser(): void {
    this.isLoading = true;
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        // Remover campos nulos ou undefined para evitar erros no formulário
        const cleanUser = Object.fromEntries(
          Object.entries(user).filter(([_, v]) => v != null)
        );
        this.userForm.patchValue(cleanUser);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuário:', error);
        this.snackBar.open('Erro ao carregar dados do usuário', 'Fechar', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/user-list']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const userData = { ...this.userForm.value };

    // Se o campo de senha estiver vazio, removê-lo para não redefinir a senha
    if (!userData.password) {
      delete userData.password;
    }

    this.userService.updateUser(this.userId, userData).subscribe({
      next: () => {
        this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', { duration: 3000 });
        this.isLoading = false;
        this.router.navigate(['/user-list']);
      },
      error: (error) => {
        console.error('Erro ao atualizar usuário:', error);
        this.snackBar.open('Erro ao atualizar usuário', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) return 'Campo obrigatório';
    if (control.hasError('email')) return 'Email inválido';
    if (control.hasError('minlength')) return `Mínimo de ${control.getError('minlength').requiredLength} caracteres`;

    return '';
  }

  cancel(): void {
    this.router.navigate(['/user-list']);
  }
}
