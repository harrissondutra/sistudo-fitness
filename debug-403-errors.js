/**
 * 🔍 DEBUG DE PERMISSÕES - ANÁLISE DE ERROS 403
 *
 * Este script ajuda a identificar quais endpoints retornam 403
 * e por que isso acontece (normal devido a permissões)
 */

window.debug403 = async function() {
  const token = sessionStorage.getItem('token');
  const userInfo = sessionStorage.getItem('userInfo');

  if (!token) {
    console.error('❌ Token não encontrado. Faça login primeiro!');
    return;
  }

  console.log('🔍 [DEBUG-403] Analisando permissões...');
  console.log('🔍 [DEBUG-403] ================================');

  // Decodificar informações do usuário
  let user = {};
  if (userInfo) {
    user = JSON.parse(userInfo);
    console.log('👤 [DEBUG-403] Usuário:', user.username || user.email);
    console.log('🔑 [DEBUG-403] Role:', user.role);
    console.log('🆔 [DEBUG-403] ID:', user.id);
  }

  // Lista completa de endpoints para testar
  const allEndpoints = [
    { url: '/clients/listAll', name: 'Clientes', expectedRoles: ['ADMIN', 'DOCTOR', 'PERSONAL', 'NUTRITIONIST'] },
    { url: '/users', name: 'Usuários', expectedRoles: ['ADMIN'] },
    { url: '/doctors/list', name: 'Médicos', expectedRoles: ['ADMIN', 'DOCTOR'] },
    { url: '/nutritionists/listAll', name: 'Nutricionistas', expectedRoles: ['ADMIN', 'NUTRITIONIST'] },
    { url: '/exercises/list', name: 'Exercícios', expectedRoles: ['ADMIN', 'PERSONAL'] },
    { url: '/trainning-category/listAll', name: 'Categorias de Treino', expectedRoles: ['ADMIN', 'PERSONAL'] }
  ];

  console.log('🧪 [DEBUG-403] Testando todos os endpoints...');

  for (const endpoint of allEndpoints) {
    try {
      const response = await fetch(`https://api-sistudo-fitness-production.up.railway.app${endpoint.url}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const hasPermission = endpoint.expectedRoles.includes(user.role);

      if (response.ok) {
        console.log(`✅ [DEBUG-403] ${endpoint.name}: OK (${response.status})`);
      } else if (response.status === 403) {
        if (hasPermission) {
          console.error(`❌ [DEBUG-403] ${endpoint.name}: 403 - INESPERADO! Deveria ter acesso`);
          console.error(`   └─ Roles esperadas: ${endpoint.expectedRoles.join(', ')}`);
          console.error(`   └─ Sua role: ${user.role}`);
        } else {
          console.log(`⚠️ [DEBUG-403] ${endpoint.name}: 403 - NORMAL (sem permissão)`);
          console.log(`   └─ Roles necessárias: ${endpoint.expectedRoles.join(', ')}`);
          console.log(`   └─ Sua role: ${user.role}`);
        }
      } else if (response.status === 401) {
        console.error(`❌ [DEBUG-403] ${endpoint.name}: 401 - TOKEN INVÁLIDO!`);
      } else {
        console.warn(`⚠️ [DEBUG-403] ${endpoint.name}: ${response.status} (${response.statusText})`);
      }
    } catch (e) {
      console.error(`💥 [DEBUG-403] ${endpoint.name}: Erro de rede - ${e.message}`);
    }
  }

  console.log('🔍 [DEBUG-403] ================================');
  console.log('📝 [DEBUG-403] RESUMO:');
  console.log('✅ Status 200: Interceptor funcionando + permissão OK');
  console.log('⚠️ Status 403: Interceptor funcionando + sem permissão (normal)');
  console.log('❌ Status 401: Interceptor com problema ou token inválido');
  console.log('💥 Erro de rede: Problema de conectividade');
  console.log('🔍 [DEBUG-403] ================================');
};

// Função para verificar especificamente o token
window.debugToken = function() {
  const token = sessionStorage.getItem('token');

  if (!token) {
    console.error('❌ [TOKEN] Nenhum token encontrado');
    return;
  }

  console.log('🔍 [TOKEN] Analisando token...');

  // Tentar decodificar o JWT (apenas a parte do payload)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('📄 [TOKEN] Payload decodificado:');
      console.log('   └─ Sub (usuário):', payload.sub);
      console.log('   └─ Role:', payload.role);
      console.log('   └─ Issued At:', new Date(payload.iat * 1000));
      console.log('   └─ Expires At:', new Date(payload.exp * 1000));
      console.log('   └─ Token válido até:', new Date(payload.exp * 1000) > new Date() ? 'SIM' : 'NÃO (EXPIRADO)');
    } else {
      console.warn('⚠️ [TOKEN] Formato de token inválido');
    }
  } catch (e) {
    console.error('❌ [TOKEN] Erro ao decodificar:', e.message);
  }
};

console.log('🔍 Debug de 403 carregado!');
console.log('📝 Comandos disponíveis:');
console.log('   • debug403() - Analisar permissões detalhadamente');
console.log('   • debugToken() - Verificar token JWT');
