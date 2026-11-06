import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Car } from '../core/models';
import { LabelPipe } from './label.pipe';

@Component({
  selector: 'app-car-card',
  imports: [RouterLink, DecimalPipe, LabelPipe],
  template: `
    <article class="car-card">
      <div class="car-visual" [attr.data-category]="car().category">
        @if (car().imageUrl) {
          <img [src]="car().imageUrl" [alt]="car().brand + ' ' + car().model" loading="lazy">
        } @else {
          <span class="car-brand">{{ car().brand }}</span>
        }
        <span class="car-badge">{{ car().category | label:'category' }}</span>
      </div>

      <div class="car-body">
        <h3>{{ car().brand }} {{ car().model }}</h3>
        <p class="muted small">{{ car().year }}</p>

        <ul class="car-specs">
          <li>{{ car().transmission | label:'transmission' }}</li>
          <li>{{ car().fuel | label:'fuel' }}</li>
          <li>{{ car().seats }} vende</li>
        </ul>

        @if (car().description) {
          <p class="car-desc">{{ car().description }}</p>
        }

        <div class="car-footer">
          <p class="price">
            <strong>{{ car().pricePerDay | number:'1.0-2' }} €</strong>
            <span class="muted"> / ditë</span>
          </p>
          <a class="btn btn-primary btn-sm" [routerLink]="['/rezervo', car().id]">Rezervo</a>
        </div>
      </div>
    </article>
  `,
  styles: `
    :host { display: block; }

    .car-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      transition: transform .15s, box-shadow .15s;
    }

    .car-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(15, 31, 61, .12);
    }

    .car-visual {
      position: relative;
      display: grid;
      place-items: center;
      height: 150px;
      background: linear-gradient(135deg, #3b4f8f, #5d74c2);
      color: #fff;
    }

    .car-visual[data-category="ECONOMY"] { background: linear-gradient(135deg, #3d8bd4, #5bb0e6); }
    .car-visual[data-category="SEDAN"]   { background: linear-gradient(135deg, #3b4f8f, #5d74c2); }
    .car-visual[data-category="SUV"]     { background: linear-gradient(135deg, #2f7a5c, #4fae85); }
    .car-visual[data-category="LUXURY"]  { background: linear-gradient(135deg, #1f1f2e, #4a4a66); }

    .car-visual img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .car-brand {
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: .5px;
    }

    .car-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 2px 10px;
      border-radius: 999px;
      background: rgba(0, 0, 0, .25);
      font-size: .75rem;
      font-weight: 600;
    }

    .car-body {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 16px;
    }

    .car-body h3 { margin: 0; font-size: 1.08rem; }

    .car-specs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 10px 0;
      padding: 0;
      list-style: none;
    }

    .car-specs li {
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--bg);
      color: var(--muted);
      font-size: .8rem;
    }

    .car-desc {
      color: var(--muted);
      font-size: .88rem;
    }

    .car-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-top: auto;
      padding-top: 12px;
    }

    .price { margin: 0; }
    .price strong { font-size: 1.25rem; color: var(--navy); }
  `
})
export class CarCard {
  readonly car = input.required<Car>();
}
