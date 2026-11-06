import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

// Vetëm për përdorues të loguar
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/hyr'], { queryParams: { kthehu: state.url } });
};

// Vetëm për administratorë
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }
  return auth.isLoggedIn()
    ? router.createUrlTree(['/'])
    : router.createUrlTree(['/hyr'], { queryParams: { kthehu: state.url } });
};

// Faqet Hyr / Regjistrohu: nëse je i loguar, të kthen në kryefaqe
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() ? router.createUrlTree(['/']) : true;
};
