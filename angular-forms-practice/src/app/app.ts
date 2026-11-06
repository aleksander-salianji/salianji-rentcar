import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from './core/auth.service';
import { USE_MOCK_API } from './core/config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  readonly auth = inject(AuthService);

  readonly demoMode = USE_MOCK_API;
  readonly year = new Date().getFullYear();

  menuOpen = signal(false);

  constructor() {
    this.auth.refreshCurrentUser();
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
