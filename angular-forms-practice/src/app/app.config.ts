import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeSq from '@angular/common/locales/sq';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling
} from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

// Datat dhe numrat formatohen në shqip
registerLocaleData(localeSq);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withComponentInputBinding(),                                // parametrat e URL-së bëhen input()
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }) // çdo faqe hapet nga lart
    ),

    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    { provide: LOCALE_ID, useValue: 'sq' }
  ]
};
