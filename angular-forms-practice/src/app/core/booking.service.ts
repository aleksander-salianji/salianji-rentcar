import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { API_URL } from './config';
import {
  AdminStats,
  Booking,
  BookingLookup,
  BookingRequest,
  BookingStatus,
  FleetStatus,
  RevenuePeriod,
  RevenueReport
} from './models';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private http = inject(HttpClient);
  private auth = inject(AuthService);

  // ---------- KLIENTI (pa llogari) ----------

  create(request: BookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${API_URL}/bookings`, request);
  }

  // Gjen rezervimin me kodin + telefonin
  lookup(request: BookingLookup): Observable<Booking> {
    return this.http.post<Booking>(`${API_URL}/bookings/lookup`, request);
  }

  cancel(request: BookingLookup): Observable<Booking> {
    return this.http.post<Booking>(`${API_URL}/bookings/cancel`, request);
  }


  // ---------- PANELI (admin ose biznes) ----------
  // Të njëjtat faqe përdoren nga të dy: admini sheh gjithçka, biznesi vetëm të vetat.

  private get panel(): string {
    return this.auth.isCompany() ? `${API_URL}/company` : `${API_URL}/admin`;
  }

  adminList(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.panel}/bookings`);
  }

  updateStatus(id: number, status: BookingStatus): Observable<Booking> {
    return this.http.patch<Booking>(`${this.panel}/bookings/${id}/status`, { status });
  }

  stats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.panel}/stats`);
  }

  // Xhiro e grupuar sipas ditës, javës ose muajit
  revenue(period: RevenuePeriod): Observable<RevenueReport> {
    return this.http.get<RevenueReport>(`${this.panel}/revenue`, { params: { period } });
  }

  // Cila makinë është e lirë / e zënë në një datë (pa datë = sot)
  fleet(date?: string): Observable<FleetStatus[]> {
    const params: Record<string, string> = date ? { date } : {};
    return this.http.get<FleetStatus[]>(`${this.panel}/fleet`, { params });
  }
}
