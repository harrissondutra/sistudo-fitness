import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask';

// Importações para configurar o formato de data do Angular Material
import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import {
  MatMomentDateModule, // Se você estiver usando o MomentDateAdapter
  MAT_MOMENT_DATE_ADAPTER_OPTIONS
} from '@angular/material-moment-adapter';


import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes'; // Suas rotas

// Formatos de data personalizados para DD/MM/YYYY
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY', // Ex: Jan 2023
    dateA11yLabel: 'LL',        // Ex: January 1, 2023
    monthYearA11yLabel: 'MMMM YYYY', // Ex: January 2023
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    provideNgxMask(), // Configuração do ngx-mask

    // Provedores para configurar o formato de data do Material Design
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }, // Define a localidade para português do Brasil
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }, // Aplica os formatos personalizados
    // Importante: Você precisa ter @angular/material-moment-adapter instalado se usar MatMomentDateModule
    // Caso contrário, use MatNativeDateModule e NativeDateAdapter.
    { provide: DateAdapter, useClass: MatMomentDateModule },
    // Se você estiver usando o MomentDateAdapter, pode ser útil definir as opções de Moment.js
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
}).catch(err => console.error(err));
