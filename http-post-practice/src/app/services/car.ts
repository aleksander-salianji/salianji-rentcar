import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Car as CarModel } from '../car.model';
import { CarService } from '../car-service';

@Component({
  selector: 'app-car',
  imports: [RouterLink],
  templateUrl: './car.html',
  styleUrl: './car.css'
})
export class Car {

  private route = inject(ActivatedRoute);
  private carService = inject(CarService);

  car: CarModel | undefined;

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    this.car =
      this.carService.getCarById(id);

    console.log('Makina e zgjedhur:', this.car);
  }

}