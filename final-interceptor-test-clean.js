// TESTE CRÍTICO DO INTERCEPTOR - VERSÃO FINAL
// Execute este script no console do navegador para testar se o interceptor está funcionando

console.log('🔥 INICIANDO TESTE CRÍTICO DO INTERCEPTOR...');

async function testeInterceptorFinal() {
  const baseUrl = 'https://api-sistudo-fitness-production.up.railway.app';
  const token = sessionStorage.getItem('token');

  console.log('🚨 TOKEN ENCONTRADO:', token ? 'SIM' : 'NÃO');

  if (!token) {
    console.error('❌ NENHUM TOKEN ENCONTRADO NO sessionStorage');
    return;
  }

  console.log('🔍 TOKEN PREVIEW:', token.substring(0, 50) + '...');

  try {
    console.log('📡 FAZENDO CHAMADA PARA /api/doctors...');
    console.log('🎯 OBSERVAR LOGS DO INTERCEPTOR NO CONSOLE...');

    // Esta chamada deve disparar o interceptor e mostrar todos os logs
    const response = await fetch(`${baseUrl}/api/doctors`, {
      method: 'GET',
      // NÃO adicionamos headers manualmente - deve vir do interceptor
    });

    console.log('📊 STATUS DA RESPOSTA:', response.status);
    console.log('📋 HEADERS DA RESPOSTA:', [...response.headers.entries()]);

    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ SUCESSO! Dados recebidos:', data.length, 'registros');
      console.log('🎉 INTERCEPTOR ESTÁ FUNCIONANDO PERFEITAMENTE!');
    } else if (response.status === 403) {
      console.error('❌ STATUS 403 - INTERCEPTOR NÃO ESTÁ ADICIONANDO HEADERS!');
      console.error('💡 Verifique se os logs do interceptor apareceram acima');
    } else {
      console.warn('⚠️ STATUS INESPERADO:', response.status);
      const text = await response.text();
      console.log('📄 RESPOSTA:', text);
    }

  } catch (error) {
    console.error('💥 ERRO NA REQUISIÇÃO:', error);
  }
}

// Executar o teste
testeInterceptorFinal();
