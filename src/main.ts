import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask'; // IMPORTANTE: Certifique-se de que esta importação está correta

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Suas rotas

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideNgxMask() // ESTA LINHA É CRUCIAL: Adicione aqui para provisionar o ngx-mask globalmente
  ]
}).catch(err => console.error(err));
