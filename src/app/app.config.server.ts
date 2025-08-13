import { provideServerRendering } from '@angular/ssr';
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appConfig } from './app.config';
import { authInterceptor } from './core/interceptors/auth.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // 🔧 GARANTIR INTERCEPTOR NO SSR
    provideHttpClient(withInterceptors([
      authInterceptor
    ]))
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
