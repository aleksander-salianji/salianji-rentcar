import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './models';

// Kthen një mesazh të kuptueshëm nga çdo gabim HTTP
export function errorMessage(
  err: unknown,
  fallback = 'Ndodhi një gabim. Provo përsëri.'
): string {

  if (err instanceof HttpErrorResponse) {

    if (err.status === 0) {
      return 'Serveri nuk përgjigjet. Sigurohu që backend-i është i ndezur.';
    }

    const body = err.error as Partial<ApiError> | null;
    if (body && typeof body.message === 'string' && body.message) {
      return body.message;
    }

    switch (err.status) {
      case 401: return 'Duhet të hysh në llogari.';
      case 403: return 'Nuk ke leje për këtë veprim.';
      case 404: return 'Nuk u gjet.';
    }
  }

  return fallback;
}
