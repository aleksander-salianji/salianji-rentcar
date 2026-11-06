import { ChangeDetectorRef, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { filter, take } from 'rxjs/operators';

import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/http-error';
import {
  emailTakenValidator,
  forbiddenNameValidator,
  PASSWORD_PATTERN,
  passwordMatchValidator,
  PHONE_PATTERN
} from '../../core/validators';

type RegisterField =
  'firstName' | 'lastName' | 'email' | 'phone' | 'password' | 'confirmPassword' | 'acceptTerms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styles: `.mt { margin-top: 14px; }`
})
export class RegisterPage {

  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  readonly kthehu = input<string>();

  loading = signal(false);
  submitAttempted = signal(false);
  error = signal<string | null>(null);

  form = new FormGroup(
    {
      // CUSTOM VALIDATOR: forbiddenNameValidator
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), forbiddenNameValidator]
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2), forbiddenNameValidator]
      }),

      // ASYNC VALIDATOR: pyet serverin nëse email-i është i zënë
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
        asyncValidators: [emailTakenValidator(email => this.auth.emailExists(email))],
        updateOn: 'blur'
      }),

      phone: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(PHONE_PATTERN)]
      }),

      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)]
      }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),

      acceptTerms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] })
    },
    // FORM GROUP VALIDATOR
    { validators: passwordMatchValidator }
  );

  constructor() {
    // rifreskon ekranin kur përfundon kontrolli async i email-it
    this.form.statusChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.cdr.markForCheck());
  }

  isInvalid(name: RegisterField): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  hasError(name: RegisterField, code: string): boolean {
    return this.form.controls[name].hasError(code);
  }

  showMismatch(): boolean {
    return this.form.hasError('passwordMismatch') && this.form.controls.confirmPassword.touched;
  }

  onSubmit() {
    this.submitAttempted.set(true);
    this.error.set(null);

    if (this.loading()) {
      return;
    }

    // Nëse kontrolli async i email-it është ende në proces, prit sa të mbarojë
    if (this.form.pending) {
      this.form.statusChanges
        .pipe(filter(status => status !== 'PENDING'), take(1))
        .subscribe(() => this.onSubmit());
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.loading.set(true);

    this.auth.register({
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim().toLowerCase(),
      phone: v.phone.trim(),
      password: v.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        const url = this.kthehu();
        const safe = url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
        this.router.navigateByUrl(safe);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(errorMessage(err, 'Regjistrimi dështoi.'));
      }
    });
  }
}
