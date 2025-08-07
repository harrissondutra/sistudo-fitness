import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

export const sessionActivityInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    tap(() => {
      // Atualiza a última atividade do usuário a cada requisição HTTP
      if (authService.isAuthenticated()) {
        authService.updateLastActivity();
      }
    })
  );
};
