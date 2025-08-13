/**
 * 🔍 DEBUG INTERCEPTOR - DIAGNÓSTICO COMPLETO
 *
 * Cole este código no console e execute: debugInterceptor()
 */

window.debugInterceptor = async function() {
  console.log('🔍 [DEBUG] ================================');
  console.log('🔍 [DEBUG] DIAGNÓSTICO COMPLETO DO INTERCEPTOR');
  console.log('🔍 [DEBUG] ================================');

  // 1. Verificar sessionStorage
  const token = sessionStorage.getItem('token');
  const userInfo = sessionStorage.getItem('userInfo');

  console.log('📱 [DEBUG] Token no sessionStorage:', token ? 'PRESENTE' : 'AUSENTE');
  console.log('📱 [DEBUG] UserInfo no sessionStorage:', userInfo ? 'PRESENTE' : 'AUSENTE');

  if (token) {
    console.log('🔑 [DEBUG] Token (primeiros 20 chars):', token.substring(0, 20) + '...');

    // Verificar se token está expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const isExpired = now > exp;

      console.log('⏰ [DEBUG] Token expira em:', new Date(exp).toLocaleString());
      console.log('⏰ [DEBUG] Token expirado?', isExpired ? 'SIM' : 'NÃO');

      if (isExpired) {
        console.error('❌ [DEBUG] TOKEN EXPIRADO! Faça login novamente.');
        return;
      }
    } catch (e) {
      console.error('❌ [DEBUG] Erro ao decodificar token:', e.message);
      return;
    }
  } else {
    console.error('❌ [DEBUG] SEM TOKEN! Faça login primeiro.');
    return;
  }

  if (userInfo) {
    const user = JSON.parse(userInfo);
    console.log('👤 [DEBUG] Usuário:', user.username || user.email);
    console.log('🔑 [DEBUG] Role:', user.role);
  }

  // 2. Teste de requisição manual com headers explícitos
  console.log('🧪 [DEBUG] Testando requisição manual...');

  try {
    const response = await fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📡 [DEBUG] Status da resposta:', response.status);
    console.log('📡 [DEBUG] Headers enviados:', {
      'Authorization': `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ [DEBUG] Requisição manual SUCESSO:', data.length || 'N/A', 'registros');
    } else if (response.status === 401) {
      console.error('❌ [DEBUG] 401 - Token inválido ou expirado');

      // Tentar decodificar resposta de erro
      try {
        const errorText = await response.text();
        console.error('📝 [DEBUG] Resposta do servidor:', errorText);
      } catch (e) {
        console.error('📝 [DEBUG] Não foi possível ler resposta de erro');
      }
    } else if (response.status === 403) {
      console.error('❌ [DEBUG] 403 - Sem permissão para este endpoint');

      try {
        const errorText = await response.text();
        console.error('📝 [DEBUG] Resposta do servidor:', errorText);
      } catch (e) {
        console.error('📝 [DEBUG] Não foi possível ler resposta de erro');
      }
    } else {
      console.error(`❌ [DEBUG] Erro ${response.status}: ${response.statusText}`);
    }

  } catch (networkError) {
    console.error('💥 [DEBUG] Erro de rede:', networkError.message);
  }

  // 3. Verificar se o Angular está carregado e se o interceptor está ativo
  console.log('🅰️ [DEBUG] Angular carregado?', typeof window.ng !== 'undefined' ? 'SIM' : 'NÃO');

  // 4. Testar com diferentes endpoints
  console.log('🧪 [DEBUG] Testando endpoints específicos...');

  const testEndpoints = [
    '/users',
    '/doctors/list',
    '/exercises/list'
  ];

  for (const endpoint of testEndpoints) {
    try {
      console.log(`📡 [DEBUG] Testando ${endpoint}...`);

      const response = await fetch(`https://api-sistudo-fitness-production.up.railway.app${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`✅ [DEBUG] ${endpoint}: STATUS 200`);
      } else {
        console.log(`❌ [DEBUG] ${endpoint}: STATUS ${response.status}`);
      }
    } catch (e) {
      console.error(`💥 [DEBUG] ${endpoint}: Erro - ${e.message}`);
    }
  }

  console.log('🔍 [DEBUG] ================================');
  console.log('🔍 [DEBUG] DIAGNÓSTICO COMPLETO');
  console.log('🔍 [DEBUG] ================================');
};

console.log('🔍 Debug interceptor carregado! Execute: debugInterceptor()');
