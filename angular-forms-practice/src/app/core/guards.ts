import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

// Vetëm për administratorin e platformës
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  }
  return auth.isLoggedIn()
    ? router.createUrlTree([auth.panelUrl()])
    : router.createUrlTree(['/hyr'], { queryParams: { kthehu: state.url } });
};

// Vetëm për bizneset partnere (paneli i kompanisë)
export const companyGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isCompany()) {
    return true;
  }
  return auth.isLoggedIn()
    ? router.createUrlTree([auth.panelUrl()])
    : router.createUrlTree(['/hyr'], { queryParams: { kthehu: state.url } });
};

// Faqja Hyr: nëse je i loguar, të çon te paneli yt
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() ? router.createUrlTree([auth.panelUrl()]) : true;
};
