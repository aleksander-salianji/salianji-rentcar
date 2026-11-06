import { Routes } from '@angular/router';

import { adminGuard, companyGuard, guestGuard } from './core/guards';

const SITE = 'Bookers Car Albania';

export const routes: Routes = [

  // ---------- FAQET PUBLIKE ----------
  {
    path: '',
    title: `${SITE} | Qira makinash në Shqipëri`,
    loadComponent: () => import('./pages/home/home').then(m => m.HomePage)
  },
  {
    path: 'kompania/:id',
    title: `Kompania | ${SITE}`,
    loadComponent: () => import('./pages/company/company').then(m => m.CompanyPage)
  },
  {
    path: 'makinat',
    title: `Makinat | ${SITE}`,
    loadComponent: () => import('./pages/cars/cars').then(m => m.CarsPage)
  },

  // ---------- KLIENTI (pa llogari) ----------
  {
    path: 'rezervo/:carId',
    title: `Rezervo | ${SITE}`,
    loadComponent: () => import('./pages/booking/booking').then(m => m.BookingPage)
  },
  {
    path: 'rezervimi',
    title: `Rezervimi im | ${SITE}`,
    loadComponent: () => import('./pages/my-bookings/my-bookings').then(m => m.MyBookingsPage)
  },
  { path: 'rezervimet', redirectTo: 'rezervimi' },
  {
    path: 'blog',
    title: `Blogu | ${SITE}`,
    loadComponent: () => import('./pages/blog/blog-list').then(m => m.BlogListPage)
  },
  {
    path: 'blog/:slug',
    title: `Blogu | ${SITE}`,
    loadComponent: () => import('./pages/blog/blog-post').then(m => m.BlogPostPage)
  },
  {
    path: 'pyetje',
    title: `Pyetje të shpeshta | ${SITE}`,
    loadComponent: () => import('./pages/info/faq').then(m => m.FaqPage)
  },
  {
    path: 'karriera',
    title: `Karriera | ${SITE}`,
    loadComponent: () => import('./pages/info/careers').then(m => m.CareersPage)
  },
  {
    path: 'rreth-nesh',
    title: `Rreth nesh | ${SITE}`,
    loadComponent: () => import('./pages/info/about').then(m => m.AboutPage)
  },
  {
    path: 'ndihme',
    title: `Ndihmë | ${SITE}`,
    loadComponent: () => import('./pages/support/support').then(m => m.SupportPage)
  },

  // ---------- HYRJA: vetëm biznese + admin ----------
  {
    path: 'hyr',
    title: `Hyr · Biznese | ${SITE}`,
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login').then(m => m.LoginPage)
  },

  // ---------- PANELI I BIZNESIT ----------
  // Përdor të njëjtat faqe si admini; API-ja kthen vetëm të dhënat e kompanisë.
  {
    path: 'paneli',
    canActivate: [companyGuard],
    loadComponent: () => import('./pages/admin/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        title: `Paneli i biznesit | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'flota',
        title: `Makinat e mia | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-fleet').then(m => m.AdminFleet)
      },
      {
        path: 'rezervimet',
        title: `Rezervimet | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-bookings').then(m => m.AdminBookings)
      }
    ]
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
        path: 'kompanite',
        title: `Kompanitë | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-companies').then(m => m.AdminCompanies)
      },
      {
        path: 'flota',
        title: `Gjendja e flotës | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-fleet').then(m => m.AdminFleet)
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
      },
      {
        path: 'blog',
        title: `Blogu | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-blog').then(m => m.AdminBlog)
      },
      {
        path: 'support',
        title: `Support | ${SITE}`,
        loadComponent: () => import('./pages/admin/admin-support').then(m => m.AdminSupport)
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
