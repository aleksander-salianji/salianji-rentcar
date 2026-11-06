import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from './config';
import { BookedPeriod, Car, CarRequest } from './models';

@Injectable({ providedIn: 'root' })
export class CarService {

  private http = inject(HttpClient);

  // ---------- PUBLIKE ----------

  // Vetëm makinat aktive
  list(): Observable<Car[]> {
    return this.http.get<Car[]>(`${API_URL}/cars`);
  }

  get(id: number): Observable<Car> {
    return this.http.get<Car>(`${API_URL}/cars/${id}`);
  }

  // Periudhat kur makina është e zënë
  bookedPeriods(id: number): Observable<BookedPeriod[]> {
    return this.http.get<BookedPeriod[]>(`${API_URL}/cars/${id}/booked-periods`);
  }


  // ---------- ADMIN ----------

  // Të gjitha makinat, edhe ato joaktive
  adminList(): Observable<Car[]> {
    return this.http.get<Car[]>(`${API_URL}/admin/cars`);
  }

  create(request: CarRequest): Observable<Car> {
    return this.http.post<Car>(`${API_URL}/admin/cars`, request);
  }

  update(id: number, request: CarRequest): Observable<Car> {
    return this.http.put<Car>(`${API_URL}/admin/cars/${id}`, request);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/admin/cars/${id}`);
  }
}
