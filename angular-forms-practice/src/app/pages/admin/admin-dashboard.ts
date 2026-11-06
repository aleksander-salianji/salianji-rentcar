import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { BookingService } from '../../core/booking.service';
import { errorMessage } from '../../core/http-error';
import { AdminStats, Booking, RevenuePeriod, RevenueReport } from '../../core/models';
import { LabelPipe } from '../../shared/label.pipe';
import { percentChange, RevenueChart } from '../../shared/revenue-chart';

interface KpiCard {
  title: string;
  value: number;
  previous: number;
  compareLabel: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, DatePipe, DecimalPipe, LabelPipe, RevenueChart],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {

  private bookingService = inject(BookingService);
  readonly auth = inject(AuthService);

  // '/admin' ose '/paneli' — e njëjta faqe për adminin dhe për bizneset
  readonly base = this.auth.panelUrl();

  stats = signal<AdminStats | null>(null);
  latest = signal<Booking[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  // ---------- GRAFIKU ----------
  readonly periods: { key: RevenuePeriod; label: string; hint: string }[] = [
    { key: 'DAY', label: 'Ditore', hint: '30 ditët e fundit' },
    { key: 'WEEK', label: 'Javore', hint: '12 javët e fundit' },
    { key: 'MONTH', label: 'Mujore', hint: '12 muajt e fundit' }
  ];
  period = signal<RevenuePeriod>('DAY');
  report = signal<RevenueReport | null>(null);
  reportLoading = signal(false);

  periodHint = computed(() => this.periods.find(p => p.key === this.period())?.hint ?? '');

  // Periudha më e mirë dhe krahasimi i periudhës së fundit me të parafundit
  reportSummary = computed(() => {
    const r = this.report();
    if (!r || !r.points.length) {
      return null;
    }
    const best = r.points.reduce((a, b) => (b.revenue > a.revenue ? b : a));
    const last = r.points[r.points.length - 1];
    const prev = r.points.length > 1 ? r.points[r.points.length - 2] : null;
    return {
      best: best.revenue > 0 ? best : null,
      last,
      change: prev ? percentChange(last.revenue, prev.revenue) : 0,
      average: r.total / r.points.length
    };
  });

  // ---------- KARTAT ME ▲▼ ----------
  kpis = computed<KpiCard[]>(() => {
    const s = this.stats();
    if (!s) {
      return [];
    }
    return [
      { title: 'Sot', value: s.revenueToday, previous: s.revenueYesterday, compareLabel: 'kundrejt dje' },
      { title: 'Kjo javë', value: s.revenueThisWeek, previous: s.revenueLastWeekToDate, compareLabel: 'kundrejt javës së kaluar' },
      { title: 'Ky muaj', value: s.revenueThisMonth, previous: s.revenueLastMonthToDate, compareLabel: 'kundrejt muajit të kaluar' }
    ];
  });

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

    this.loadReport('DAY');
  }

  selectPeriod(p: RevenuePeriod) {
    if (p !== this.period()) {
      this.loadReport(p);
    }
  }

  change(card: KpiCard): number | null {
    return percentChange(card.value, card.previous);
  }

  private loadReport(p: RevenuePeriod) {
    this.period.set(p);
    this.reportLoading.set(true);
    this.bookingService.revenue(p).subscribe({
      next: r => {
        this.report.set(r);
        this.reportLoading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.reportLoading.set(false);
      }
    });
  }
}
