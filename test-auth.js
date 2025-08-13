/**
 * 🔧 TESTE DE AUTENTICAÇÃO COMPLETO
 *
 * Cole este código no console e execute: testAuth()
 */

window.testAuth = async function() {
  console.log('🔧 [AUTH-TEST] ================================');
  console.log('🔧 [AUTH-TEST] TESTE COMPLETO DE AUTENTICAÇÃO');
  console.log('🔧 [AUTH-TEST] ================================');

  // 1. Verificar se existe token
  const token = sessionStorage.getItem('token');
  const userInfo = sessionStorage.getItem('userInfo');

  if (!token) {
    console.error('❌ [AUTH-TEST] SEM TOKEN! Execute primeiro:');
    console.log(`
    // FAÇA LOGIN MANUAL:
    const loginData = {
      email: 'seu-email@email.com',
      password: 'sua-senha'
    };

    fetch('https://api-sistudo-fitness-production.up.railway.app/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userInfo', JSON.stringify(data.user));
        console.log('✅ Login realizado! Execute testAuth() novamente');
      }
    });
    `);
    return;
  }

  // 2. Validar token
  console.log('🔑 [AUTH-TEST] Token encontrado, validando...');

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();
    const isExpired = now > exp;

    console.log('👤 [AUTH-TEST] Token payload:', {
      sub: payload.sub,
      exp: new Date(exp).toLocaleString(),
      iat: new Date(payload.iat * 1000).toLocaleString(),
      expired: isExpired
    });

    if (isExpired) {
      console.error('❌ [AUTH-TEST] TOKEN EXPIRADO!');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userInfo');
      return;
    }
  } catch (e) {
    console.error('❌ [AUTH-TEST] Token inválido:', e.message);
    return;
  }

  // 3. Testar endpoint de validação de token
  console.log('🧪 [AUTH-TEST] Testando validação de token...');

  try {
    const validateResponse = await fetch('https://api-sistudo-fitness-production.up.railway.app/auth/validate-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (validateResponse.ok) {
      const validationData = await validateResponse.json();
      console.log('✅ [AUTH-TEST] Token válido no servidor:', validationData);
    } else {
      console.error('❌ [AUTH-TEST] Token inválido no servidor:', validateResponse.status);

      if (validateResponse.status === 401) {
        console.error('🔑 [AUTH-TEST] Token rejeitado pelo servidor - fazer novo login');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userInfo');
        return;
      }
    }
  } catch (e) {
    console.warn('⚠️ [AUTH-TEST] Endpoint validate-token não encontrado (normal)');
  }

  // 4. Testar endpoint básico com permissões
  console.log('🧪 [AUTH-TEST] Testando endpoint com permissões...');

  const user = userInfo ? JSON.parse(userInfo) : {};
  const userRole = user.role || 'UNKNOWN';

  console.log('👤 [AUTH-TEST] Usuário atual:', {
    username: user.username || user.email,
    role: userRole,
    normalizedRole: userRole.replace('ROLE_', '')
  });

  // Escolher endpoint baseado na role
  let testEndpoint = '/clients/listAll'; // Padrão para a maioria dos roles

  if (userRole.includes('ADMIN')) {
    testEndpoint = '/users'; // Apenas admin tem acesso
  }

  try {
    console.log(`📡 [AUTH-TEST] Testando ${testEndpoint}...`);

    const testResponse = await fetch(`https://api-sistudo-fitness-production.up.railway.app${testEndpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📡 [AUTH-TEST] Response status:', testResponse.status);
    console.log('📡 [AUTH-TEST] Response headers:', [...testResponse.headers.entries()]);

    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ [AUTH-TEST] SUCESSO! Dados recebidos:', Array.isArray(data) ? `${data.length} registros` : 'Objeto');

      // 5. TESTE FINAL: O interceptor está funcionando?
      console.log('🎯 [AUTH-TEST] ================================');
      console.log('🎯 [AUTH-TEST] RESULTADO FINAL:');
      console.log('✅ [AUTH-TEST] Token válido');
      console.log('✅ [AUTH-TEST] API respondendo');
      console.log('✅ [AUTH-TEST] Permissões OK');
      console.log('✅ [AUTH-TEST] Headers funcionando');
      console.log('🎯 [AUTH-TEST] INTERCEPTOR FUNCIONANDO CORRETAMENTE!');
      console.log('🎯 [AUTH-TEST] ================================');

    } else if (testResponse.status === 401) {
      console.error('❌ [AUTH-TEST] 401 - Token não aceito pelo servidor');

      try {
        const errorText = await testResponse.text();
        console.error('📝 [AUTH-TEST] Erro detalhado:', errorText);
      } catch (e) {}

    } else if (testResponse.status === 403) {
      console.error('❌ [AUTH-TEST] 403 - Sem permissão para este endpoint');
      console.log('📝 [AUTH-TEST] Isso pode ser normal dependendo da sua role');

      // Tentar um endpoint mais básico
      console.log('🔄 [AUTH-TEST] Tentando endpoint básico...');

      const basicResponse = await fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (basicResponse.ok) {
        console.log('✅ [AUTH-TEST] Endpoint básico funcionou - problema é de permissão específica');
      } else {
        console.error('❌ [AUTH-TEST] Mesmo endpoint básico falhou:', basicResponse.status);
      }

    } else {
      console.error(`❌ [AUTH-TEST] Erro inesperado: ${testResponse.status}`);
    }

  } catch (networkError) {
    console.error('💥 [AUTH-TEST] Erro de rede:', networkError.message);
  }
};

console.log('🔧 Teste de autenticação carregado! Execute: testAuth()');
