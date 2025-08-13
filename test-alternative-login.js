/**
 * 🧪 TESTE DE LOGIN ALTERNATIVO
 *
 * Cole este código no console e execute: testAlternativeLogin()
 */

window.testAlternativeLogin = async function() {
  console.log('🧪 [ALT-LOGIN] ================================');
  console.log('🧪 [ALT-LOGIN] TESTE DE LOGIN ALTERNATIVO');
  console.log('🧪 [ALT-LOGIN] ================================');

  // Salvar dados atuais
  const currentToken = sessionStorage.getItem('token');
  const currentUserInfo = sessionStorage.getItem('userInfo');

  console.log('💾 [ALT-LOGIN] Dados atuais salvos para restaurar depois');

  // Função para testar login com credenciais específicas
  window.testLoginWith = async function(email, password) {
    try {
      console.log(`🔑 [ALT-LOGIN] Tentando login com: ${email}`);

      const response = await fetch('https://api-sistudo-fitness-production.up.railway.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [ALT-LOGIN] Login bem-sucedido!');
        console.log('👤 [ALT-LOGIN] Usuário:', data.user);
        console.log('🔑 [ALT-LOGIN] Role:', data.user.role);

        // Salvar temporariamente
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userInfo', JSON.stringify(data.user));

        // Testar endpoint básico
        const testResponse = await fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`📡 [ALT-LOGIN] Teste /clients/listAll: ${testResponse.status}`);

        if (testResponse.ok) {
          console.log('🎉 [ALT-LOGIN] FUNCIONA! Este usuário tem permissões');
          const clients = await testResponse.json();
          console.log(`📊 [ALT-LOGIN] ${clients.length} clientes encontrados`);
        } else {
          console.log(`❌ [ALT-LOGIN] Também retorna ${testResponse.status} - problema geral`);
        }

        return true;
      } else {
        console.error(`❌ [ALT-LOGIN] Falha no login: ${response.status}`);
        const error = await response.text();
        console.error(`📝 [ALT-LOGIN] Erro: ${error}`);
        return false;
      }
    } catch (e) {
      console.error(`💥 [ALT-LOGIN] Erro de rede: ${e.message}`);
      return false;
    }
  };

  // Função para restaurar dados originais
  window.restoreOriginalLogin = function() {
    if (currentToken) {
      sessionStorage.setItem('token', currentToken);
      sessionStorage.setItem('userInfo', currentUserInfo);
      console.log('✅ [ALT-LOGIN] Dados originais restaurados');
    } else {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userInfo');
      console.log('✅ [ALT-LOGIN] Sessão limpa');
    }
  };

  console.log('🧪 [ALT-LOGIN] ================================');
  console.log('📝 [ALT-LOGIN] COMANDOS DISPONÍVEIS:');
  console.log('');
  console.log('// Para testar login com credenciais específicas:');
  console.log('testLoginWith("email@exemplo.com", "senha123")');
  console.log('');
  console.log('// Para restaurar login original:');
  console.log('restoreOriginalLogin()');
  console.log('');
  console.log('🎯 [ALT-LOGIN] OBJETIVO:');
  console.log('   - Verificar se problema é específico do usuário ADMIN');
  console.log('   - Ou se é um problema geral de permissões no backend');
  console.log('🧪 [ALT-LOGIN] ================================');
};

console.log('🧪 Teste de login alternativo carregado! Execute: testAlternativeLogin()');
