import { ResolveFn } from '@angular/router';

export const carResolver: ResolveFn<any> = (route) => {

  const id = route.paramMap.get('id');

  return {
    id: id,
    brand: 'BMW',
    model: 'X5',
    price: 80
  };
};