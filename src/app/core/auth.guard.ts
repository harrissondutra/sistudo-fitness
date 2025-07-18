import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const isAuth = this.authService.isAuthenticated();
    console.log('[AuthGuard] Autenticado?', isAuth);
    if (isAuth) {
      return true;
    }
    console.log('[AuthGuard] Redirecionando para login');
    return this.router.parseUrl('/login');
  }
}
