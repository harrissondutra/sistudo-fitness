import { ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideClientHydration } from '@angular/platform-browser'; // Removido para desenvolvimento
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe, registerLocaleData } from '@angular/common';
import { provideNgxMask } from 'ngx-mask';
import localePt from '@angular/common/locales/pt';

import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
// import { errorInterceptor } from './core/interceptors/error.interceptor';

// Registrar locale pt-BR
registerLocaleData(localePt);

// Formato de datas para exibição no formulário
export const DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
    timeInput: 'HH:mm',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
    timeInput: 'HH:mm',
    timeOptionLabel: 'HH:mm',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ⚡ INTERCEPTOR AUTH DEFINITIVO
    provideHttpClient(withInterceptors([
      authInterceptor
    ])),
    provideAnimations(),
    // provideClientHydration(), // Removido para desenvolvimento sem SSR
    provideNgxMask(), // Suporte para máscaras de input

    // Módulos do Material
    importProvidersFrom(
      MatSnackBarModule
    ),

    // DatePipe disponível globalmente
    DatePipe,

    // Configuração de locale
    { provide: LOCALE_ID, useValue: 'pt-BR' },

    // Configuração de datas
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { strict: true } }
  ]
};
