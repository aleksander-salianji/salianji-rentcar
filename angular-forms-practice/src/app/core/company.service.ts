import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from './config';
import { AdminCompany, Company, CompanyAccountRequest, CompanyReport, CompanyRequest } from './models';

@Injectable({ providedIn: 'root' })
export class CompanyService {

  private http = inject(HttpClient);

  // ---------- PUBLIKE ----------

  list(): Observable<Company[]> {
    return this.http.get<Company[]>(`${API_URL}/companies`);
  }

  get(id: number): Observable<Company> {
    return this.http.get<Company>(`${API_URL}/companies/${id}`);
  }

  // ---------- ADMIN ----------

  adminList(): Observable<AdminCompany[]> {
    return this.http.get<AdminCompany[]>(`${API_URL}/admin/companies`);
  }

  create(request: CompanyRequest): Observable<AdminCompany> {
    return this.http.post<AdminCompany>(`${API_URL}/admin/companies`, request);
  }

  update(id: number, request: CompanyRequest): Observable<AdminCompany> {
    return this.http.put<AdminCompany>(`${API_URL}/admin/companies/${id}`, request);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/admin/companies/${id}`);
  }

  // Krijon ose ndryshon login-in e kompanisë
  setAccount(id: number, request: CompanyAccountRequest): Observable<AdminCompany> {
    return this.http.put<AdminCompany>(`${API_URL}/admin/companies/${id}/account`, request);
  }

  report(): Observable<CompanyReport[]> {
    return this.http.get<CompanyReport[]>(`${API_URL}/admin/companies/report`);
  }
}
