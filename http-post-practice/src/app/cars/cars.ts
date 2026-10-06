import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { CarInfo } from '../car-info';

@Component({
  selector: 'app-cars',
  imports: [RouterLink],
  templateUrl: './cars.html',
  styleUrl: './cars.css'
})
export class Cars {

  private route = inject(ActivatedRoute);

  private carInfo = inject(CarInfo);

  carInfoMessage = '';

  carId = '';

  brand = '';
  price = '';

  routeTitle = '';
  routeDescription = '';

  resolvedCar: any = null;

  cars = [
    { brand: 'BMW', model: 'X5', price: 80 },
    { brand: 'BMW', model: 'X3', price: 60 },
    { brand: 'Audi', model: 'Q7', price: 90 },
    { brand: 'Audi', model: 'A6', price: 70 },
    { brand: 'Mercedes', model: 'GLE', price: 100 }
  ];

  filteredCars = this.cars;

  ngOnInit() {

    this.carInfoMessage =
      this.carInfo.getMassage();

    this.route.paramMap.subscribe((params) => {
      this.carId = params.get('id') || '';
    });

    this.route.queryParamMap.subscribe((params) => {
      this.brand = params.get('brand') || '';
      this.price = params.get('price') || '';

      this.filterCars();
    });

    this.route.data.subscribe((data) => {
      this.routeTitle = data['title'] || '';
      this.routeDescription = data['description'] || '';

      this.resolvedCar = data['car'] || null;
    });
  }

  filterCars() {

    if (!this.brand) {
      this.filteredCars = this.cars;
      return;
    }

    this.filteredCars = this.cars.filter((car) => {
      return car.brand === this.brand;
    });
  }
}