import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MenuService } from '../services/menu-visibility/menu.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private menuService: MenuService
  ) {}

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        console.log('Resposta do login recebida:', res);

        // Salva o token e dados do usuário
        this.authService.setToken(res.token, {
          id: res.id,           // 🔥 IMPORTANTE: Incluir o ID!
          email: res.email,
          username: res.username,
          role: res.role
        });

        // Debug para verificar dados salvos
        this.authService.debugUserData();
        this.authService.debugFullToken();

        // Aguarda um pouco para garantir que o token foi processado
        setTimeout(() => {
          console.log('Login bem-sucedido, atualizando menus...');
          this.menuService.refreshMenus();
        }, 100);

        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Falha no login. Verifique suas credenciais.';
      }
    });
  }
}
