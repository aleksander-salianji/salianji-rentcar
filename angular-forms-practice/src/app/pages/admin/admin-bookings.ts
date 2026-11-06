import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import { AuthService } from '../../core/auth.service';
import { BookingService } from '../../core/booking.service';
import { errorMessage } from '../../core/http-error';
import { EXTRAS_OPTIONS, STATUSES, STATUS_LABELS } from '../../core/labels';
import { Booking, BookingStatus } from '../../core/models';
import { LabelPipe } from '../../shared/label.pipe';

@Component({
  selector: 'app-admin-bookings',
  imports: [DatePipe, DecimalPipe, LabelPipe],
  templateUrl: './admin-bookings.html',
  styles: `
    .filters {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
      padding: 14px;
    }
    .status-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }
    .status-tabs button.active { background: var(--navy); color: #fff; border-color: var(--navy); }
    .count { opacity: .7; margin-left: 4px; }
    .details td { background: #fafbfd; font-size: .88rem; }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .details-grid p { margin: 0; }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
    .company-name { color: var(--accent); font-weight: 600; }
    @media (max-width: 760px) {
      .filters, .details-grid { grid-template-columns: 1fr; }
    }
  `
})
export class AdminBookings {

  private bookingService = inject(BookingService);
  readonly auth = inject(AuthService);

  readonly statuses = STATUSES;
  readonly statusLabels = STATUS_LABELS;

  bookings = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  updatingId = signal<number | null>(null);
  expandedId = signal<number | null>(null);

  search = signal('');
  companyFilter = signal('');

  companyNames = computed(() =>
    [...new Set(this.bookings().map(b => b.company?.name).filter((n): n is string => !!n))].sort()
  );
  statusFilter = signal<BookingStatus | ''>('');

  counts = computed(() => {
    const result: Record<string, number> = { '': this.bookings().length };
    for (const s of STATUSES) {
      result[s] = this.bookings().filter(b => b.status === s).length;
    }
    return result;
  });

  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const company = this.companyFilter();

    return this.bookings().filter(b =>
      (!status || b.status === status) &&
      (!company || b.company?.name === company) &&
      (!term ||
        b.code.toLowerCase().includes(term) ||
        (b.company?.name ?? '').toLowerCase().includes(term) ||
        `${b.customer.firstName} ${b.customer.lastName}`.toLowerCase().includes(term) ||
        b.customer.email.toLowerCase().includes(term) ||
        `${b.car.brand} ${b.car.model}`.toLowerCase().includes(term))
    );
  });

  constructor() {
    this.bookingService.adminList().subscribe({
      next: list => {
        this.bookings.set(list);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }

  value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  toggleDetails(id: number) {
    this.expandedId.update(current => (current === id ? null : id));
  }

  extrasText(b: Booking): string {
    const list = EXTRAS_OPTIONS.filter(o => b.extras[o.key]).map(o => o.label);
    return list.length ? list.join(', ') : 'Asnjë';
  }

  setStatus(b: Booking, status: BookingStatus) {
    if (b.status === status) {
      return;
    }
    if (status === 'CANCELLED' && !confirm(`Të anulohet rezervimi ${b.code}?`)) {
      return;
    }

    this.updatingId.set(b.id);
    this.error.set(null);

    this.bookingService.updateStatus(b.id, status).subscribe({
      next: updated => {
        this.bookings.update(list => list.map(x => (x.id === updated.id ? updated : x)));
        this.updatingId.set(null);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.updatingId.set(null);
      }
    });
  }
}
