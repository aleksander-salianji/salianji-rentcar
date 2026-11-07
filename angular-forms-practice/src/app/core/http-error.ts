import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './models';
import { translate } from './i18n.service';

// Kthen një mesazh të kuptueshëm nga çdo gabim HTTP (në gjuhën e zgjedhur).
// Mesazhet që vijnë nga backend-i (body.message) janë në shqip.
export function errorMessage(err: unknown, fallback?: string): string {

  if (err instanceof HttpErrorResponse) {

    if (err.status === 0) {
      return translate('errors.offline');
    }

    const body = err.error as Partial<ApiError> | null;
    if (body && typeof body.message === 'string' && body.message) {
      return body.message;
    }

    switch (err.status) {
      case 401: return translate('errors.unauthorized');
      case 403: return translate('errors.forbidden');
      case 404: return translate('errors.notFound');
    }
  }

  return fallback ?? translate('errors.generic');
}
