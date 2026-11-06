import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { CarService } from '../../core/car.service';
import { errorMessage } from '../../core/http-error';
import { CATEGORIES, CATEGORY_LABELS, LOCATIONS, RENTAL_RULES } from '../../core/labels';
import { Car, CarCategory } from '../../core/models';
import { CarCard } from '../../shared/car-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CarCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage {

  readonly auth = inject(AuthService);
  private carService = inject(CarService);

  readonly locations = LOCATIONS;
  readonly discountPercent = RENTAL_RULES.longRentalDiscount * 100;
  readonly discountDays = RENTAL_RULES.longRentalDays;

  cars = signal<Car[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // 3 makinat më të lira, një nga secila kategori e ndryshme kur është e mundur
  featured = computed(() => {
    const sorted = [...this.cars()].sort((a, b) => a.pricePerDay - b.pricePerDay);
    const picked: Car[] = [];
    const seen = new Set<CarCategory>();

    for (const car of sorted) {
      if (!seen.has(car.category)) {
        picked.push(car);
        seen.add(car.category);
      }
      if (picked.length === 3) {
        break;
      }
    }
    return picked;
  });

  // Çmimi më i ulët për çdo kategori
  categories = computed(() =>
    CATEGORIES.map(category => {
      const prices = this.cars()
        .filter(c => c.category === category)
        .map(c => c.pricePerDay);
      return {
        key: category,
        label: CATEGORY_LABELS[category],
        count: prices.length,
        fromPrice: prices.length ? Math.min(...prices) : null
      };
    })
  );

  constructor() {
    this.carService.list().subscribe({
      next: cars => {
        this.cars.set(cars);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }
}
