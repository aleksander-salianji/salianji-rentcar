import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FaqGroup } from '../../core/faq';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../shared/t.pipe';
import { inject } from '@angular/core';

// /pyetje — pyetjet e shpeshta, të ndara sipas temës, me kërkim
@Component({
  selector: 'app-faq',
  imports: [RouterLink, TPipe],
  host: { class: 'dk' },
  template: `
    <section class="dk-hero">
      <div class="container">
        <p class="dk-label">{{ 'nav.faq' | t }}</p>
        <h1 class="dk-title">{{ 'faq.title' | t }}</h1>
        <p class="dk-lead">{{ 'faq.lead' | t }} <a routerLink="/ndihme">{{ 'support.writeUs' | t }}</a>.</p>
        <input class="search" type="search" [placeholder]="'faq.searchPlaceholder' | t"
               [value]="term()" (input)="term.set(value($event))" [attr.aria-label]="'faq.searchPlaceholder' | t">
      </div>
    </section>

    <div class="container faq-body">
      <nav class="topics" [attr.aria-label]="'support.topic' | t">
        @for (g of groups(); track g.title) {
          <a [href]="'#' + slug(g.title)" (click)="jump($event, g.title)">{{ g.title }} <span>{{ g.items.length }}</span></a>
        }
      </nav>

      <div>
        @for (g of groups(); track g.title; let gi = $index) {
          <section class="group" [id]="slug(g.title)">
            <h2>{{ g.title }}</h2>
            @for (f of g.items; track f.q; let fi = $index) {
              @let opened = isOpen(f.q, gi === 0 && fi === 0);
              <div class="item" [class.open]="opened">
                <button type="button" [attr.aria-expanded]="opened" (click)="toggle(f.q, opened)">
                  <span>{{ f.q }}</span><span class="sign" aria-hidden="true">{{ opened ? '−' : '+' }}</span>
                </button>
                @if (opened || term()) { <p>{{ f.a }}</p> }
              </div>
            }
          </section>
        } @empty {
          <p class="dk-muted none">{{ 'faq.none' | t: { term: term() } }} <a routerLink="/ndihme">{{ 'faq.askSupport' | t }} →</a></p>
        }
      </div>
    </div>
  `,
  styles: `
    .search {
      width: min(560px, 100%);
      margin-top: 22px;
      padding: 12px 16px;
      border: 1px solid var(--lx-gold);
      border-radius: 0;
      background: var(--lx-surface);
      color: var(--lx-text);
    }
    .faq-body { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 40px; padding-top: 40px; align-items: start; }
    .topics { position: sticky; top: 88px; display: grid; gap: 4px; }
    .topics a { padding: 8px 0; border-bottom: 1px solid var(--lx-line); color: var(--lx-soft) !important; text-decoration: none; }
    .topics a:hover { color: var(--lx-gold) !important; }
    .topics span { float: right; color: var(--lx-muted); }
    .group { padding-bottom: 28px; scroll-margin-top: 90px; }
    .group h2 { margin: 0 0 12px; font-size: 1.6rem; }
    .item { border-bottom: 1px solid var(--lx-line); }
    .item button {
      display: flex; justify-content: space-between; gap: 14px; width: 100%;
      padding: 16px 0; border: 0; background: none; color: var(--lx-text);
      font: inherit; font-size: 1.02rem; text-align: left; cursor: pointer;
    }
    .item.open button, .item button:hover { color: var(--lx-gold); }
    .sign { color: var(--lx-gold); font-size: 1.3rem; line-height: 1; }
    .item p { margin: 0 0 16px; color: var(--lx-soft); max-width: 46em; }
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

  private i18n = inject(I18nService);

  term = signal('');
  open = signal<string | null>(null);

  // e para hapur si parazgjedhje (në çdo gjuhë)
  isOpen(q: string, first: boolean): boolean {
    return this.open() === null ? first : this.open() === q;
  }

  // filtron pyetjet sipas kërkimit (pyetja ose përgjigjja)
  groups = computed(() => {
    const all = this.i18n.list<FaqGroup>('faq.groups');
    const t = this.term().trim().toLowerCase();
    if (!t) {
      return all;
    }
    return all
      .map(g => ({ ...g, items: g.items.filter(f => (f.q + ' ' + f.a).toLowerCase().includes(t)) }))
      .filter(g => g.items.length > 0);
  });

  toggle(q: string, opened: boolean) {
    this.open.set(opened ? '' : q);
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
