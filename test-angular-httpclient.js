// TESTE USANDO ANGULAR HTTPCLIENT - ESTE VAI DISPARAR O INTERCEPTOR
// Cole este código no console do DevTools na aplicação Angular

console.log('🔥 TESTE ANGULAR HTTPCLIENT - ESTE DEVE FUNCIONAR!');

// Pegar a instância do HttpClient do Angular
const httpClient = window?.ng?.getContext(document.body)?.injector?.get(ng.common.http.HttpClient);

if (!httpClient) {
  console.error('❌ HttpClient não encontrado. Certifique-se de estar na aplicação Angular rodando.');
  console.log('💡 Tente navegar para uma página da aplicação e execute novamente.');
} else {
  console.log('✅ HttpClient encontrado! Testando interceptor...');

  const baseUrl = 'https://api-sistudo-fitness-production.up.railway.app';

  // Esta requisição DEVE disparar o interceptor
  httpClient.get(`${baseUrl}/api/doctors`).subscribe({
    next: (data) => {
      console.log('✅ SUCESSO! Interceptor funcionou!', data.length, 'registros');
    },
    error: (error) => {
      console.error('❌ ERRO:', error.status, error.message);
      if (error.status === 403) {
        console.error('💡 Status 403 = Interceptor não está adicionando headers');
      }
    }
  });
}
