import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Cars } from './cars/cars';
import { CarDetails } from './car-details/car-details';
import { About } from './about/about';
import { Booking } from './booking/booking';

import { authGuard } from './auth-guard';
import { canDeactivateGuard } from './can-deactivate-guard';

export const routes: Routes = [

  // HOME
  {
    path: '',
    component: Home,
    title: 'Home | Salianji Rent Car'
  },

  // ADMIN
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin').then(m => m.Admin)
  },

  // LISTA E MAKINAVE
  {
    path: 'cars',
    component: Cars,
    title: 'Cars | Salianji Rent Car',
    data: {
      title: 'Lista e makinave',
      description: 'Makina me qera ne Shqiperi'
    }
  },

  // DETAJET E MAKINËS
  {
    path: 'cars/:id',
    component: CarDetails,
    title: 'Car Details | Salianji Rent Car'
  },

  // ABOUT
  {
    path: 'about',
    component: About,
    title: 'About | Salianji Rent Car'
  },

  // BOOKING
  {
    path: 'booking',
    component: Booking,
    canDeactivate: [canDeactivateGuard],
    title: 'Booking | Salianji Rent Car'
  }

];