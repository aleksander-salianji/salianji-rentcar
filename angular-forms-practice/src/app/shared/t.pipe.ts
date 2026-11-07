import { inject, Pipe, PipeTransform } from '@angular/core';

import { I18nService } from '../core/i18n.service';

// Përdorimi: {{ 'nav.cars' | t }}  ose  {{ 'cars.count' | t: { n: 5 } }}
// pure: false → ndryshon menjëherë kur ndërrohet gjuha
@Pipe({ name: 't', pure: false })
export class TPipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(key: string, params?: Record<string, unknown>): string {
    return this.i18n.t(key, params);
  }
}
