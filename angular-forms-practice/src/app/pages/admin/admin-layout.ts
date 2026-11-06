import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="container page admin">
      <aside class="admin-nav card">
        <p class="admin-title">Paneli i adminit</p>
        <p class="muted small">{{ auth.fullName() }}</p>
        <nav>
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Përmbledhja</a>
          <a routerLink="/admin/rezervimet" routerLinkActive="active">Rezervimet</a>
          <a routerLink="/admin/makinat" routerLinkActive="active">Makinat</a>
        </nav>
      </aside>

      <section class="admin-content">
        <router-outlet />
      </section>
    </div>
  `,
  styles: `
    .admin {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      gap: 24px;
      align-items: start;
    }

    .admin-nav {
      position: sticky;
      top: 88px;
      padding: 18px;
    }

    .admin-title {
      margin: 0;
      color: var(--navy);
      font-weight: 700;
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 14px;
    }

    nav a {
      padding: 9px 12px;
      border-radius: 8px;
      color: var(--text);
      font-weight: 500;
      text-decoration: none;
    }

    nav a:hover { background: var(--bg); }
    nav a.active { background: var(--navy); color: #fff; }

    @media (max-width: 860px) {
      .admin { grid-template-columns: 1fr; }
      .admin-nav { position: static; }
      nav { flex-direction: row; flex-wrap: wrap; }
    }
  `
})
export class AdminLayout {
  readonly auth = inject(AuthService);
}
