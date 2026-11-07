import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CarService } from '../../core/car.service';
import { CompanyService } from '../../core/company.service';
import { addDays, toISODate, todayISO } from '../../core/date.utils';
import { errorMessage } from '../../core/http-error';
import { CATEGORIES, CATEGORY_LABELS, LOCATIONS, RENTAL_RULES } from '../../core/labels';
import { Car, CarCategory, Company } from '../../core/models';
import { CarCard } from '../../shared/car-card';
import { I18nService } from '../../core/i18n.service';
import { LabelPipe } from '../../shared/label.pipe';
import { TPipe } from '../../shared/t.pipe';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CarCard, TPipe, LabelPipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomePage {

  private carService = inject(CarService);
  private companyService = inject(CompanyService);
  private router = inject(Router);
  readonly i18n = inject(I18nService);

  readonly locations = LOCATIONS;
  readonly today = todayISO();

  // kërkimi (si në Booking)
  pickup = signal('');    // vendi i marrjes
  dropoff = signal('');   // vendi i kthimit (bosh = i njëjti)
  from = signal(toISODate(addDays(new Date(), 1)));
  to = signal(toISODate(addDays(new Date(), 1 + RENTAL_RULES.minDays)));

  companies = signal<Company[]>([]);

  readonly categories = CATEGORIES;
  readonly categoryLabels = CATEGORY_LABELS;

  cars = signal<Car[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  category = signal<CarCategory | ''>('');

  // Të gjitha makinat, nga më e lira te më e shtrenjta
  shown = computed(() => {
    const c = this.category();
    return this.cars()
      .filter(car => !c || car.category === c)
      .sort((a, b) => a.pricePerDay - b.pricePerDay);
  });

  count(c: CarCategory | ''): number {
    return c ? this.cars().filter(car => car.category === c).length : this.cars().length;
  }

  minReturn(): string {
    return toISODate(addDays(new Date(this.from() + 'T00:00:00'), RENTAL_RULES.minDays));
  }

  setFrom(value: string) {
    this.from.set(value);
    if (this.to() < this.minReturn()) {
      this.to.set(this.minReturn());
    }
  }

  searchCars() {
    this.router.navigate(['/makinat'], {
      queryParams: {
        marrja: this.pickup() || null,
        kthimi: this.dropoff() || this.pickup() || null,
        nga: this.from(),
        deri: this.to()
      }
    });
  }

  value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  constructor() {
    this.companyService.list().subscribe({ next: list => this.companies.set(list) });

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
