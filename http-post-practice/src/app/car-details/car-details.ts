import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Car } from '../car.model';
import { CarService } from '../car-service';

@Component({
  selector: 'app-car-details',
  imports: [RouterLink],
  templateUrl: './car-details.html',
  styleUrl: './car-details.css'
})
export class CarDetails {

  private route = inject(ActivatedRoute);
  private carService = inject(CarService);

  car: Car | undefined;

  ngOnInit(): void {

    this.route.paramMap.subscribe((params) => {

      const id = Number(params.get('id'));

      this.car = this.carService.getCarById(id);

      console.log('Makina e zgjedhur:', this.car);

    });

  }

}