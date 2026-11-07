import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CarService } from '../../core/car.service';
import { CompanyService } from '../../core/company.service';
import { Company } from '../../core/models';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../shared/t.pipe';

// /rreth-nesh
@Component({
  selector: 'app-about',
  imports: [RouterLink, TPipe],
  host: { class: 'dk' },
  template: `
    <section class="dk-hero">
      <div class="container">
        <p class="dk-label">{{ 'nav.about' | t }}</p>
        <h1 class="dk-title">{{ 'about.title' | t }}</h1>
        <p class="dk-lead">
          {{ 'about.lead' | t }}
        </p>
      </div>
    </section>

    <!-- SHIFRAT (live nga databaza) -->
    <section class="container dk-section">
      <div class="stats">
        <div><strong>{{ companies().length || '—' }}</strong><span>{{ 'about.statCompanies' | t }}</span></div>
        <div><strong>{{ carCount() || '—' }}</strong><span>{{ 'about.statCars' | t }}</span></div>
        <div><strong>{{ cities().length || '—' }}</strong><span>{{ 'about.statCities' | t }}</span></div>
        <div><strong>24/7</strong><span>{{ 'about.statOnline' | t }}</span></div>
      </div>
    </section>

    <section class="container dk-section">
      <h2>{{ 'about.how' | t }}</h2>
      <div class="steps">
        @for (s of steps(); track s.t; let i = $index) {
          <div class="dk-card step"><span class="n">0{{ i + 1 }}</span><h3>{{ s.t }}</h3><p class="dk-muted">{{ s.d }}</p></div>
        }
      </div>
    </section>

    <section class="container dk-section two">
      <div>
        <h2>{{ 'about.mission' | t }}</h2>
        <p class="body">
          {{ 'about.mission1' | t }}
        </p>
        <p class="body">
          {{ 'about.mission2' | t }}
        </p>
      </div>
      <div class="values">
        @for (v of values(); track v.t) {
          <div><h3>{{ v.t }}</h3><p class="dk-muted">{{ v.d }}</p></div>
        }
      </div>
    </section>

    @if (companies().length) {
      <section class="container dk-section">
        <h2>{{ 'about.partners' | t }}</h2>
        <div class="partners">
          @for (c of companies(); track c.id) {
            <a [routerLink]="['/kompania', c.id]">{{ c.name }} <small>{{ c.city }}</small></a>
          }
        </div>
      </section>
    }

    <section class="container dk-section">
      <div class="dk-card cta">
        <div>
          <h2>{{ 'about.ctaTitle' | t }}</h2>
          <p class="dk-muted">{{ 'about.ctaText' | t }}</p>
        </div>
        <div class="cta-btns">
          <a class="dk-btn" routerLink="/ndihme" [queryParams]="{ tema: 'PARTNER' }">{{ 'about.becomePartner' | t }}</a>
          <a class="dk-btn ghost" routerLink="/karriera">{{ 'nav.careers' | t }}</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--lx-line); }
    .stats div { display: grid; gap: 4px; padding: 26px 22px; border-right: 1px solid var(--lx-line); }
    .stats div:last-child { border-right: 0; }
    .stats strong { color: var(--lx-gold); font: 400 2.6rem/1 "Bodoni Moda", Georgia, serif; }
    .stats span { color: var(--lx-muted); font-size: .85rem; letter-spacing: .08em; }
    .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
    .step h3 { margin: 6px 0; font-size: 1.15rem; }
    .step p { margin: 0; }
    .n { color: var(--lx-gold); font: italic 400 1.6rem "Bodoni Moda", Georgia, serif; }
    .two { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; }
    .body { color: var(--lx-soft); font-size: 1.05rem; line-height: 1.75; }
    .values { display: grid; gap: 18px; padding-top: 8px; }
    .values div { padding-left: 16px; border-left: 1px solid var(--lx-gold); }
    .values h3 { margin: 0 0 4px; font-size: 1.05rem; }
    .values p { margin: 0; }
    .partners { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .partners a { padding: 10px 16px; border: 1px solid var(--lx-line); color: var(--lx-text) !important; text-decoration: none; }
    .partners a:hover { border-color: var(--lx-gold); }
    .partners small { margin-left: 6px; color: var(--lx-muted); }
    .cta { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px; border-color: var(--lx-gold); }
    .cta h2 { margin: 0; }
    .cta p { margin: 6px 0 0; }
    .cta-btns { display: flex; flex-wrap: wrap; gap: 10px; }
    @media (max-width: 860px) {
      .stats { grid-template-columns: 1fr 1fr; }
      .stats div:nth-child(2) { border-right: 0; }
      .stats div:nth-child(-n+2) { border-bottom: 1px solid var(--lx-line); }
      .steps, .two { grid-template-columns: 1fr; }
    }
  `
})
export class AboutPage {

  private i18n = inject(I18nService);

  steps(): { t: string; d: string }[] {
    return this.i18n.list('about.steps');
  }

  values(): { t: string; d: string }[] {
    return this.i18n.list('about.values');
  }

  companies = signal<Company[]>([]);
  carCount = signal(0);
  cities = computed(() => [...new Set(this.companies().map(c => c.city))]);

  constructor() {
    inject(CompanyService).list().subscribe({ next: list => this.companies.set(list), error: () => { /* injoro */ } });
    inject(CarService).list().subscribe({ next: list => this.carCount.set(list.length), error: () => { /* injoro */ } });
  }
}
