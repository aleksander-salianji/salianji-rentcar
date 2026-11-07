import { inject, Pipe, PipeTransform } from '@angular/core';

import { I18nService } from '../core/i18n.service';

// Për tekste që vijnë nga databaza: {{ car.description | tx }}
// Përkthimi merret nga seksioni "text" i JSON-it; nëse mungon, shfaqet origjinali.
@Pipe({ name: 'tx', pure: false })
export class TxPipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(value: string | null | undefined): string {
    return this.i18n.text(value);
  }
}
