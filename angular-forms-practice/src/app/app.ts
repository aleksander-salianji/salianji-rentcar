import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { AuthService } from './core/auth.service';
import { I18nService, Lang } from './core/i18n.service';
import { ThemeService } from './core/theme.service';
import { TPipe } from './shared/t.pipe';
import { USE_MOCK_API } from './core/config';
import { SUPPORT_CONTACT } from './core/labels';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);

  readonly demoMode = USE_MOCK_API;
  readonly contact = SUPPORT_CONTACT;
  readonly year = new Date().getFullYear();

  menuOpen = signal(false);

  // Butoni "Ndihmë" fshihet te paneli dhe te faqja e ndihmës
  private url = toSignal(
    inject(Router).events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: '/' }
  );

  showSupportButton(): boolean {
    const u = this.url();
    return !/^\/(admin|paneli|ndihme)/.test(u);
  }

  constructor() {
    this.auth.refreshCurrentUser();
  }

  initial(): string {
    return this.auth.displayName().charAt(0).toUpperCase();
  }

  // lista e gjuhëve (🌐 SQ ▾) në rreshtin lart
  langOpen = signal(false);

  pickLang(code: Lang) {
    this.i18n.use(code);
    this.langOpen.set(false);
  }

  toggleMenu() {
    this.menuOpen.update(open => !open);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.closeMenu();
    this.auth.logout();
  }
}
