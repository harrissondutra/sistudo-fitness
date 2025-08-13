// TESTE DEFINITIVO - NAVEGUE PARA /doctor-list E EXECUTE ESTE CÓDIGO
// Este teste vai usar o Angular HttpClient que DEVE disparar o interceptor

console.log('🔥 TESTE DEFINITIVO COM ANGULAR HTTPCLIENT');

// Simular clique no botão de carregar médicos ou forçar reload
function forcarReloadMedicos() {
  console.log('🚀 FORÇANDO RELOAD DOS MÉDICOS...');
  console.log('🎯 OBSERVE OS LOGS DO INTERCEPTOR AGORA!');

  // Disparar o NgZone para forçar detecção de mudanças
  try {
    // Tentar acessar o componente atual
    const element = document.querySelector('app-doctor-list');
    if (element) {
      console.log('✅ Componente doctor-list encontrado');

      // Simular um refresh
      location.reload();
    } else {
      console.log('❌ Componente doctor-list não encontrado');
      console.log('💡 Navegue para /doctor-list primeiro!');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Executar o teste
forcarReloadMedicos();

console.log('📋 INSTRUÇÕES:');
console.log('1. Certifique-se de estar na página /doctor-list');
console.log('2. Execute este script');
console.log('3. Observe se aparecem logs com 🚨 [AUTH-INTERCEPTOR]');
console.log('4. Se não aparecer nenhum log, o interceptor NÃO está registrado corretamente!');
