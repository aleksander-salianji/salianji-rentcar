import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="container page not-found">
      <p class="code">404</p>
      <h1>Faqja nuk u gjet</h1>
      <p class="muted">Adresa që kërkove nuk ekziston ose është zhvendosur.</p>
      <a routerLink="/" class="btn btn-primary">Kthehu në kryefaqe</a>
    </div>
  `,
  styles: `
    .not-found { padding-top: 80px; text-align: center; }
    .code { margin: 0; color: var(--accent); font-size: 4rem; font-weight: 800; }
    .btn { margin-top: 16px; }
  `
})
export class NotFoundPage {}
