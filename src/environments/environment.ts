// Detecta automaticamente se está em produção baseado no hostname ou variável de ambiente
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || 
   window.location.hostname.includes('sistudo-fitness') ||
   (window.location.protocol === 'https:' && !window.location.hostname.includes('localhost')));

export const environment = {
  production: isProduction,
  apiUrl: isProduction 
    ? 'https://api-sistudo-fitness-production.up.railway.app' // Produção
    : 'http://localhost:8082'  // Desenvolvimento local
};
