import { Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/http-error';
import { translate } from '../../core/i18n.service';
import { TPipe } from '../../shared/t.pipe';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TPipe],
  template: `
    <div class="auth-page">
      <div class="card auth-card">
        <h1>{{ 'nav.login' | t }}</h1>
        <p class="muted">{{ 'login.intro' | t }}</p>

        @if (skaduar()) {
          <div class="alert alert-info">{{ 'login.expired' | t }}</div>
        }
        @if (kthehu()) {
          <div class="alert alert-info">{{ 'login.needLogin' | t }}</div>
        }
        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <label class="field">
            <span>{{ 'form.email' | t }}</span>
            <input type="email" formControlName="email" autocomplete="email"
                   [class.invalid]="isInvalid('email')">
            @if (isInvalid('email')) {
              <small class="error">{{ 'form.err.email' | t }}</small>
            }
          </label>

          <label class="field mt">
            <span>{{ 'login.password' | t }}</span>
            <input type="password" formControlName="password" autocomplete="current-password"
                   [class.invalid]="isInvalid('password')">
            @if (isInvalid('password')) {
              <small class="error">{{ 'login.err.password' | t }}</small>
            }
          </label>

          <button type="submit" class="btn btn-primary btn-block btn-lg mt" [disabled]="loading()">
            {{ (loading() ? 'login.loggingIn' : 'login.submit') | t }}
          </button>
        </form>

        <p class="auth-switch">
          {{ 'login.client' | t }} <a routerLink="/rezervimi">{{ 'login.findBooking' | t }}</a>
        </p>
        <p class="auth-switch">
          {{ 'login.partner' | t }} info&#64;bookerscar.al
        </p>
      </div>
    </div>
  `,
  styles: `.mt { margin-top: 14px; }`
})
export class LoginPage {

  private auth = inject(AuthService);
  private router = inject(Router);

  // query params
  readonly kthehu = input<string>();   // ku të kthehet pas login-it
  readonly skaduar = input<string>();  // sesioni skadoi

  loading = signal(false);
  error = signal<string | null>(null);

  form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  isInvalid(name: 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const target = this.safeReturnUrl() ?? this.auth.panelUrl();
        this.router.navigateByUrl(target);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(errorMessage(err, translate('errors.loginFailed')));
      }
    });
  }

  // Lejo vetëm adresa brenda aplikacionit
  private safeReturnUrl(): string | null {
    const url = this.kthehu();
    return url && url.startsWith('/') && !url.startsWith('//') ? url : null;
  }
}
