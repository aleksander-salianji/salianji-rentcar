import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { API_URL } from './config';
import { SupportRequest, SupportStatus, SupportTicket } from './models';

@Injectable({ providedIn: 'root' })
export class SupportService {

  private http = inject(HttpClient);

  // Numri i kërkesave të hapura (shfaqet te menyja e adminit)
  readonly openCount = signal(0);

  // ---------- PUBLIKE ----------

  send(request: SupportRequest): Observable<SupportTicket> {
    return this.http.post<SupportTicket>(`${API_URL}/support`, request);
  }

  // ---------- ADMIN ----------

  list(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${API_URL}/admin/support`).pipe(
      tap(list => this.openCount.set(list.filter(t => t.status === 'OPEN').length))
    );
  }

  refreshOpenCount(): void {
    this.http.get<{ open: number }>(`${API_URL}/admin/support/open-count`)
      .pipe(map(r => r.open))
      .subscribe({ next: n => this.openCount.set(n), error: () => { /* injoro */ } });
  }

  setStatus(id: number, status: SupportStatus): Observable<SupportTicket> {
    return this.http.patch<SupportTicket>(`${API_URL}/admin/support/${id}/status`, { status }).pipe(
      tap(() => this.openCount.update(n => Math.max(0, n + (status === 'RESOLVED' ? -1 : 1))))
    );
  }
}
