/**
 * 🚀 SCRIPT DE TESTE DE PRODUÇÃO
 *
 * Como usar este script:
 * 1. Fazer login na aplicação (localhost:64501)
 * 2. Abrir o console do navegador (F12)
 * 3. Copiar e colar este código no console
 * 4. Executar: testProductionInterceptor()
 */

window.testProductionInterceptor = async function() {
  console.log('🚀 [TESTE-PRODUÇÃO] Iniciando teste do interceptor...');

  // 1. Verificar se há token
  const token = sessionStorage.getItem('token');
  if (!token) {
    console.error('❌ [TESTE-PRODUÇÃO] Nenhum token encontrado. Faça login primeiro!');
    return;
  }

  console.log('✅ [TESTE-PRODUÇÃO] Token encontrado:', token.substring(0, 20) + '...');

  // 2. Testar requisição simples
  try {
    const response = await fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📊 [TESTE-PRODUÇÃO] Status da resposta:', response.status);

    if (response.ok) {
      console.log('✅ [TESTE-PRODUÇÃO] SUCESSO! Interceptor funcionará em produção');
      console.log('✅ [TESTE-PRODUÇÃO] Headers de autorização funcionando corretamente');

      // Testar resposta
      const data = await response.json();
      console.log('📄 [TESTE-PRODUÇÃO] Dados recebidos:', data.length + ' registros');

    } else if (response.status === 401) {
      console.error('❌ [TESTE-PRODUÇÃO] FALHA! Token inválido ou expirado');
      console.error('❌ [TESTE-PRODUÇÃO] Interceptor NÃO funcionará em produção');

    } else if (response.status === 403) {
      console.error('❌ [TESTE-PRODUÇÃO] FALHA! Acesso negado');
      console.error('❌ [TESTE-PRODUÇÃO] Verificar permissões do usuário');

    } else {
      console.warn('⚠️ [TESTE-PRODUÇÃO] Status inesperado:', response.status);
      console.warn('⚠️ [TESTE-PRODUÇÃO] Verificar configuração da API');
    }

  } catch (error) {
    console.error('💥 [TESTE-PRODUÇÃO] Erro de rede:', error.message);
    console.error('💥 [TESTE-PRODUÇÃO] Verificar conectividade com:', 'https://api-sistudo-fitness-production.up.railway.app');
  }
};

// 3. Testar interceptor Angular diretamente
window.testAngularInterceptor = function() {
  console.log('🅰️ [TESTE-ANGULAR] Testando interceptor Angular...');

  // Tentar acessar o componente Angular
  const angularElement = document.querySelector('app-home');
  if (angularElement) {
    console.log('✅ [TESTE-ANGULAR] Componente Angular encontrado');

    // Verificar se podemos acessar métodos do componente
    if (window.ng) {
      console.log('✅ [TESTE-ANGULAR] Angular DevTools disponível');
      console.log('🔍 [TESTE-ANGULAR] Execute: ng.getComponent($0).testInterceptorProduction()');
      console.log('🔍 [TESTE-ANGULAR] (Primeiro selecione o elemento app-home no Elements tab)');
    } else {
      console.log('ℹ️ [TESTE-ANGULAR] Angular DevTools não disponível');
      console.log('ℹ️ [TESTE-ANGULAR] Use testProductionInterceptor() para teste manual');
    }
  } else {
    console.error('❌ [TESTE-ANGULAR] Componente Angular não encontrado');
  }
};

console.log('🚀 [SETUP] Scripts de teste carregados!');
console.log('📝 [SETUP] Comandos disponíveis:');
console.log('   • testProductionInterceptor() - Teste manual da API');
console.log('   • testAngularInterceptor() - Teste do interceptor Angular');
console.log('🔍 [SETUP] Faça login primeiro, depois execute os testes!');
