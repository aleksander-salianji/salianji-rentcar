import { inject, Pipe, PipeTransform } from '@angular/core';

import { I18nService } from '../core/i18n.service';
import {
  CATEGORY_LABELS,
  FUEL_LABELS,
  STATUS_LABELS,
  TRANSMISSION_LABELS
} from '../core/labels';

export type LabelKind = 'category' | 'transmission' | 'fuel' | 'status';

const LABELS: Record<LabelKind, Record<string, string>> = {
  category: CATEGORY_LABELS,
  transmission: TRANSMISSION_LABELS,
  fuel: FUEL_LABELS,
  status: STATUS_LABELS
};

// Përdorimi: {{ car.category | label:'category' }}  →  "Ekonomike" / "Economy" ...
// Përkthimi merret nga JSON: enum.category.ECONOMY (nëse mungon → shqip)
@Pipe({ name: 'label', pure: false })
export class LabelPipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(value: string | null | undefined, kind: LabelKind): string {
    if (!value) {
      return '';
    }
    const key = `enum.${kind}.${value}`;
    const translated = this.i18n.t(key);
    return translated !== key ? translated : (LABELS[kind][value] ?? value);
  }
}
