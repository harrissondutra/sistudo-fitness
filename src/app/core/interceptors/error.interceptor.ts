import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro. Tente novamente.';

      if (error.error instanceof ErrorEvent) {
        // Erro do cliente
        errorMessage = error.error.message;
      } else {
        // Erro do servidor
        switch (error.status) {
          case 400:
            errorMessage = 'Requisição inválida.';
            break;
          case 401:
            errorMessage = 'Não autorizado.';
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Acesso negado.';
            router.navigate(['/login']);
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor.';
            break;
        }
      }

      snackBar.open(errorMessage, 'Fechar', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });

      return throwError(() => error);
    })
  );
};
