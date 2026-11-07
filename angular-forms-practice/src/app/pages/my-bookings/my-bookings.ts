import { Component, inject, input, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { BookingService } from '../../core/booking.service';
import { todayISO } from '../../core/date.utils';
import { errorMessage } from '../../core/http-error';
import { EXTRAS_OPTIONS, RENTAL_RULES } from '../../core/labels';
import { Booking } from '../../core/models';
import { LabelPipe } from '../../shared/label.pipe';
import { TPipe } from '../../shared/t.pipe';
import { I18nService } from '../../core/i18n.service';

// "Rezervimi im": klienti nuk ka llogari, e gjen rezervimin me kodin + telefonin
@Component({
  selector: 'app-my-bookings',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, DecimalPipe, LabelPipe, TPipe],
  templateUrl: './my-bookings.html',
  styleUrl: './my-bookings.css',
})
export class MyBookingsPage implements OnInit {
  private bookingService = inject(BookingService);
  private i18n = inject(I18nService);

  // ?sukses=BCA-2026-0001 pas një rezervimi të ri
  readonly sukses = input<string>();

  readonly cancelWindowHours = RENTAL_RULES.cancelWindowHours;

  booking = signal<Booking | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  cancelling = signal(false);

  form = new FormGroup({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(7)],
    }),
  });

  // Rezervimi i sapokrijuar vjen nga faqja e rezervimit (router state → history.state)
  private readonly fromBooking = (globalThis.history?.state as { booking?: Booking } | null)
    ?.booking;

  ngOnInit() {
    const b = this.fromBooking;
    if (b) {
      this.booking.set(b);
      this.form.setValue({ code: b.code, phone: b.phoneNumbers[0] ?? '' });
    } else if (this.sukses()) {
      this.form.patchValue({ code: this.sukses() });
    }
  }

  search() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.booking.set(null);

    this.bookingService.lookup(this.request()).subscribe({
      next: (b) => {
        this.booking.set(b);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, this.i18n.t('lookup.notFound')));
        this.loading.set(false);
      },
    });
  }

  isInvalid(name: 'code' | 'phone'): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  isActive(b: Booking): boolean {
    return b.status === 'PENDING' || b.status === 'CONFIRMED';
  }

  // Afati i anulimit: 24 orë nga krijimi i rezervimit
  cancelDeadline(b: Booking): Date {
    return new Date(Date.parse(b.createdAt) + RENTAL_RULES.cancelWindowHours * 3_600_000);
  }

  canCancel(b: Booking): boolean {
    return (
      this.isActive(b) && b.pickupDate > todayISO() && Date.now() < this.cancelDeadline(b).getTime()
    );
  }

  extrasText(b: Booking): string {
    return EXTRAS_OPTIONS.filter((opt) => b.extras[opt.key])
      .map((opt) => this.i18n.t(`extras.${opt.key}.label`))
      .join(', ');
  }

  cancel(b: Booking) {
    if (!confirm(this.i18n.t('lookup.confirmCancel', { code: b.code }))) {
      return;
    }
    this.error.set(null);
    this.cancelling.set(true);

    this.bookingService.cancel(this.request()).subscribe({
      next: (updated) => {
        this.booking.set(updated);
        this.cancelling.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.cancelling.set(false);
      },
    });
  }

  private request() {
    const v = this.form.getRawValue();
    return { code: v.code.trim().toUpperCase(), phone: v.phone.trim() };
  }
}
