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
      // URLs que não devem exibir mensagens automáticas de erro
      const skipAutoErrorUrls = [
        '/auth/login',
        '/auth/forgot-password', 
        '/auth/reset-password',
        '/auth/validate-reset-token'
      ];

      // Verifica se a URL da requisição deve pular o tratamento automático
      const shouldSkipAutoError = skipAutoErrorUrls.some(url => req.url.includes(url));

      if (!shouldSkipAutoError) {
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
      }

      return throwError(() => error);
    })
  );
};
