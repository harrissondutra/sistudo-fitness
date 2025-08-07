// Detecta automaticamente se está em produção
const isProduction = typeof window !== 'undefined' && 
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('127.0.0.1');

export const environment = {
  production: isProduction,
  apiUrl: isProduction 
    ? 'https://api-sistudo-fitness-production.up.railway.app'
    : 'http://localhost:8082'
};
