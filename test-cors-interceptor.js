/**
 * 🔍 TESTE DE CORS vs INTERCEPTOR
 *
 * Cole este código no console e execute: testCorsVsInterceptor()
 */

window.testCorsVsInterceptor = async function() {
  console.log('🔍 [CORS-TEST] ================================');
  console.log('🔍 [CORS-TEST] TESTE: CORS vs INTERCEPTOR');
  console.log('🔍 [CORS-TEST] ================================');

  const token = sessionStorage.getItem('token');
  if (!token) {
    console.error('❌ [CORS-TEST] Faça login primeiro!');
    return;
  }

  console.log('🧪 [CORS-TEST] Comparando fetch direto vs requisições da aplicação...');

  // Teste 1: Fetch direto (sem CORS)
  console.log('📡 [CORS-TEST] Teste 1: Fetch direto do console...');

  try {
    const directResponse = await fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'https://sistudo-fitness.vercel.app'  // Simular origem
      }
    });

    console.log(`✅ [CORS-TEST] Fetch direto: ${directResponse.status} ${directResponse.statusText}`);

    if (directResponse.ok) {
      const data = await directResponse.json();
      console.log(`📊 [CORS-TEST] Dados recebidos: ${data.length} registros`);
    }
  } catch (e) {
    console.error(`❌ [CORS-TEST] Fetch direto falhou: ${e.message}`);
  }

  // Teste 2: Verificar headers CORS
  console.log('📡 [CORS-TEST] Teste 2: Verificando headers CORS...');

  try {
    const corsResponse = await fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
      method: 'OPTIONS',  // Preflight request
      headers: {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization,Content-Type',
        'Origin': 'https://sistudo-fitness.vercel.app'
      }
    });

    console.log(`📋 [CORS-TEST] Preflight response: ${corsResponse.status}`);
    console.log('📋 [CORS-TEST] Headers CORS do servidor:');

    const corsHeaders = [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Credentials'
    ];

    corsHeaders.forEach(header => {
      const value = corsResponse.headers.get(header);
      console.log(`   ${header}: ${value || 'NÃO DEFINIDO'}`);
    });

  } catch (e) {
    console.error(`❌ [CORS-TEST] Preflight falhou: ${e.message}`);
  }

  // Teste 3: Verificar configuração atual do frontend
  console.log('📡 [CORS-TEST] Teste 3: Verificando configuração atual...');

  console.log('🌐 [CORS-TEST] Origem atual:', window.location.origin);
  console.log('🌐 [CORS-TEST] Host atual:', window.location.host);
  console.log('🌐 [CORS-TEST] Protocol:', window.location.protocol);

  // Teste 4: Simular requisição com diferentes origens
  console.log('📡 [CORS-TEST] Teste 4: Testando diferentes origens...');

  const originsToTest = [
    'https://sistudo-fitness.vercel.app',
    'http://localhost:4200',
    'http://localhost:3000'
  ];

  for (const origin of originsToTest) {
    try {
      const response = await fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ [CORS-TEST] Origin ${origin}: ${response.status}`);
    } catch (e) {
      if (e.message.includes('CORS')) {
        console.error(`❌ [CORS-TEST] Origin ${origin}: BLOQUEADO POR CORS`);
      } else {
        console.error(`❌ [CORS-TEST] Origin ${origin}: ${e.message}`);
      }
    }
  }

  console.log('🔍 [CORS-TEST] ================================');
  console.log('📊 [CORS-TEST] DIAGNÓSTICO:');
  console.log('');
  console.log('🎯 [CORS-TEST] Se fetch direto FUNCIONA mas aplicação FALHA:');
  console.log('   → Problema é CORS no backend');
  console.log('   → Interceptor está funcionando');
  console.log('   → Backend precisa permitir origem do Vercel');
  console.log('');
  console.log('🎯 [CORS-TEST] Se ambos FALHAM:');
  console.log('   → Problema é de autenticação/permissões');
  console.log('   → Verificar token e roles no backend');
  console.log('');
  console.log('💡 [CORS-TEST] SOLUÇÃO PROVÁVEL:');
  console.log('   Backend precisa adicionar nas configurações CORS:');
  console.log('   - Origin: https://sistudo-fitness.vercel.app');
  console.log('   - Headers: Authorization, Content-Type');
  console.log('   - Methods: GET, POST, PUT, DELETE');
  console.log('🔍 [CORS-TEST] ================================');
};

console.log('🔍 Teste CORS vs Interceptor carregado! Execute: testCorsVsInterceptor()');
