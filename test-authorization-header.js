/**
 * Script de teste para verificar se o Authorization header está sendo enviado corretamente
 * Execute este script no console do DevTools em produção para validar a correção
 */

console.log('🔍 TESTE DE INTERCEPTORS - AUTHORIZATION HEADER');

// 1. Verificar se o token existe
const token = sessionStorage.getItem('token');
console.log('1. Token no sessionStorage:', {
  existe: !!token,
  tamanho: token?.length || 0,
  preview: token ? token.substring(0, 30) + '...' : 'N/A'
});

// 2. Interceptar fetch para monitorar headers
const originalFetch = window.fetch;
let requestCount = 0;

window.fetch = function(...args) {
  requestCount++;
  console.log(`🚀 [INTERCEPTED FETCH #${requestCount}]`, {
    url: args[0],
    method: args[1]?.method || 'GET',
    headers: args[1]?.headers || {},
    hasAuthorization: !!(args[1]?.headers?.['Authorization'] || args[1]?.headers?.['authorization'])
  });

  return originalFetch.apply(this, args);
};

// 3. Teste direto com Angular HttpClient
if (window.ng && window.ng.getAllAngularRootElements) {
  try {
    const appRef = window.ng.getAllAngularRootElements()[0];
    if (appRef) {
      console.log('🅰️ Angular detectado - HttpClient disponível para teste');
    }
  } catch (e) {
    console.log('ℹ️ Angular DevTools não disponível');
  }
}

// 4. Teste manual de requisição
console.log('🧪 Executando teste manual...');

fetch('https://api-sistudo-fitness-production.up.railway.app/clients/listAll', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
.then(async response => {
  console.log('📊 RESULTADO DO TESTE:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    headers: Object.fromEntries([...response.headers.entries()])
  });

  if (response.ok) {
    console.log('✅ SUCESSO! Authorization header funcionando');
    const data = await response.json();
    console.log('📄 Dados recebidos:', data);
  } else {
    console.log('❌ FALHA! Ainda há problemas');
    const error = await response.text();
    console.log('❌ Erro:', error);
  }
})
.catch(error => {
  console.error('💥 ERRO DE REDE:', error);
});

console.log('ℹ️ Teste executado. Aguarde os resultados acima...');
console.log('ℹ️ Para voltar ao fetch original: window.fetch = originalFetch');
