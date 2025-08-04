import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  emailSent = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (!this.email || !this.isValidEmail(this.email)) {
      this.showMessage('Por favor, digite um e-mail válido.', 'error');
      return;
    }

    this.loading = true;

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        console.log('Resposta do backend - sucesso:', response);
        this.loading = false;
        this.emailSent = true;
        this.showMessage('Instruções de redefinição de senha foram enviadas para seu e-mail.', 'success');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro completo do backend:', error);
        console.log('Status do erro:', error.status);
        console.log('Corpo do erro:', error.error);
        console.log('Mensagem do erro:', error.message);
        this.loading = false;
        this.handleError(error);
      }
    });
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private handleError(error: HttpErrorResponse): void {
    console.log('Tratando erro no handleError...');
    
    let message = 'Erro ao solicitar redefinição de senha.';
    
    // Verifica se é um erro de rede ou do servidor
    if (error.status === 0) {
      message = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
    } else if (error.status === 404) {
      message = 'E-mail não encontrado. Verifique se digitou corretamente.';
    } else if (error.status === 429) {
      message = 'Muitas tentativas. Tente novamente em alguns minutos.';
    } else if (error.status === 500) {
      message = 'Erro interno do servidor. Tente novamente mais tarde.';
    } else if (error.status >= 200 && error.status < 300) {
      // Se o status está na faixa de sucesso, mas chegou aqui como erro
      // isso pode indicar um problema de estrutura de resposta
      console.warn('Resposta com status de sucesso tratada como erro:', error);
      message = 'Solicitação processada, mas houve um problema na resposta. Verifique seu e-mail.';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (typeof error.error === 'string') {
      message = error.error;
    }

    console.log('Mensagem de erro final:', message);
    this.showMessage(message, 'error');
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
