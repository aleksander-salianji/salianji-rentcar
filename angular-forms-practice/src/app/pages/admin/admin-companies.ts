import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CompanyService } from '../../core/company.service';
import { errorMessage } from '../../core/http-error';
import { CITIES } from '../../core/labels';
import { PASSWORD_PATTERN } from '../../core/validators';
import { AdminCompany, CompanyReport, CompanyRequest } from '../../core/models';

// Menaxhimi i kompanive partnere: shto, ndrysho, çaktivizo + xhiro dhe komisioni
@Component({
  selector: 'app-admin-companies',
  imports: [ReactiveFormsModule, DecimalPipe, RouterLink],
  templateUrl: './admin-companies.html',
  styles: `
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 20px; align-items: start; }
    .company-form { position: sticky; top: 88px; }
    .company-form h2 { font-size: 1.15rem; }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
    tr.inactive td { color: var(--muted); }
    .totals { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 18px; }
    .total { display: flex; flex-direction: column; padding: 14px 18px; }
    .total strong { color: var(--navy); font-size: 1.35rem; }
    .mt { margin-top: 12px; }
    .account { margin-top: 16px; }
    .account h3 { margin: 0 0 4px; font-size: 1rem; }
    .login-line { color: var(--accent); }
    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      .company-form { position: static; }
    }
  `
})
export class AdminCompanies {

  private companyService = inject(CompanyService);

  readonly cities = CITIES;

  companies = signal<AdminCompany[]>([]);
  report = signal<CompanyReport[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  editingId = signal<number | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  // kompania + rezultatet e saj në një rresht
  rows = computed(() => {
    const rep = new Map(this.report().map(r => [r.companyId, r]));
    return this.companies().map(c => ({ company: c, report: rep.get(c.id) ?? null }));
  });

  totals = computed(() => this.report().reduce(
    (t, r) => ({ revenue: t.revenue + r.revenue, fee: t.fee + r.platformFee, bookings: t.bookings + r.bookings }),
    { revenue: 0, fee: 0, bookings: 0 }
  ));

  form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    city: new FormControl('Tiranë', { nonNullable: true, validators: [Validators.required] }),
    address: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(150)] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.email] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(400)] }),
    commissionPercent: new FormControl<number | null>(10, [Validators.required, Validators.min(0), Validators.max(50)]),
    active: new FormControl(true, { nonNullable: true })
  });

  // ---------- LOGIN-I I KOMPANISË ----------
  accountForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)]
    })
  });
  savingAccount = signal(false);
  accountError = signal<string | null>(null);

  editingCompany = computed(() => this.companies().find(c => c.id === this.editingId()) ?? null);

  constructor() {
    this.load();
  }

  isAccountInvalid(name: 'email' | 'password'): boolean {
    const c = this.accountForm.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  saveAccount() {
    const id = this.editingId();
    if (id === null) {
      return;
    }
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    const v = this.accountForm.getRawValue();
    this.savingAccount.set(true);
    this.accountError.set(null);
    this.companyService.setAccount(id, { email: v.email.trim(), password: v.password }).subscribe({
      next: updated => {
        this.savingAccount.set(false);
        this.companies.update(list => list.map(c => (c.id === updated.id ? { ...c, accountEmail: updated.accountEmail } : c)));
        this.accountForm.controls.password.reset('');
        this.flash(`Login-i u ruajt. Dërgoja kompanisë: ${updated.accountEmail} + fjalëkalimin.`);
      },
      error: err => {
        this.savingAccount.set(false);
        this.accountError.set(errorMessage(err));
      }
    });
  }

  load() {
    forkJoin({ companies: this.companyService.adminList(), report: this.companyService.report() }).subscribe({
      next: ({ companies, report }) => {
        this.companies.set(companies);
        this.report.set(report);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }

  isInvalid(name: keyof CompanyRequest): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  // SET VALUE: plotëson të gjitha fushat me të dhënat e kompanisë
  edit(c: AdminCompany) {
    this.editingId.set(c.id);
    this.formError.set(null);
    this.form.setValue({
      name: c.name,
      city: c.city,
      address: c.address ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      description: c.description ?? '',
      commissionPercent: c.commissionPercent,
      active: c.active
    });
    this.accountError.set(null);
    this.accountForm.reset({ email: c.accountEmail ?? c.email ?? '', password: '' });
  }

  newCompany() {
    this.editingId.set(null);
    this.formError.set(null);
    this.form.reset({ city: 'Tiranë', commissionPercent: 10, active: true });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const request: CompanyRequest = {
      name: v.name.trim(),
      city: v.city,
      address: v.address.trim() || null,
      phone: v.phone.trim() || null,
      email: v.email.trim() || null,
      description: v.description.trim() || null,
      commissionPercent: v.commissionPercent ?? 0,
      active: v.active
    };
    const id = this.editingId();
    this.saving.set(true);
    (id === null ? this.companyService.create(request) : this.companyService.update(id, request)).subscribe({
      next: () => {
        this.saving.set(false);
        this.flash(id === null ? 'Kompania u shtua.' : 'Ndryshimet u ruajtën.');
        this.newCompany();
        this.load();
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(errorMessage(err));
      }
    });
  }

  remove(c: AdminCompany) {
    if (!confirm(`Të fshihet kompania ${c.name}?`)) {
      return;
    }
    this.companyService.remove(c.id).subscribe({
      next: () => {
        this.flash('Kompania u fshi.');
        this.load();
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  private flash(text: string) {
    this.message.set(text);
    setTimeout(() => this.message() === text && this.message.set(null), 6000);
  }
}
