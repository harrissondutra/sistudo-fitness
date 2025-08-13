/**
 * 🔍 DEBUG DE PERMISSÕES ADMIN
 *
 * Cole este código no console e execute: debugAdminPermissions()
 */

window.debugAdminPermissions = async function() {
  console.log('🔍 [ADMIN-DEBUG] ================================');
  console.log('🔍 [ADMIN-DEBUG] VERIFICANDO PERMISSÕES DO ADMIN');
  console.log('🔍 [ADMIN-DEBUG] ================================');

  const token = sessionStorage.getItem('token');
  const userInfo = sessionStorage.getItem('userInfo');

  if (!token) {
    console.error('❌ [ADMIN-DEBUG] Sem token!');
    return;
  }

  // 1. Analisar token JWT
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔑 [ADMIN-DEBUG] Token payload completo:', payload);
    console.log('👤 [ADMIN-DEBUG] Subject:', payload.sub);
    console.log('🔐 [ADMIN-DEBUG] Role no token:', payload.role);
    console.log('⏰ [ADMIN-DEBUG] Issued at:', new Date(payload.iat * 1000));
    console.log('⏰ [ADMIN-DEBUG] Expires at:', new Date(payload.exp * 1000));

    // Verificar se o token tem authorities/roles específicas
    if (payload.authorities) {
      console.log('🛡️ [ADMIN-DEBUG] Authorities:', payload.authorities);
    }
    if (payload.roles) {
      console.log('🛡️ [ADMIN-DEBUG] Roles:', payload.roles);
    }
  } catch (e) {
    console.error('❌ [ADMIN-DEBUG] Erro ao decodificar token:', e);
  }

  // 2. Verificar userInfo
  if (userInfo) {
    const user = JSON.parse(userInfo);
    console.log('📋 [ADMIN-DEBUG] UserInfo completo:', user);
  }

  // 3. Testar endpoint de validação mais básico
  console.log('🧪 [ADMIN-DEBUG] Testando endpoints básicos...');

  // Tentar endpoints mais simples primeiro
  const basicEndpoints = [
    '/auth/me',
    '/auth/profile',
    '/users/me',
    '/profile'
  ];

  for (const endpoint of basicEndpoints) {
    try {
      console.log(`📡 [ADMIN-DEBUG] Testando ${endpoint}...`);

      const response = await fetch(`https://api-sistudo-fitness-production.up.railway.app${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📊 [ADMIN-DEBUG] ${endpoint}: ${response.status} ${response.statusText}`);

      if (response.ok) {
        try {
          const data = await response.json();
          console.log(`✅ [ADMIN-DEBUG] ${endpoint} dados:`, data);
        } catch (e) {
          console.log(`✅ [ADMIN-DEBUG] ${endpoint} sucesso (sem dados JSON)`);
        }
      } else if (response.status === 403) {
        console.error(`❌ [ADMIN-DEBUG] ${endpoint}: ACESSO NEGADO`);
      } else if (response.status === 404) {
        console.log(`⚠️ [ADMIN-DEBUG] ${endpoint}: Não encontrado (normal)`);
      }
    } catch (e) {
      console.error(`💥 [ADMIN-DEBUG] ${endpoint}: ${e.message}`);
    }
  }

  // 4. Verificar se há algum endpoint que funciona
  console.log('🔍 [ADMIN-DEBUG] Testando endpoints administrativos...');

  const adminEndpoints = [
    '/users',
    '/admin/users',
    '/api/users',
    '/admin/dashboard'
  ];

  let anyWorking = false;

  for (const endpoint of adminEndpoints) {
    try {
      const response = await fetch(`https://api-sistudo-fitness-production.up.railway.app${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log(`✅ [ADMIN-DEBUG] FUNCIONA: ${endpoint} (${response.status})`);
        anyWorking = true;
      } else {
        console.log(`❌ [ADMIN-DEBUG] FALHA: ${endpoint} (${response.status})`);
      }
    } catch (e) {
      console.error(`💥 [ADMIN-DEBUG] ERRO: ${endpoint} - ${e.message}`);
    }
  }

  // 5. Resultado final
  console.log('🔍 [ADMIN-DEBUG] ================================');
  console.log('📊 [ADMIN-DEBUG] DIAGNÓSTICO:');

  if (anyWorking) {
    console.log('✅ [ADMIN-DEBUG] Alguns endpoints funcionam - problema específico');
    console.log('📝 [ADMIN-DEBUG] Possível causa: Endpoints específicos bloqueados');
  } else {
    console.error('❌ [ADMIN-DEBUG] NENHUM endpoint funciona!');
    console.error('📝 [ADMIN-DEBUG] Possíveis causas:');
    console.error('   1. Usuario ADMIN foi desabilitado no backend');
    console.error('   2. Role ROLE_ADMIN não tem permissões configuradas');
    console.error('   3. Token foi revogado/invalidado');
    console.error('   4. Problema de configuração no backend');
  }

  console.log('🔍 [ADMIN-DEBUG] ================================');
  console.log('💡 [ADMIN-DEBUG] PRÓXIMOS PASSOS:');
  console.log('   1. Verificar se outro usuário (não admin) funciona');
  console.log('   2. Testar login com credenciais diferentes');
  console.log('   3. Verificar logs do backend para erros de autorização');
};

console.log('🔍 Debug de permissões ADMIN carregado! Execute: debugAdminPermissions()');
