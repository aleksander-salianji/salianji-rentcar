import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from './config';
import { BookedPeriod, Car, CarRequest, CarSearch } from './models';

@Injectable({ providedIn: 'root' })
export class CarService {

  private http = inject(HttpClient);

  // ---------- PUBLIKE ----------

  // Makinat aktive; filtrat (qyteti, datat, kompania) janë opsionalë
  list(search: CarSearch = {}): Observable<Car[]> {
    const params: Record<string, string> = {};
    if (search.city) { params['city'] = search.city; }
    if (search.from && search.to) { params['from'] = search.from; params['to'] = search.to; }
    if (search.companyId) { params['companyId'] = String(search.companyId); }
    return this.http.get<Car[]>(`${API_URL}/cars`, { params });
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

  // Ngarkon foton e makinës (multipart/form-data, fusha "file")
  uploadImage(id: number, image: Blob, fileName = 'foto.jpg'): Observable<Car> {
    const form = new FormData();
    form.append('file', image, fileName);
    return this.http.post<Car>(`${API_URL}/admin/cars/${id}/image`, form);
  }

  removeImage(id: number): Observable<Car> {
    return this.http.delete<Car>(`${API_URL}/admin/cars/${id}/image`);
  }
}
