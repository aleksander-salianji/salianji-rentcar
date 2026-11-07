import { Routes } from '@angular/router';

import { adminGuard, companyGuard, guestGuard } from './core/guards';


export const routes: Routes = [

  // ---------- FAQET PUBLIKE ----------
  {
    path: '',
    title: 'title.home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomePage)
  },
  {
    path: 'kompania/:id',
    title: 'title.company',
    loadComponent: () => import('./pages/company/company').then(m => m.CompanyPage)
  },
  {
    path: 'makinat',
    title: 'title.cars',
    loadComponent: () => import('./pages/cars/cars').then(m => m.CarsPage)
  },

  // ---------- KLIENTI (pa llogari) ----------
  {
    path: 'rezervo/:carId',
    title: 'title.book',
    loadComponent: () => import('./pages/booking/booking').then(m => m.BookingPage)
  },
  {
    path: 'rezervimi',
    title: 'title.myBooking',
    loadComponent: () => import('./pages/my-bookings/my-bookings').then(m => m.MyBookingsPage)
  },
  { path: 'rezervimet', redirectTo: 'rezervimi' },
  {
    path: 'blog',
    title: 'title.blog',
    loadComponent: () => import('./pages/blog/blog-list').then(m => m.BlogListPage)
  },
  {
    path: 'blog/:slug',
    title: 'title.blogPost',
    loadComponent: () => import('./pages/blog/blog-post').then(m => m.BlogPostPage)
  },
  {
    path: 'pyetje',
    title: 'title.faq',
    loadComponent: () => import('./pages/info/faq').then(m => m.FaqPage)
  },
  {
    path: 'karriera',
    title: 'title.careers',
    loadComponent: () => import('./pages/info/careers').then(m => m.CareersPage)
  },
  {
    path: 'rreth-nesh',
    title: 'title.about',
    loadComponent: () => import('./pages/info/about').then(m => m.AboutPage)
  },
  {
    path: 'ndihme',
    title: 'title.help',
    loadComponent: () => import('./pages/support/support').then(m => m.SupportPage)
  },

  // ---------- HYRJA: vetëm biznese + admin ----------
  {
    path: 'hyr',
    title: 'title.login',
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
        title: 'title.businessPanel',
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'flota',
        title: 'title.myCars',
        loadComponent: () => import('./pages/admin/admin-fleet').then(m => m.AdminFleet)
      },
      {
        path: 'rezervimet',
        title: 'title.bookings',
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
        title: 'title.adminPanel',
        loadComponent: () => import('./pages/admin/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'kompanite',
        title: 'title.companies',
        loadComponent: () => import('./pages/admin/admin-companies').then(m => m.AdminCompanies)
      },
      {
        path: 'flota',
        title: 'title.fleet',
        loadComponent: () => import('./pages/admin/admin-fleet').then(m => m.AdminFleet)
      },
      {
        path: 'makinat',
        title: 'title.manageCars',
        loadComponent: () => import('./pages/admin/admin-cars').then(m => m.AdminCars)
      },
      {
        path: 'rezervimet',
        title: 'title.manageBookings',
        loadComponent: () => import('./pages/admin/admin-bookings').then(m => m.AdminBookings)
      },
      {
        path: 'blog',
        title: 'title.adminBlog',
        loadComponent: () => import('./pages/admin/admin-blog').then(m => m.AdminBlog)
      },
      {
        path: 'support',
        title: 'title.support',
        loadComponent: () => import('./pages/admin/admin-support').then(m => m.AdminSupport)
      }
    ]
  },

  // ---------- 404 ----------
  {
    path: '**',
    title: 'title.notFound',
    loadComponent: () => import('./pages/not-found').then(m => m.NotFoundPage)
  }
];
