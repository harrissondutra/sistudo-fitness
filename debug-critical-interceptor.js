/**
 * 🔍 DEBUG CRÍTICO DO INTERCEPTOR
 *
 * Cole este código no console e execute: criticalInterceptorDebug()
 */

window.criticalInterceptorDebug = async function() {
  console.log('🔍 [CRITICAL] ================================');
  console.log('🔍 [CRITICAL] DEBUG CRÍTICO DO INTERCEPTOR');
  console.log('🔍 [CRITICAL] ================================');

  const token = sessionStorage.getItem('token');
  if (!token) {
    console.error('❌ [CRITICAL] Sem token!');
    return;
  }

  console.log('🎯 [CRITICAL] Problema: Interceptor não está injetando headers!');
  console.log('🎯 [CRITICAL] Evidência: Nenhum log "🔥 [AUTH-INTERCEPTOR]" apareceu');
  console.log('🎯 [CRITICAL] Resultado: Todos os endpoints retornam 403');
  console.log('');

  // Teste 1: Verificar se o interceptor está configurado
  console.log('📡 [CRITICAL] Teste 1: Fetch SEM headers (simula interceptor quebrado)');

  try {
    const withoutHeaders = await fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll');
    console.log(`❌ [CRITICAL] Sem headers: ${withoutHeaders.status} (deveria dar 401/403)`);
  } catch (e) {
    console.log(`❌ [CRITICAL] Sem headers: Erro - ${e.message}`);
  }

  // Teste 2: Fetch COM headers (prova que API funciona)
  console.log('📡 [CRITICAL] Teste 2: Fetch COM headers (prova que API funciona)');

  try {
    const withHeaders = await fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (withHeaders.ok) {
      const data = await withHeaders.json();
      console.log(`✅ [CRITICAL] Com headers: ${withHeaders.status} - ${data.length} registros`);
      console.log('🎯 [CRITICAL] PROVA: API funciona quando headers são enviados!');
    } else {
      console.log(`⚠️ [CRITICAL] Com headers: ${withHeaders.status} - Pode ser permissão`);
    }
  } catch (e) {
    console.log(`❌ [CRITICAL] Com headers: Erro - ${e.message}`);
  }

  console.log('');
  console.log('🔍 [CRITICAL] ================================');
  console.log('📊 [CRITICAL] DIAGNÓSTICO:');
  console.log('   ❌ Interceptor NÃO está funcionando');
  console.log('   ❌ Headers Authorization NÃO estão sendo injetados');
  console.log('   ❌ Todas as requisições da aplicação falham');
  console.log('   ✅ Fetch manual COM headers funciona');
  console.log('');
  console.log('🔧 [CRITICAL] POSSÍVEIS CAUSAS:');
  console.log('   1. Interceptor não está registrado corretamente');
  console.log('   2. Ordem dos interceptors está errada');
  console.log('   3. Erro na configuração do app.config.ts');
  console.log('   4. Interceptor está sendo sobrescrito');
  console.log('   5. Problema na build de produção');
  console.log('');
  console.log('💡 [CRITICAL] PRÓXIMOS PASSOS:');
  console.log('   1. Verificar app.config.ts');
  console.log('   2. Verificar se há conflitos de interceptors');
  console.log('   3. Testar interceptor em desenvolvimento');
  console.log('   4. Verificar logs de build');
  console.log('🔍 [CRITICAL] ================================');
};

console.log('🔍 Debug crítico carregado! Execute: criticalInterceptorDebug()');
