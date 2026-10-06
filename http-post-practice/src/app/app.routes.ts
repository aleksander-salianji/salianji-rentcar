import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Cars } from './cars/cars';
import { About } from './about/about';
import { Booking } from './booking/booking';

import { carResolver } from './car-resolver';
import { authGuard } from './auth-guard';
import { canDeactivateGuard } from './can-deactivate-guard';

export const routes: Routes = [

  {
    path: '',
    component: Home,
    title: 'Home | Salianji Rent Car'
  },

  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin').then(m => m.Admin)
  },

  {
    path: 'cars',
    component: Cars,
    canActivate: [authGuard],
    title: 'Cars | Salianji Rent Car',
    data: {
      title: 'Lista e makinave',
      description: 'Makina me qera ne Shqiperi'
    }
  },

  {
    path: 'cars/:id',
    component: Cars,
    title: 'Car Details | Salianji Rent Car',
    resolve: {
      car: carResolver
    },
    runGuardsAndResolvers: 'paramsChange'
  },

  {
    path: 'about',
    component: About,
    title: 'About | Salianji Rent Car'
  },

  {
    path: 'booking',
    component: Booking,
    canDeactivate: [canDeactivateGuard],
    title: 'Booking | Salianji Rent Car'
  }

];