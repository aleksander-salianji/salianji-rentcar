import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import { BookingService } from '../../core/booking.service';
import { addDays, daysBetween, toISODate, todayISO } from '../../core/date.utils';
import { errorMessage } from '../../core/http-error';
import { FleetState, FleetStatus } from '../../core/models';
import { LabelPipe } from '../../shared/label.pipe';

type FleetFilter = FleetState | 'ALL';

// Gjendja e flotës: cila makinë është e lirë, cila e zënë dhe nga kush
@Component({
  selector: 'app-admin-fleet',
  imports: [DatePipe, DecimalPipe, LabelPipe],
  templateUrl: './admin-fleet.html',
  styleUrl: './admin-fleet.css'
})
export class AdminFleet {

  private bookingService = inject(BookingService);

  readonly today = todayISO();

  date = signal(this.today);
  fleet = signal<FleetStatus[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  filter = signal<FleetFilter>('ALL');

  counts = computed(() => {
    const list = this.fleet();
    return {
      ALL: list.length,
      FREE: list.filter(f => f.state === 'FREE').length,
      OCCUPIED: list.filter(f => f.state === 'OCCUPIED').length,
      INACTIVE: list.filter(f => f.state === 'INACTIVE').length
    };
  });

  filtered = computed(() => {
    const f = this.filter();
    // të zënat së pari, pastaj të lirat, pastaj joaktivet
    const order: Record<FleetState, number> = { OCCUPIED: 0, FREE: 1, INACTIVE: 2 };
    return this.fleet()
      .filter(x => f === 'ALL' || x.state === f)
      .sort((a, b) => order[a.state] - order[b.state] || a.car.brand.localeCompare(b.car.brand));
  });

  readonly filters: { key: FleetFilter; label: string }[] = [
    { key: 'ALL', label: 'Të gjitha' },
    { key: 'FREE', label: 'Të lira' },
    { key: 'OCCUPIED', label: 'Të zëna' },
    { key: 'INACTIVE', label: 'Joaktive' }
  ];

  isToday = computed(() => this.date() === this.today);

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.bookingService.fleet(this.date()).subscribe({
      next: list => {
        this.fleet.set(list);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }

  setDate(value: string) {
    if (value && value !== this.date()) {
      this.date.set(value);
      this.load();
    }
  }

  shiftDate(days: number) {
    this.setDate(toISODate(addDays(new Date(this.date() + 'T00:00:00'), days)));
  }

  value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  // Sa ditë mbeten deri në kthim / deri në marrjen e radhës
  daysUntil(isoDate: string): number {
    return daysBetween(this.date(), isoDate);
  }
}
