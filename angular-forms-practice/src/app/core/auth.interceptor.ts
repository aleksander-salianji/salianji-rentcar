import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { API_URL } from './config';

// Shton token-in JWT në çdo kërkesë drejt API-së.
// Nëse serveri kthen 401 (token i skaduar), e nxjerr përdoruesin nga llogaria.
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token;
  const isApiCall = req.url.startsWith(API_URL);

  const request = token && isApiCall
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err: unknown) => {
      const isLoginCall = req.url.endsWith('/auth/login');

      if (err instanceof HttpErrorResponse && err.status === 401 && token && !isLoginCall) {
        auth.logout(false);
        router.navigate(['/hyr'], { queryParams: { skaduar: 1 } });
      }

      return throwError(() => err);
    })
  );
};
