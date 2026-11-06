import { Component, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BookingService } from '../../core/booking.service';
import { todayISO } from '../../core/date.utils';
import { errorMessage } from '../../core/http-error';
import { EXTRAS_OPTIONS } from '../../core/labels';
import { Booking } from '../../core/models';
import { LabelPipe } from '../../shared/label.pipe';

@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, DatePipe, DecimalPipe, LabelPipe],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css'
})
export class MyBookingsPage {

  private bookingService = inject(BookingService);

  // ?sukses=SRC-2026-0001 pas një rezervimi të ri
  readonly sukses = input<string>();

  bookings = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  actionError = signal<string | null>(null);
  cancellingId = signal<number | null>(null);

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.bookingService.myBookings().subscribe({
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

  canCancel(b: Booking): boolean {
    return (b.status === 'PENDING' || b.status === 'CONFIRMED') && b.pickupDate > todayISO();
  }

  extrasText(b: Booking): string {
    return EXTRAS_OPTIONS
      .filter(opt => b.extras[opt.key])
      .map(opt => opt.label)
      .join(', ');
  }

  cancel(b: Booking) {
    if (!confirm(`Je i sigurt që do të anulosh rezervimin ${b.code}?`)) {
      return;
    }

    this.actionError.set(null);
    this.cancellingId.set(b.id);

    this.bookingService.cancel(b.id).subscribe({
      next: updated => {
        this.bookings.update(list => list.map(x => (x.id === updated.id ? updated : x)));
        this.cancellingId.set(null);
      },
      error: err => {
        this.actionError.set(errorMessage(err));
        this.cancellingId.set(null);
      }
    });
  }
}
