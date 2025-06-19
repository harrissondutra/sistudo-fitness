import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideClientHydration } from '@angular/platform-browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

import { MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { DateFormatInterceptor } from './core/interceptors/date-format.interceptor/date-format.interceptor';

// Formato de datas para exibição no formulário
export const DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Múltiplos interceptores - error e date-format
    provideHttpClient(withInterceptors([errorInterceptor, DateFormatInterceptor])),
    provideAnimations(),
    provideClientHydration(),

    // Módulos do Material
    importProvidersFrom(
      MatSnackBarModule,
      // Substitua MatNativeDateModule pelo adapter do moment se necessário
      // MatNativeDateModule
    ),

    // DatePipe disponível globalmente
    DatePipe,

    // Configuração de datas
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    { provide: DateAdapter, useClass: MomentDateAdapter },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { strict: true } }
  ]
};
