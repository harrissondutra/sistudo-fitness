import { HttpInterceptorFn } from '@angular/common/http';

/**
 * ⚡ INTERCEPTOR ULTRA SIMPLES - SEM DEPENDÊNCIAS
 * Teste final para verificar se o problema é na configuração ou no código
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // LOGS EXTREMAMENTE SIMPLES
  console.error('⚡⚡⚡ INTERCEPTOR SIMPLES EXECUTANDO! ⚡⚡⚡');
  console.error('⚡ URL:', req.url);
  console.error('⚡ METHOD:', req.method);

  // Tentar pegar token direto do sessionStorage
  const token = sessionStorage.getItem('token');
  console.error('⚡ TOKEN:', token ? 'ENCONTRADO' : 'AUSENTE');

  if (token) {
    console.error('⚡ CLONANDO REQUISIÇÃO COM HEADERS...');

    const authReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.error('⚡ HEADERS ADICIONADOS! EXECUTANDO...');
    return next(authReq);
  }

  console.error('⚡ SEM TOKEN - REQUISIÇÃO SEM HEADERS');
  return next(req);
};
