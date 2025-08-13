import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

/**
 * 🚨 INTERCEPTOR COM LOGS AINDA MAIS DETALHADOS
 * Versão de debug extrema para identificar o problema
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // LOGS IMEDIATOS - DEVEM APARECER SE O INTERCEPTOR EXECUTAR
  console.log('🔥🔥🔥 [AUTH-INTERCEPTOR] EXECUTANDO AGORA! 🔥🔥🔥');
  console.log('🔥🔥🔥 [AUTH-INTERCEPTOR] URL:', req.url);
  console.log('🔥🔥🔥 [AUTH-INTERCEPTOR] METHOD:', req.method);
  console.log('🔥🔥🔥 [AUTH-INTERCEPTOR] TIMESTAMP:', new Date().toISOString());

  // Logs no window para garantir visibilidade
  (window as any).INTERCEPTOR_LOG = `INTERCEPTOR EXECUTOU EM ${new Date().toISOString()}`;

  try {
    const authService = inject(AuthService);
    console.log('✅ [AUTH-INTERCEPTOR] AuthService injetado');

    const token = authService.getToken();
    console.log('🚨 [AUTH-INTERCEPTOR] Token:', token ? 'PRESENTE' : 'AUSENTE');

    // Também pegar direto do sessionStorage
    const directToken = sessionStorage.getItem('token');
    console.log('🚨 [AUTH-INTERCEPTOR] Token direto:', directToken ? 'PRESENTE' : 'AUSENTE');

    const finalToken = token || directToken;

    if (finalToken && finalToken.trim() !== '') {
      console.log('✅ [AUTH-INTERCEPTOR] ADICIONANDO HEADERS...');

      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${finalToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('✅ [AUTH-INTERCEPTOR] HEADERS ADICIONADOS SUCCESSFULLY!');
      console.log('🚨 [AUTH-INTERCEPTOR] Authorization:', `Bearer ${finalToken.substring(0, 20)}...`);

      return next(authReq);
    }
  } catch (error) {
    console.error('💥 [AUTH-INTERCEPTOR] ERRO:', error);

    // Fallback com token direto
    const directToken = sessionStorage.getItem('token');
    if (directToken) {
      console.log('🔄 [AUTH-INTERCEPTOR] FALLBACK TOKEN');
      const authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${directToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return next(authReq);
    }
  }

  console.log('❌ [AUTH-INTERCEPTOR] SEM TOKEN - ENVIANDO SEM HEADERS');
  return next(req);
};
