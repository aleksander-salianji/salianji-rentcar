import { Routes } from '@angular/router';

import { adminGuard, authGuard, guestGuard } from './core/guards';

const SITE = 'Salianji Rent Car';

export const routes: Routes = [

  // ---------- FAQET PUBLIKE ----------
  {
    path: '',
    title: `${SITE} | Qira makinash në Shqipëri`,
    loadComponent: () => import('./pages/home/home').then(m => m.HomePage)
  },
  {
    path: 'makinat',
    title: `Makinat | ${SITE}`,
    loadComponent: () => import('./pages/cars/cars').then(m => m.CarsPage)
  },

  // ---------- LLOGARIA ----------
  {
    path: 'hyr',
    title: `Hyr | ${SITE}`,
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login').then(m => m.LoginPage)
  },
  {
    path: 'regjistrohu',
    title: `Regjistrohu | ${SITE}`,
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register').then(m => m.RegisterPage)
  },

  // ---------- KLIENTI (duhet login) ----------
  {
    path: 'rezervo/:carId',
    title: `Rezervo | ${SITE}`,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/booking/booking').then(m => m.BookingPage)
  },
  {
    path: 'rezervimet',
    title: `Rezervimet e mia | ${SITE}`,
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-bookings/my-bookings').then(m => m.MyBookingsPage)
  },

  // ---------- ADMIN ----------
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        title: `Paneli | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'makinat',
        title: `Menaxho makinat | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-cars').then(m => m.AdminCars)
      },
      {
        path: 'rezervimet',
        title: `Menaxho rezervimet | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-bookings').then(m => m.AdminBookings)
      }
    ]
  },

  // ---------- 404 ----------
  {
    path: '**',
    title: `Faqja nuk u gjet | ${SITE}`,
    loadComponent: () => import('./pages/not-found').then(m => m.NotFoundPage)
  }
];
