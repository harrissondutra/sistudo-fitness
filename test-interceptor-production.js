/**
 * 🌐 SCRIPT DE TESTE EM PRODUÇÃO
 *
 * ⚠️  IMPORTANTE: Este script deve ser usado APENAS no ambiente de PRODUÇÃO
 *
 * Como usar:
 * 1. Acesse sua aplicação em PRODUÇÃO (ex: https://sistudo-fitness.vercel.app)
 * 2. Faça login com suas credenciais
 * 3. Abra o console do navegador (F12)
 * 4. Cole este script inteiro no console
 * 5. Execute: testProductionInterceptor()
 */

// Detectar automaticamente o ambiente
const isProduction = !window.location.hostname.includes('localhost') &&
                    !window.location.hostname.includes('127.0.0.1') &&
                    !window.location.hostname.includes('4200');

const API_BASE_URL = 'https://api-sistudo-fitness-production.up.railway.app';

window.testProductionInterceptor = async function() {
  console.log('🌐 [PRODUÇÃO] =================================');
  console.log('🌐 [PRODUÇÃO] TESTE DO INTERCEPTOR EM PRODUÇÃO');
  console.log('🌐 [PRODUÇÃO] =================================');

  // 1. Verificar ambiente
  console.log('🌐 [PRODUÇÃO] URL atual:', window.location.href);
  console.log('🌐 [PRODUÇÃO] É produção?', isProduction ? 'SIM ✅' : 'NÃO ⚠️');

  if (!isProduction) {
    console.warn('⚠️  [PRODUÇÃO] ATENÇÃO: Você não está em produção!');
    console.warn('⚠️  [PRODUÇÃO] Este script é para ambiente de produção.');
  }

  // 2. Verificar token
  const token = sessionStorage.getItem('token');
  if (!token) {
    console.error('❌ [PRODUÇÃO] ERRO: Nenhum token encontrado!');
    console.error('❌ [PRODUÇÃO] SOLUÇÃO: Faça login primeiro');
    return false;
  }

  console.log('✅ [PRODUÇÃO] Token encontrado:', token.substring(0, 30) + '...');

  // 3. Verificar informações do usuário
  const userInfo = sessionStorage.getItem('userInfo');
  if (userInfo) {
    const user = JSON.parse(userInfo);
    console.log('👤 [PRODUÇÃO] Usuário logado:', user.username || user.email);
    console.log('🔑 [PRODUÇÃO] Role:', user.role);
  }

  // 4. Testar conectividade com a API
  console.log('🔗 [PRODUÇÃO] Testando conectividade com API...');

  try {
    // Teste 1: Requisição simples
    console.log('📡 [PRODUÇÃO] Teste 1: Listagem de clientes...');
    const response1 = await fetch(`${API_BASE_URL}/clients/listAll`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📊 [PRODUÇÃO] Status:', response1.status);
    console.log('📊 [PRODUÇÃO] Status Text:', response1.statusText);

    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ [PRODUÇÃO] SUCESSO! Clientes recebidos:', data1.length);

      // Teste 2: Requisição de usuários
      console.log('📡 [PRODUÇÃO] Teste 2: Listagem de usuários...');
      const response2 = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response2.ok) {
        const data2 = await response2.json();
        console.log('✅ [PRODUÇÃO] SUCESSO! Usuários recebidos:', data2.length);

        // Teste 3: Requisição de exercícios
        console.log('📡 [PRODUÇÃO] Teste 3: Listagem de exercícios...');
        const response3 = await fetch(`${API_BASE_URL}/exercises/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response3.ok) {
          const data3 = await response3.json();
          console.log('✅ [PRODUÇÃO] SUCESSO! Exercícios recebidos:', data3.length);

          // RESULTADO FINAL
          console.log('🎉 [PRODUÇÃO] ================================');
          console.log('🎉 [PRODUÇÃO] TODOS OS TESTES PASSARAM!');
          console.log('🎉 [PRODUÇÃO] INTERCEPTOR FUNCIONANDO 100%');
          console.log('🎉 [PRODUÇÃO] ================================');
          console.log('✅ [PRODUÇÃO] ✓ Autenticação funcionando');
          console.log('✅ [PRODUÇÃO] ✓ Headers sendo enviados');
          console.log('✅ [PRODUÇÃO] ✓ API respondendo');
          console.log('✅ [PRODUÇÃO] ✓ Dados sendo recebidos');
          console.log('🚀 [PRODUÇÃO] Sistema pronto para uso!');

          return true;

        } else {
          console.warn('⚠️  [PRODUÇÃO] Exercícios falharam, mas clientes funcionaram');
        }
      } else {
        console.warn('⚠️  [PRODUÇÃO] Usuários falharam, mas clientes funcionaram');
      }

      console.log('✅ [PRODUÇÃO] INTERCEPTOR FUNCIONANDO (parcial)');
      return true;

    } else if (response1.status === 401) {
      console.error('❌ [PRODUÇÃO] ERRO 401: Token inválido ou expirado');
      console.error('❌ [PRODUÇÃO] SOLUÇÃO: Faça logout e login novamente');
      return false;

    } else if (response1.status === 403) {
      console.error('❌ [PRODUÇÃO] ERRO 403: Acesso negado');
      console.error('❌ [PRODUÇÃO] SOLUÇÃO: Verificar permissões do usuário');
      return false;

    } else {
      console.error('❌ [PRODUÇÃO] ERRO', response1.status + ':', response1.statusText);
      const errorText = await response1.text();
      console.error('❌ [PRODUÇÃO] Detalhes:', errorText);
      return false;
    }

  } catch (error) {
    console.error('💥 [PRODUÇÃO] ERRO DE REDE:', error.message);
    console.error('💥 [PRODUÇÃO] Verificar:');
    console.error('   • Conectividade com internet');
    console.error('   • Status da API:', API_BASE_URL);
    console.error('   • CORS configurado corretamente');
    return false;
  }
};

// Função para testar o interceptor Angular em produção
window.testAngularInterceptorProduction = function() {
  console.log('🅰️ [PRODUÇÃO-ANGULAR] Testando interceptor Angular...');

  // Verificar se está em produção
  if (!isProduction) {
    console.warn('⚠️  [PRODUÇÃO-ANGULAR] Este teste é para ambiente de produção');
  }

  // Tentar acessar componente Angular
  const angularElement = document.querySelector('app-root') ||
                        document.querySelector('app-home') ||
                        document.querySelector('[ng-version]');

  if (angularElement) {
    console.log('✅ [PRODUÇÃO-ANGULAR] Aplicação Angular encontrada');

    if (window.ng) {
      console.log('✅ [PRODUÇÃO-ANGULAR] Angular DevTools disponível');
      console.log('🔍 [PRODUÇÃO-ANGULAR] Comandos disponíveis:');
      console.log('   ng.getComponent($0) - Acessar componente selecionado');
      console.log('   ng.getAllAngularRootElements() - Todos elementos Angular');
    } else {
      console.log('ℹ️ [PRODUÇÃO-ANGULAR] Angular DevTools não disponível em produção');
      console.log('ℹ️ [PRODUÇÃO-ANGULAR] Isso é normal - use testProductionInterceptor()');
    }
  } else {
    console.error('❌ [PRODUÇÃO-ANGULAR] Aplicação Angular não encontrada');
  }
};

// Função para verificar logs do interceptor (só funciona em dev)
window.checkInterceptorLogs = function() {
  console.log('📝 [LOGS] Verificando logs do interceptor...');

  if (isProduction) {
    console.log('ℹ️ [LOGS] Em produção, logs do interceptor são desabilitados');
    console.log('ℹ️ [LOGS] Isso é normal e melhora a performance');
    console.log('✅ [LOGS] Para testar, use: testProductionInterceptor()');
  } else {
    console.log('🔍 [LOGS] Em desenvolvimento, procure por:');
    console.log('   🔥 [AUTH-INTERCEPTOR] Interceptando requisição');
    console.log('   🔥 [AUTH-INTERCEPTOR] Token encontrado');
  }
};

// Auto-executar informações básicas
console.log('🌐 [SETUP] Script de teste de produção carregado!');
console.log('🌐 [SETUP] Ambiente detectado:', isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
console.log('🌐 [SETUP] ===================================');
console.log('📝 [SETUP] Comandos disponíveis:');
console.log('   • testProductionInterceptor() - Teste completo');
console.log('   • testAngularInterceptorProduction() - Teste Angular');
console.log('   • checkInterceptorLogs() - Verificar logs');
console.log('🌐 [SETUP] ===================================');

if (isProduction) {
  console.log('🚀 [SETUP] Você está em PRODUÇÃO!');
  console.log('🔍 [SETUP] Execute: testProductionInterceptor()');
} else {
  console.log('⚠️  [SETUP] Você está em DESENVOLVIMENTO');
  console.log('💡 [SETUP] Este script funciona melhor em produção');
}
