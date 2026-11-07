import { inject, Pipe, PipeTransform } from '@angular/core';

import { I18nService } from '../core/i18n.service';

// Emrat e vendeve/qyteteve në gjuhën e zgjedhur: {{ 'Aeroporti Rinas' | place }} → "Rinas Airport"
// Vlera që ruhet/dërgohet në server mbetet në shqip; ndryshon vetëm teksti që shfaqet.
// Përkthimet: JSON → "places.<emri-pa-shenja>" (p.sh. places.aeroporti-rinas)
export function placeKey(name: string): string {
  return 'places.' + name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Pipe({ name: 'place', pure: false })
export class PlacePipe implements PipeTransform {
  private i18n = inject(I18nService);

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const key = placeKey(value);
    const t = this.i18n.t(key);
    return t === key ? value : t;
  }
}
