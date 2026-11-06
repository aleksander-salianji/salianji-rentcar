import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CarService } from '../../core/car.service';
import { CompanyService } from '../../core/company.service';
import { Company } from '../../core/models';

// /rreth-nesh
@Component({
  selector: 'app-about',
  imports: [RouterLink],
  host: { class: 'dk' },
  template: `
    <section class="dk-hero">
      <div class="container">
        <p class="dk-label">Rreth nesh</p>
        <h1 class="dk-title">Një vend për të gjitha makinat me qira në Shqipëri</h1>
        <p class="dk-lead">
          Bookers Car Albania lidh udhëtarët me kompanitë lokale të qirasë. Krahason çmimet, sheh cila makinë është e lirë
          dhe rezervon në pak minuta, pa llogari. Kompania merr rezervimin menjëherë dhe të pret me makinën gati.
        </p>
      </div>
    </section>

    <!-- SHIFRAT (live nga databaza) -->
    <section class="container dk-section">
      <div class="stats">
        <div><strong>{{ companies().length || '—' }}</strong><span>kompani partnere</span></div>
        <div><strong>{{ carCount() || '—' }}</strong><span>makina në platformë</span></div>
        <div><strong>{{ cities().length || '—' }}</strong><span>qytete</span></div>
        <div><strong>24/7</strong><span>rezervime online</span></div>
      </div>
    </section>

    <section class="container dk-section">
      <h2>Si funksionon</h2>
      <div class="steps">
        @for (s of steps; track s.t; let i = $index) {
          <div class="dk-card step"><span class="n">0{{ i + 1 }}</span><h3>{{ s.t }}</h3><p class="dk-muted">{{ s.d }}</p></div>
        }
      </div>
    </section>

    <section class="container dk-section two">
      <div>
        <h2>Misioni ynë</h2>
        <p class="body">
          Të marrësh një makinë me qira në Shqipëri shpesh do të thotë telefonata, mesazhe dhe çmime që ndryshojnë.
          Ne e bëjmë të thjeshtë: çmime të qarta, disponueshmëri reale dhe rregulla të njëjta për të gjithë —
          minimumi 3 ditë, anulim falas brenda 24 orëve, pagesë në marrje.
        </p>
        <p class="body">
          Për kompanitë lokale jemi një vitrinë online dhe një panel ku shohin rezervimet, makinat e lira dhe xhiron çdo ditë.
        </p>
      </div>
      <div class="values">
        @for (v of values; track v.t) {
          <div><h3>{{ v.t }}</h3><p class="dk-muted">{{ v.d }}</p></div>
        }
      </div>
    </section>

    @if (companies().length) {
      <section class="container dk-section">
        <h2>Partnerët tanë</h2>
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
          <h2>Ke një kompani qiraje?</h2>
          <p class="dk-muted">Bashkohu si partner dhe merr rezervime nga klientë të rinj, me panelin tënd.</p>
        </div>
        <div class="cta-btns">
          <a class="dk-btn" routerLink="/ndihme" [queryParams]="{ tema: 'PARTNER' }">Bëhu partner</a>
          <a class="dk-btn ghost" routerLink="/karriera">Karriera</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid #26272c; }
    .stats div { display: grid; gap: 4px; padding: 26px 22px; border-right: 1px solid #26272c; }
    .stats div:last-child { border-right: 0; }
    .stats strong { color: #c8a86b; font: 400 2.6rem/1 "Bodoni Moda", Georgia, serif; }
    .stats span { color: #8d8a84; font-size: .85rem; letter-spacing: .08em; }
    .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
    .step h3 { margin: 6px 0; font-size: 1.15rem; }
    .step p { margin: 0; }
    .n { color: #c8a86b; font: italic 400 1.6rem "Bodoni Moda", Georgia, serif; }
    .two { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; }
    .body { color: #cfcac0; font-size: 1.05rem; line-height: 1.75; }
    .values { display: grid; gap: 18px; padding-top: 8px; }
    .values div { padding-left: 16px; border-left: 1px solid #c8a86b; }
    .values h3 { margin: 0 0 4px; font-size: 1.05rem; }
    .values p { margin: 0; }
    .partners { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .partners a { padding: 10px 16px; border: 1px solid #26272c; color: #ece8df !important; text-decoration: none; }
    .partners a:hover { border-color: #c8a86b; }
    .partners small { margin-left: 6px; color: #8d8a84; }
    .cta { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px; border-color: #c8a86b; }
    .cta h2 { margin: 0; }
    .cta p { margin: 6px 0 0; }
    .cta-btns { display: flex; flex-wrap: wrap; gap: 10px; }
    @media (max-width: 860px) {
      .stats { grid-template-columns: 1fr 1fr; }
      .stats div:nth-child(2) { border-right: 0; }
      .stats div:nth-child(-n+2) { border-bottom: 1px solid #26272c; }
      .steps, .two { grid-template-columns: 1fr; }
    }
  `
})
export class AboutPage {

  readonly steps = [
    { t: 'Kërko', d: 'Zgjidh qytetin dhe datat. Shfaqen vetëm makinat e lira, nga të gjitha kompanitë.' },
    { t: 'Rezervo', d: 'Plotëso të dhënat, pa llogari. Merr kodin e rezervimit menjëherë.' },
    { t: 'Merr makinën', d: 'Kompania të konfirmon dhe të pret. Paguan në momentin e marrjes.' }
  ];

  readonly values = [
    { t: 'Transparencë', d: 'Çmimi që sheh është çmimi që paguan.' },
    { t: 'Kompani lokale', d: 'Mbështesim bizneset shqiptare të qirasë.' },
    { t: 'Thjeshtësi', d: 'Pa llogari, pa letra, pa telefonata të panevojshme.' }
  ];

  companies = signal<Company[]>([]);
  carCount = signal(0);
  cities = computed(() => [...new Set(this.companies().map(c => c.city))]);

  constructor() {
    inject(CompanyService).list().subscribe({ next: list => this.companies.set(list), error: () => { /* injoro */ } });
    inject(CarService).list().subscribe({ next: list => this.carCount.set(list.length), error: () => { /* injoro */ } });
  }
}
