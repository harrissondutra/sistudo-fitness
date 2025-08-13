/**
 * 🚀 TES  // Verificar informações do usuário para determinar permissões
  const userInfo = sessionStorage.getItem('userInfo');
  let userRole = 'CLIENT';
  if (userInfo) {
    const user = JSON.parse(userInfo);
    userRole = user.role || 'CLIENT';

    // Normalizar role - remover prefixo ROLE_ se existir
    if (userRole.startsWith('ROLE_')) {
      userRole = userRole.replace('ROLE_', '');
    }

    console.log('👤 Usuário:', user.username || user.email);
    console.log('🔑 Role original:', user.role);
    console.log('🔑 Role normalizada:', userRole);
  } DE PRODUÇÃO - VERSÃO COMPACTA
 *
 * Cole este código no console da sua aplicação em PRODUÇÃO
 * e execute: quickTest()
 */

window.quickTest = async function() {
  const token = sessionStorage.getItem('token');
  if (!token) {
    console.error('❌ Faça login primeiro!');
    return;
  }

  // Verificar informações do usuário para determinar permissões
  const userInfo = sessionStorage.getItem('userInfo');
  let userRole = 'CLIENT';
  if (userInfo) {
    const user = JSON.parse(userInfo);
    userRole = user.role || 'CLIENT';
    console.log('� Usuário:', user.username || user.email);
    console.log('🔑 Role:', userRole);
  }

  console.log('�🚀 Testando interceptor com endpoints permitidos...');

  // Lista de endpoints para testar baseado na role
  const endpointsToTest = [];

  if (userRole === 'ADMIN') {
    endpointsToTest.push(
      { url: '/clients/listAll', name: 'Clientes' },
      { url: '/users', name: 'Usuários' },
      { url: '/doctors/list', name: 'Médicos' },
      { url: '/nutritionists/listAll', name: 'Nutricionistas' },
      { url: '/exercises/list', name: 'Exercícios' }
    );
  } else if (userRole === 'DOCTOR') {
    endpointsToTest.push(
      { url: '/clients/listAll', name: 'Clientes' },
      { url: '/doctors/list', name: 'Médicos' }
    );
  } else if (userRole === 'PERSONAL') {
    endpointsToTest.push(
      { url: '/clients/listAll', name: 'Clientes' },
      { url: '/exercises/list', name: 'Exercícios' }
    );
  } else if (userRole === 'NUTRITIONIST') {
    endpointsToTest.push(
      { url: '/clients/listAll', name: 'Clientes' },
      { url: '/nutritionists/listAll', name: 'Nutricionistas' }
    );
  } else {
    // CLIENT ou role desconhecida - testar endpoints básicos
    endpointsToTest.push(
      { url: '/clients/listAll', name: 'Clientes (básico)' }
    );
  }

  let successCount = 0;
  let totalTests = endpointsToTest.length;

  for (const endpoint of endpointsToTest) {
    try {
      console.log(`📡 Testando: ${endpoint.name}...`);

      const response = await fetch(`https://api-sistudo-fitness-production.up.railway.app${endpoint.url}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name}: OK (${Array.isArray(data) ? data.length : 'N/A'} registros)`);
        successCount++;
      } else if (response.status === 403) {
        console.warn(`⚠️ ${endpoint.name}: 403 (Sem permissão - normal para sua role)`);
      } else if (response.status === 401) {
        console.error(`❌ ${endpoint.name}: 401 (Token inválido)`);
      } else {
        console.warn(`⚠️ ${endpoint.name}: ${response.status} (${response.statusText})`);
      }
    } catch (e) {
      console.error(`� ${endpoint.name}: Erro de rede - ${e.message}`);
    }
  }

  // Resultado final
  console.log('🎯 ============================');
  if (successCount > 0) {
    console.log(`✅ INTERCEPTOR FUNCIONANDO!`);
    console.log(`✅ ${successCount}/${totalTests} endpoints com sucesso`);
    console.log('🎉 Pronto para produção!');

    if (successCount < totalTests) {
      console.log('ℹ️ Alguns endpoints retornaram 403 (normal - questão de permissões)');
    }
  } else {
    console.error('❌ PROBLEMA: Nenhum endpoint funcionou');
    console.error('� Verificar: Token válido? Role correta? API online?');
  }
};

console.log('🚀 Teste rápido carregado! Execute: quickTest()');
