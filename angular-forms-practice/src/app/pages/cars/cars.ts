import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';

import { CarService } from '../../core/car.service';
import { CompanyService } from '../../core/company.service';
import { addDays, daysBetween, toISODate, todayISO } from '../../core/date.utils';
import { errorMessage } from '../../core/http-error';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CITIES,
  RENTAL_RULES,
  TRANSMISSIONS,
  TRANSMISSION_LABELS
} from '../../core/labels';
import { Car, CarCategory, Company, Transmission } from '../../core/models';
import { CarCard } from '../../shared/car-card';
import { LabelPipe } from '../../shared/label.pipe';
import { TPipe } from '../../shared/t.pipe';

type SortOption = 'price-asc' | 'price-desc' | 'newest';

// Kërkimi si në Booking: qyteti + datat + kompania vijnë nga URL-ja
// p.sh. /makinat?qyteti=Tiranë&nga=2026-11-10&deri=2026-11-14&kompania=2
@Component({
  selector: 'app-cars',
  imports: [CarCard, TPipe, LabelPipe],
  templateUrl: './cars.html',
  styleUrl: './cars.css'
})
export class CarsPage {

  private carService = inject(CarService);
  private companyService = inject(CompanyService);
  private router = inject(Router);

  // query params
  readonly qyteti = input<string>();
  readonly nga = input<string>();
  readonly deri = input<string>();
  readonly kompania = input<string>();
  readonly marrja = input<string>();   // vendi i marrjes (nga kryefaqja)
  readonly kthimi = input<string>();   // vendi i kthimit
  readonly kategoria = input<string>();

  readonly cities = CITIES;
  readonly categories = CATEGORIES;
  readonly categoryLabels = CATEGORY_LABELS;
  readonly transmissions = TRANSMISSIONS;
  readonly transmissionLabels = TRANSMISSION_LABELS;
  readonly today = todayISO();

  companies = signal<Company[]>([]);
  cars = signal<Car[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // filtrat lokalë (pa kërkesë në server)
  search = signal('');
  category = signal<CarCategory | ''>('');
  transmission = signal<Transmission | ''>('');
  sort = signal<SortOption>('price-asc');

  // filtrat e kërkimit (nga URL-ja)
  city = computed(() => this.qyteti() ?? '');
  from = computed(() => this.nga() ?? '');
  to = computed(() => this.deri() ?? '');
  companyId = computed(() => Number(this.kompania()) || 0);

  days = computed(() => daysBetween(this.from(), this.to()));
  datesValid = computed(() => !!this.from() && !!this.to() && this.days() >= RENTAL_RULES.minDays);

  // datat që i kalojnë rezervimit
  // datat + vendet kalojnë te faqja e rezervimit
  bookingDates = computed(() => ({
    ...(this.datesValid() ? { nga: this.from(), deri: this.to() } : {}),
    ...(this.marrja() ? { marrja: this.marrja() } : {}),
    ...(this.kthimi() ? { kthimi: this.kthimi() } : {})
  }));

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.category();
    const transmission = this.transmission();

    const list = this.cars().filter(car =>
      (!category || car.category === category) &&
      (!transmission || car.transmission === transmission) &&
      (!term || `${car.brand} ${car.model} ${car.companyName ?? ''}`.toLowerCase().includes(term))
    );

    switch (this.sort()) {
      case 'price-desc': return list.sort((a, b) => b.pricePerDay - a.pricePerDay);
      case 'newest': return list.sort((a, b) => b.year - a.year);
      default: return list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    }
  });

  activeCompany = computed(() => this.companies().find(c => c.id === this.companyId()) ?? null);

  constructor() {
    this.companyService.list().subscribe({ next: list => this.companies.set(list) });

    // Sa herë ndryshon URL-ja, kërko përsëri në server
    effect(() => {
      const search = {
        city: this.city() || undefined,
        from: this.datesValid() ? this.from() : undefined,
        to: this.datesValid() ? this.to() : undefined,
        companyId: this.companyId() || undefined
      };
      const cat = this.kategoria();
      untracked(() => {
        if (CATEGORIES.includes(cat as CarCategory)) {
          this.category.set(cat as CarCategory);
        }
        this.load(search);
      });
    });
  }

  private load(search: { city?: string; from?: string; to?: string; companyId?: number }) {
    this.loading.set(true);
    this.error.set(null);
    this.carService.list(search).subscribe({
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

  // ---------- NDRYSHIMI I KËRKIMIT (përditëson URL-në) ----------

  updateSearch(changes: Record<string, string | null>) {
    this.router.navigate([], { queryParams: changes, queryParamsHandling: 'merge' });
  }

  setFrom(value: string) {
    // nëse kthimi s'është më i vlefshëm, vendos automatikisht 3 ditë më vonë
    const minReturn = value ? toISODate(addDays(new Date(value + 'T00:00:00'), RENTAL_RULES.minDays)) : null;
    const to = this.to();
    this.updateSearch({ nga: value || null, deri: !to || (minReturn && to < minReturn) ? minReturn : to });
  }

  minReturn(): string {
    const from = this.from() || this.today;
    return toISODate(addDays(new Date(from + 'T00:00:00'), RENTAL_RULES.minDays));
  }

  clearAll() {
    this.search.set('');
    this.category.set('');
    this.transmission.set('');
    this.router.navigate([], { queryParams: {} });
  }

  value(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement).value;
  }

  setCategory(v: string) { this.category.set(v as CarCategory | ''); }
  setTransmission(v: string) { this.transmission.set(v as Transmission | ''); }
  setSort(v: string) { this.sort.set(v as SortOption); }
}
