import { HttpInterceptorFn } from '@angular/common/http';

/**
 * 🔥 INTERCEPTOR EXTREMO - FORÇAR EXECUÇÃO
 */
export const testExtremeInterceptor: HttpInterceptorFn = (req, next) => {
  // FORÇAR LOGS DE TODAS AS FORMAS POSSÍVEIS
  console.error('🔥 EXTREME INTERCEPTOR EXECUTANDO!');
  console.log('🔥 EXTREME INTERCEPTOR EXECUTANDO!');
  console.warn('🔥 EXTREME INTERCEPTOR EXECUTANDO!');
  alert('🔥 INTERCEPTOR EXECUTOU!'); // Extremo, mas garantido

  // Adicionar token se existir
  const token = sessionStorage.getItem('token');
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
