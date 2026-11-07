import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeEl from '@angular/common/locales/el';
import localeTr from '@angular/common/locales/tr';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import localeSq from '@angular/common/locales/sq';
import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling
} from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';
import { I18nService } from './core/i18n.service';
import { ThemeService } from './core/theme.service';

// Datat dhe numrat: shqip si parazgjedhje + gjuhët e tjera (anglishtja është e integruar)
registerLocaleData(localeSq);
registerLocaleData(localeIt);
registerLocaleData(localeDe);
registerLocaleData(localeFr);
registerLocaleData(localeEl);
registerLocaleData(localeTr);

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

    { provide: LOCALE_ID, useValue: 'sq' },

    // ngarko përkthimet dhe temën para se të shfaqet faqja
    provideAppInitializer(() => {
      inject(ThemeService);
      return inject(I18nService).init();
    })
  ]
};
