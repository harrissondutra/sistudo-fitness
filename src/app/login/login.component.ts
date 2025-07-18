import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // <-- Inclua CommonModule aqui
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.authService.setToken(res.token);
        this.loading = false;
        this.router.navigate(['/app']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Falha no login. Verifique suas credenciais.';
      }
    });
  }
}
