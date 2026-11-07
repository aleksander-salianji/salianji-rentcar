import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CarService } from '../../core/car.service';
import { CompanyService } from '../../core/company.service';
import { addDays, daysBetween, toISODate, todayISO } from '../../core/date.utils';
import { errorMessage } from '../../core/http-error';
import { translate } from '../../core/i18n.service';
import { CATEGORIES, CATEGORY_LABELS, RENTAL_RULES } from '../../core/labels';
import { Car, CarCategory, Company } from '../../core/models';
import { CarCard } from '../../shared/car-card';
import { LabelPipe } from '../../shared/label.pipe';
import { TxPipe } from '../../shared/tx.pipe';
import { TPipe } from '../../shared/t.pipe';
import { PlacePipe } from '../../shared/place.pipe';

// Faqja e një kompanie partnere: /kompania/:id
@Component({
  selector: 'app-company',
  imports: [RouterLink, CarCard, TPipe, LabelPipe, PlacePipe, TxPipe],
  templateUrl: './company.html',
  styleUrl: './company.css'
})
export class CompanyPage implements OnInit {

  private companyService = inject(CompanyService);
  private carService = inject(CarService);

  readonly id = input.required<string>();

  readonly categories = CATEGORIES;
  readonly categoryLabels = CATEGORY_LABELS;
  readonly today = todayISO();

  company = signal<Company | null>(null);
  cars = signal<Car[]>([]);
  loading = signal(true);
  carsLoading = signal(true);
  error = signal<string | null>(null);

  category = signal<CarCategory | ''>('');
  from = signal('');
  to = signal('');

  days = computed(() => daysBetween(this.from(), this.to()));
  datesValid = computed(() => !!this.from() && !!this.to() && this.days() >= RENTAL_RULES.minDays);
  bookingDates = computed(() => (this.datesValid() ? { nga: this.from(), deri: this.to() } : {}));

  initials = computed(() =>
    (this.company()?.name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join('')
  );

  shown = computed(() => {
    const c = this.category();
    return this.cars().filter(car => !c || car.category === c);
  });

  count(c: CarCategory | ''): number {
    return c ? this.cars().filter(car => car.category === c).length : this.cars().length;
  }

  ngOnInit() {
    const id = Number(this.id());
    this.companyService.get(id).subscribe({
      next: c => {
        this.company.set(c);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err, translate('errors.companyNotFound')));
        this.loading.set(false);
      }
    });
    this.loadCars();
  }

  minReturn(): string {
    const from = this.from() || this.today;
    return toISODate(addDays(new Date(from + 'T00:00:00'), RENTAL_RULES.minDays));
  }

  setFrom(value: string) {
    this.from.set(value);
    if (value && (!this.to() || this.to() < this.minReturn())) {
      this.to.set(this.minReturn());
    }
    this.loadCars();
  }

  setTo(value: string) {
    this.to.set(value);
    this.loadCars();
  }

  clearDates() {
    this.from.set('');
    this.to.set('');
    this.loadCars();
  }

  value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private loadCars() {
    const valid = this.datesValid();
    this.carsLoading.set(true);
    this.carService.list({
      companyId: Number(this.id()),
      from: valid ? this.from() : undefined,
      to: valid ? this.to() : undefined
    }).subscribe({
      next: cars => {
        this.cars.set(cars);
        this.carsLoading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.carsLoading.set(false);
      }
    });
  }
}
