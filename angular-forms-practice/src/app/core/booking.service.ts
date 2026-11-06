import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from './config';
import { AdminStats, Booking, BookingRequest, BookingStatus } from './models';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private http = inject(HttpClient);

  // ---------- KLIENTI ----------

  create(request: BookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${API_URL}/bookings`, request);
  }

  myBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${API_URL}/bookings/my`);
  }

  cancel(id: number): Observable<Booking> {
    return this.http.patch<Booking>(`${API_URL}/bookings/${id}/cancel`, {});
  }


  // ---------- ADMIN ----------

  adminList(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${API_URL}/admin/bookings`);
  }

  updateStatus(id: number, status: BookingStatus): Observable<Booking> {
    return this.http.patch<Booking>(`${API_URL}/admin/bookings/${id}/status`, { status });
  }

  stats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${API_URL}/admin/stats`);
  }
}
