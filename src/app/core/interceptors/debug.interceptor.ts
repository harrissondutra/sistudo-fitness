import { HttpInterceptorFn } from '@angular/common/http';

export const debugInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔥 [DEBUG INTERCEPTOR] FUNCIONANDO! URL:', req.url);

  // Adicionar header de teste
  const modifiedReq = req.clone({
    setHeaders: {
      'X-Debug': 'interceptor-funciona'
    }
  });

  return next(modifiedReq);
};
