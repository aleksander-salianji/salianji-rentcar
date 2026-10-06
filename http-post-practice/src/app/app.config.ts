import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import {
  provideRouter,
  withComponentInputBinding
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { routes } from './app.routes';

import { loggingInterceptor } from './interceptors/logging-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [

    // Global error listeners
    provideBrowserGlobalErrorListeners(),

    // Angular Router
    provideRouter(
      routes,
      withComponentInputBinding()
    ),

    // HTTP Client + Interceptor
    provideHttpClient(
      withInterceptors([
        loggingInterceptor
      ])
    )

  ]
};