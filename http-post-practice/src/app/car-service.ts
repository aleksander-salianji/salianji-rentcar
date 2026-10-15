import { Injectable } from '@angular/core';
import { Car } from './car.model';

@Injectable({
  providedIn: 'root'
})
export class CarService {

  private cars: Car[] = [

    {
      id: 1,
      brand: 'BMW',
      model: 'X5',
      price: 80,
      category: 'SUV',
      image: 'assets/cars/bmw-x5/images (1).jpg'
    },

    {
      id: 2,
      brand: 'BMW',
      model: 'X3',
      price: 60,
      category: 'SUV',
      image: 'assets/cars/bmw-x3/x3.1.jpg'
    },

    {
      id: 3,
      brand: 'Audi',
      model: 'Q7',
      price: 90,
      category: 'SUV',
      image: 'assets/cars/audi-q7/q7-2.jpg'
    },

    {
      id: 4,
      brand: 'Audi',
      model: 'A6',
      price: 70,
      category: 'Sedan',
      image: 'assets/cars/audi-a6/audi-a6.jpg'
    },

    {
      id: 5,
      brand: 'Mercedes',
      model: 'GLE',
      price: 100,
      category: 'SUV',
      image: 'assets/cars/mercedes-gle/gle-2.jpg'
    }

  ];

  getCars(): Car[] {
    return this.cars;
  }

  getCarById(id: number): Car | undefined {
    return this.cars.find(car => car.id === id);
  }

}