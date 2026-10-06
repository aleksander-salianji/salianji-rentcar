import { Routes } from '@angular/router';

import { carResolver } from './car-resolver';
import { authGuard } from './auth-guard';
import { CarInfo } from './car-info';

export const routes: Routes = [

  // =========================
  // CARS
  // =========================

  {
    path: '',

    loadComponent: () =>
      import('./cars/cars').then(m => m.Cars),

    providers: [CarInfo],

    canActivate: [authGuard],

    title: 'Cars | Salianji Rent Car',

    data: {
      title: 'Lista e makinave',
      description: 'Makina me qera ne Shqiperi'
    }
  },

  // =========================
  // CAR DETAILS
  // =========================

  {
    path: ':id',

    loadComponent: () =>
      import('./cars/cars').then(m => m.Cars),

    title: 'Car Details | Salianji Rent Car',

    resolve: {
      car: carResolver
    },

    runGuardsAndResolvers: 'paramsChange'
  }
];