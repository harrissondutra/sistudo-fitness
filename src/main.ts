// main.ts (ou app.config.ts)
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask'; // Importe a função provideNgxMask

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Suas rotas

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideNgxMask() // Adicione esta linha aqui para provisionar o ngx-mask globalmente
  ]
}).catch(err => console.error(err));
