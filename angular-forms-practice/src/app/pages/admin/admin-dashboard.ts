import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { BookingService } from '../../core/booking.service';
import { errorMessage } from '../../core/http-error';
import { AdminStats, Booking } from '../../core/models';
import { LabelPipe } from '../../shared/label.pipe';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, LabelPipe],
  template: `
    <div class="page-head">
      <div>
        <h1>Përmbledhja</h1>
        <p>Gjendja e biznesit me një shikim.</p>
      </div>
    </div>

    @if (loading()) {
      <div class="loading"><span class="spinner"></span> Duke ngarkuar...</div>
    } @else if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    } @else {
    @if (stats(); as s) {

      <div class="stats">
        <div class="stat card">
          <span class="muted small">Të ardhurat</span>
          <strong>{{ s.totalRevenue | number:'1.0-2' }} €</strong>
          <span class="muted small">nga rezervimet e konfirmuara</span>
        </div>
        <div class="stat card" [class.attention]="s.pendingBookings > 0">
          <span class="muted small">Në pritje</span>
          <strong>{{ s.pendingBookings }}</strong>
          <a routerLink="/admin/rezervimet" class="small">Shqyrto →</a>
        </div>
        <div class="stat card">
          <span class="muted small">Rezervime aktive</span>
          <strong>{{ s.activeBookings }}</strong>
          <span class="muted small">nga {{ s.totalBookings }} gjithsej</span>
        </div>
        <div class="stat card">
          <span class="muted small">Makina aktive</span>
          <strong>{{ s.activeCars }}</strong>
          <span class="muted small">nga {{ s.totalCars }} gjithsej</span>
        </div>
        <div class="stat card">
          <span class="muted small">Klientë</span>
          <strong>{{ s.totalCustomers }}</strong>
          <span class="muted small">të regjistruar</span>
        </div>
      </div>

      <div class="section-head">
        <h2>Rezervimet e fundit</h2>
        <a routerLink="/admin/rezervimet">Të gjitha →</a>
      </div>

      @if (latest().length) {
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Kodi</th>
                <th>Klienti</th>
                <th>Makina</th>
                <th>Datat</th>
                <th class="text-right">Totali</th>
                <th>Statusi</th>
              </tr>
            </thead>
            <tbody>
              @for (b of latest(); track b.id) {
                <tr>
                  <td class="nowrap"><strong>{{ b.code }}</strong></td>
                  <td>{{ b.customer.firstName }} {{ b.customer.lastName }}</td>
                  <td>{{ b.car.brand }} {{ b.car.model }}</td>
                  <td class="nowrap">{{ b.pickupDate | date:'dd/MM' }} – {{ b.returnDate | date:'dd/MM/yyyy' }}</td>
                  <td class="text-right nowrap">{{ b.totalPrice | number:'1.0-2' }} €</td>
                  <td><span class="badge badge-{{ b.status }}">{{ b.status | label:'status' }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else {
        <p class="empty">Ende nuk ka rezervime.</p>
      }
    }
    }
  `,
  styles: `
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 14px;
      margin-bottom: 32px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 18px;
    }
    .stat strong {
      color: var(--navy);
      font-size: 1.7rem;
    }
    .stat.attention { box-shadow: inset 4px 0 0 var(--accent), var(--shadow); }
    .section-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .section-head h2 { margin: 0; font-size: 1.2rem; }
  `
})
export class AdminDashboard {

  private bookingService = inject(BookingService);

  stats = signal<AdminStats | null>(null);
  latest = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    forkJoin({
      stats: this.bookingService.stats(),
      bookings: this.bookingService.adminList()
    }).subscribe({
      next: ({ stats, bookings }) => {
        this.stats.set(stats);
        this.latest.set(bookings.slice(0, 5));
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }
}
