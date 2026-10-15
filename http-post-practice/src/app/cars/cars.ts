
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Car } from '../car.model';
import { CarService } from '../car-service';

@Component({
  selector: 'app-cars',
  imports: [RouterLink],
  templateUrl: './cars.html',
  styleUrl: './cars.css'
})
export class Cars implements OnInit {

  private carService = inject(CarService);

  cars: Car[] = [];

  loading = true;

  errorMessage = '';

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.loading = true;
    this.errorMessage = '';

    try {
      this.cars = this.carService.getCars();
    } catch (error) {
      console.error('Gabim gjatë ngarkimit të makinave:', error);

      this.errorMessage =
        'Ndodhi një gabim gjatë ngarkimit të makinave.';
    } finally {
      this.loading = false;
    }

    console.log('Makina e ngarkuara:', this.cars);
  }

}
