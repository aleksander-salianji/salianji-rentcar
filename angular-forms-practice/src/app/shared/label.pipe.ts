import { Pipe, PipeTransform } from '@angular/core';

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

// Përdorimi: {{ car.category | label:'category' }}  →  "Ekonomike"
@Pipe({ name: 'label' })
export class LabelPipe implements PipeTransform {
  transform(value: string | null | undefined, kind: LabelKind): string {
    if (!value) {
      return '';
    }
    return LABELS[kind][value] ?? value;
  }
}
