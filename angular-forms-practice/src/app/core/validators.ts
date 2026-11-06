import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { daysBetween, todayISO } from './date.utils';

// ---------- PATTERN-ET ----------

// 067/068/069 + 7 shifra, ose +35567/68/69 + 7 shifra
export const PHONE_PATTERN = /^(\+355|0)6[789]\d{7}$/;

// Patenta: 6–12 shkronja ose shifra
export const LICENSE_PATTERN = /^[A-Za-z0-9]{6,12}$/;

// Fjalëkalimi: të paktën 8 karaktere, me të paktën një shkronjë dhe një shifër
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;


// ---------- CUSTOM VALIDATOR ----------
// Emri nuk lejohet të përmbajë "test"
export function forbiddenNameValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value ?? '').toString().toLowerCase();
  return value.includes('test') ? { forbiddenName: true } : null;
}


// ---------- FORM GROUP VALIDATOR ----------
// Kontrollon që password dhe confirmPassword të jenë të njëjta
export function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;

  return password && confirm && password !== confirm
    ? { passwordMismatch: true }
    : null;
}


// ---------- ASYNC VALIDATOR ----------
// Pyet serverin nëse email-i është i zënë.
// Merr si parametër funksionin që bën kërkesën (nga AuthService).
export function emailTakenValidator(
  emailExists: (email: string) => Observable<boolean>
): AsyncValidatorFn {

  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = (control.value ?? '').toString().trim();

    if (!value) {
      return of(null);
    }

    return emailExists(value).pipe(
      map(exists => (exists ? { emailTaken: true } : null)),
      // nëse serveri nuk përgjigjet, nuk e bllokojmë formularin;
      // serveri do ta kontrollojë përsëri gjatë regjistrimit
      catchError(() => of(null))
    );
  };
}


// ---------- DATAT ----------

// Data nuk mund të jetë në të kaluarën
export function notInPastValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  return value && value < todayISO() ? { pastDate: true } : null;
}

// Validator në FormGroup: kthimi pas marrjes dhe jo më shumë se maxDays ditë
export function dateRangeValidator(maxDays: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pickup = group.get('pickupDate')?.value as string;
    const ret = group.get('returnDate')?.value as string;

    if (!pickup || !ret) {
      return null;
    }
    if (ret <= pickup) {
      return { invalidRange: true };
    }
    if (daysBetween(pickup, ret) > maxDays) {
      return { tooLong: true };
    }
    return null;
  };
}
