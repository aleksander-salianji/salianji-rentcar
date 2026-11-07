import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'bookers.theme';

// Tema e zezë / e bardhë, e zgjedh vizitori. Ruhet në shfletues.
@Injectable({ providedIn: 'root' })
export class ThemeService {

  private document = inject(DOCUMENT);
  readonly theme = signal<Theme>(this.initial());

  constructor() {
    this.apply(this.theme());
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    this.apply(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // injoro
    }
  }

  private apply(theme: Theme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
    this.document.documentElement.style.colorScheme = theme;
  }

  private initial(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // injoro
    }
    // e zeza si parazgjedhje (stili i markës)
    return 'dark';
  }
}
