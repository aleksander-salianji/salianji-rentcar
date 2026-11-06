import { Component, computed, effect, inject, input, signal } from '@angular/core';

import { CarService } from '../../core/car.service';
import { errorMessage } from '../../core/http-error';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  TRANSMISSIONS,
  TRANSMISSION_LABELS
} from '../../core/labels';
import { Car, CarCategory, Transmission } from '../../core/models';
import { CarCard } from '../../shared/car-card';

type SortOption = 'price-asc' | 'price-desc' | 'newest';

@Component({
  selector: 'app-cars',
  imports: [CarCard],
  templateUrl: './cars.html',
  styles: `
    .filters {
      display: grid;
      grid-template-columns: 2fr repeat(3, 1fr) auto;
      gap: 10px;
      align-items: end;
      margin-bottom: 20px;
      padding: 16px;
    }
    .car-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }
    .result-count { margin-bottom: 12px; }
    @media (max-width: 860px) {
      .filters { grid-template-columns: 1fr 1fr; }
      .filters .search { grid-column: span 2; }
    }
  `
})
export class CarsPage {

  private carService = inject(CarService);

  // Query param ?kategoria=SUV (nga kryefaqja)
  readonly kategoria = input<string>();

  readonly categories = CATEGORIES;
  readonly categoryLabels = CATEGORY_LABELS;
  readonly transmissions = TRANSMISSIONS;
  readonly transmissionLabels = TRANSMISSION_LABELS;

  cars = signal<Car[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // filtrat
  search = signal('');
  category = signal<CarCategory | ''>('');
  transmission = signal<Transmission | ''>('');
  sort = signal<SortOption>('price-asc');

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.category();
    const transmission = this.transmission();

    const list = this.cars().filter(car =>
      (!category || car.category === category) &&
      (!transmission || car.transmission === transmission) &&
      (!term || `${car.brand} ${car.model}`.toLowerCase().includes(term))
    );

    switch (this.sort()) {
      case 'price-asc': return list.sort((a, b) => a.pricePerDay - b.pricePerDay);
      case 'price-desc': return list.sort((a, b) => b.pricePerDay - a.pricePerDay);
      case 'newest': return list.sort((a, b) => b.year - a.year);
    }
  });

  hasFilters = computed(() =>
    !!this.search() || !!this.category() || !!this.transmission()
  );

  constructor() {
    // Kur vjen ?kategoria=... nga URL-ja, vendose si filtër
    effect(() => {
      const value = this.kategoria();
      this.category.set(CATEGORIES.includes(value as CarCategory) ? (value as CarCategory) : '');
    });

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

  // Për <select> dhe <input> pa Reactive Forms
  value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  setCategory(value: string) {
    this.category.set(value as CarCategory | '');
  }

  setTransmission(value: string) {
    this.transmission.set(value as Transmission | '');
  }

  setSort(value: string) {
    this.sort.set(value as SortOption);
  }

  clearFilters() {
    this.search.set('');
    this.category.set('');
    this.transmission.set('');
  }
}
