// main.ts ou app.config.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations'; // <-- Importe isto!

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Suas rotas

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // Necessário para o HttpClient (seu erro anterior)
    provideAnimations()   // <-- Necessário para as animações do Material (seu erro atual)
  ]
}).catch(err => console.error(err));
