import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from '../../../services/user/user.service';
import { ClientService } from '../../../services/client/client.service';
import { User } from '../../../models/client';
import { UserRole } from '../../../models/user_role';

@Component({
  selector: 'app-client-web-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './client-web-register.component.html',
  styleUrl: './client-web-register.component.scss'
})
export class ClientWebRegisterComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registrationForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor() {
    this.registrationForm = this.fb.group({
      // Dados essenciais do usuário
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],

      // Dados básicos do cliente
      name: ['', [Validators.required, Validators.minLength(2)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Este campo é obrigatório';
    }

    if (field?.hasError('email')) {
      return 'Digite um email válido';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo de ${minLength} caracteres`;
    }

    if (field?.hasError('pattern')) {
      if (fieldName === 'cpf') {
        return 'CPF deve conter 11 dígitos';
      }
      if (fieldName === 'phone') {
        return 'Formato: (99) 99999-9999';
      }
    }

    if (field?.hasError('min')) {
      return 'Valor deve ser maior que 0';
    }

    if (field?.hasError('passwordMismatch')) {
      return 'As senhas não coincidem';
    }

    return '';
  }

  formatCpf(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      this.registrationForm.patchValue({ cpf: value.replace(/\D/g, '') });
      event.target.value = value;
    }
  }

  onSubmit() {
    if (this.registrationForm.valid && !this.isLoading) {
      this.isLoading = true;

      const formValue = this.registrationForm.value;

      // Criando o objeto User (sem o campo id)
      const user: User = {
        username: formValue.username,
        email: formValue.email,
        password: formValue.password,
        role: UserRole.CLIENT // sempre envia CLIENT
      };

      // Primeiro cria o usuário
      this.userService.createUser(user).subscribe({
        next: (createdUser) => {
          // Depois cria o cliente associado ao usuário com dados básicos
          const client = {
            name: formValue.name,
            email: formValue.email,
            user: createdUser,
            cpf: formValue.cpf
          };

          this.clientService.createClient(client).subscribe({
            next: () => {
              this.snackBar.open('Cadastro realizado com sucesso! Faça login para acessar o sistema.', 'Fechar', {
                duration: 5000,
                panelClass: ['success-snackbar']
              });
              this.router.navigate(['/login']);
            },
            error: (error) => {
              console.error('Erro ao criar cliente:', error);
              this.snackBar.open('Erro ao finalizar cadastro. Tente novamente.', 'Fechar', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
              this.isLoading = false;
            }
          });
        },
        error: (error) => {
          console.error('Erro ao criar usuário:', error);
          let errorMessage = 'Erro ao criar usuário. Tente novamente.';

          if (error.status === 409) {
            errorMessage = 'Email ou nome de usuário já existe.';
          }

          this.snackBar.open(errorMessage, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
