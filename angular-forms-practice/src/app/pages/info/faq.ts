import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FAQ_GROUPS } from '../../core/faq';

// /pyetje — pyetjet e shpeshta, të ndara sipas temës, me kërkim
@Component({
  selector: 'app-faq',
  imports: [RouterLink],
  host: { class: 'dk' },
  template: `
    <section class="dk-hero">
      <div class="container">
        <p class="dk-label">Pyetje të shpeshta</p>
        <h1 class="dk-title">Gjithçka që duhet të dish</h1>
        <p class="dk-lead">Rezervimi, pagesa, anulimi dhe marrja e makinës. Nuk e gjen përgjigjen? <a routerLink="/ndihme">Na shkruaj</a>.</p>
        <input class="search" type="search" placeholder="Kërko p.sh. anulim, patentë, zbritje..."
               [value]="term()" (input)="term.set(value($event))" aria-label="Kërko pyetje">
      </div>
    </section>

    <div class="container faq-body">
      <nav class="topics" aria-label="Temat">
        @for (g of groups(); track g.title) {
          <a [href]="'#' + slug(g.title)" (click)="jump($event, g.title)">{{ g.title }} <span>{{ g.items.length }}</span></a>
        }
      </nav>

      <div>
        @for (g of groups(); track g.title) {
          <section class="group" [id]="slug(g.title)">
            <h2>{{ g.title }}</h2>
            @for (f of g.items; track f.q) {
              <div class="item" [class.open]="open() === f.q">
                <button type="button" [attr.aria-expanded]="open() === f.q" (click)="toggle(f.q)">
                  <span>{{ f.q }}</span><span class="sign" aria-hidden="true">{{ open() === f.q ? '−' : '+' }}</span>
                </button>
                @if (open() === f.q || term()) { <p>{{ f.a }}</p> }
              </div>
            }
          </section>
        } @empty {
          <p class="dk-muted none">Asnjë pyetje për "{{ term() }}". <a routerLink="/ndihme">Pyet supportin →</a></p>
        }
      </div>
    </div>
  `,
  styles: `
    .search {
      width: min(560px, 100%);
      margin-top: 22px;
      padding: 12px 16px;
      border: 1px solid #c8a86b;
      border-radius: 0;
      background: #0e0f12;
      color: #ece8df;
    }
    .faq-body { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 40px; padding-top: 40px; align-items: start; }
    .topics { position: sticky; top: 88px; display: grid; gap: 4px; }
    .topics a { padding: 8px 0; border-bottom: 1px solid #26272c; color: #b9b5ad !important; text-decoration: none; }
    .topics a:hover { color: #c8a86b !important; }
    .topics span { float: right; color: #8d8a84; }
    .group { padding-bottom: 28px; scroll-margin-top: 90px; }
    .group h2 { margin: 0 0 12px; font-size: 1.6rem; }
    .item { border-bottom: 1px solid #26272c; }
    .item button {
      display: flex; justify-content: space-between; gap: 14px; width: 100%;
      padding: 16px 0; border: 0; background: none; color: #ece8df;
      font: inherit; font-size: 1.02rem; text-align: left; cursor: pointer;
    }
    .item.open button, .item button:hover { color: #c8a86b; }
    .sign { color: #c8a86b; font-size: 1.3rem; line-height: 1; }
    .item p { margin: 0 0 16px; color: #b9b5ad; max-width: 46em; }
    .none { padding: 20px 0; }
    @media (max-width: 860px) {
      .faq-body { grid-template-columns: 1fr; gap: 10px; }
      .topics { position: static; grid-auto-flow: column; overflow-x: auto; gap: 16px; }
      .topics a { white-space: nowrap; border: 0; }
      .topics span { float: none; margin-left: 4px; }
    }
  `
})
export class FaqPage {

  term = signal('');
  open = signal<string | null>(FAQ_GROUPS[0].items[0].q);

  // filtron pyetjet sipas kërkimit (pyetja ose përgjigjja)
  groups = computed(() => {
    const t = this.term().trim().toLowerCase();
    if (!t) {
      return FAQ_GROUPS;
    }
    return FAQ_GROUPS
      .map(g => ({ ...g, items: g.items.filter(f => (f.q + ' ' + f.a).toLowerCase().includes(t)) }))
      .filter(g => g.items.length > 0);
  });

  toggle(q: string) {
    this.open.update(cur => (cur === q ? null : q));
  }

  slug(title: string): string {
    return title.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-');
  }

  jump(event: Event, title: string) {
    event.preventDefault();
    document.getElementById(this.slug(title))?.scrollIntoView({ behavior: 'smooth' });
  }

  value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
