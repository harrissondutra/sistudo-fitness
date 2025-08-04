import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token = '';
  loading = false;
  validatingToken = true;
  tokenValid = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Obtém o token da URL
    this.token = this.route.snapshot.queryParams['token'] || '';
    
    if (!this.token) {
      this.showMessage('Token de redefinição não encontrado.', 'error');
      this.router.navigate(['/login']);
      return;
    }

    this.validateToken();
  }

  private initForm(): void {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    }
    
    return null;
  }

  private validateToken(): void {
    this.validatingToken = true;
    
    this.authService.validateResetToken(this.token).subscribe({
      next: (response) => {
        this.validatingToken = false;
        this.tokenValid = true;
      },
      error: (error: HttpErrorResponse) => {
        this.validatingToken = false;
        this.tokenValid = false;
        this.handleTokenError(error);
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const newPassword = this.resetForm.get('password')?.value;

    this.authService.resetPassword(this.token, newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.showMessage('Senha redefinida com sucesso! Faça login com sua nova senha.', 'success');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.handleError(error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }

  private handleTokenError(error: HttpErrorResponse): void {
    let message = 'Token inválido ou expirado.';
    
    if (error.status === 404) {
      message = 'Token não encontrado. Solicite uma nova redefinição de senha.';
    } else if (error.status === 410) {
      message = 'Token expirado. Solicite uma nova redefinição de senha.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.showMessage(message, 'error');
  }

  private handleError(error: HttpErrorResponse): void {
    let message = 'Erro ao redefinir senha.';
    
    if (error.status === 400) {
      message = 'Dados inválidos. Verifique se a senha atende aos critérios.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.showMessage(message, 'error');
  }

  private markFormGroupTouched(): void {
    Object.values(this.resetForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private showMessage(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fechar', {
      duration: type === 'success' ? 5000 : 8000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
}
