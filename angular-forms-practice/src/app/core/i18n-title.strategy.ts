import { effect, inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { I18nService } from './i18n.service';

const SITE = 'Bookers Car Albania';

// Titulli i skedës së shfletuesit në gjuhën e zgjedhur.
// Në app.routes.ts: title: 'title.cars'  →  "Cars | Bookers Car Albania"
@Injectable({ providedIn: 'root' })
export class I18nTitleStrategy extends TitleStrategy {

  private title = inject(Title);
  private i18n = inject(I18nService);
  private router = inject(Router);
  private lastKey: string | undefined;

  constructor() {
    super();
    // kur ndërrohet gjuha, përkthe edhe titullin aktual
    effect(() => {
      this.i18n.lang();
      if (this.lastKey) {
        this.apply(this.lastKey);
      }
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.lastKey = this.buildTitle(snapshot);
    if (this.lastKey) {
      this.apply(this.lastKey);
    }
  }

  private apply(key: string): void {
    // faqja e artikullit të blogut vendos vetë titullin e artikullit
    if (key === 'title.blogPost' && this.router.url.startsWith('/blog/')) {
      return;
    }
    if (!key.startsWith('title.')) {
      this.title.setTitle(key);
      return;
    }
    const text = this.i18n.t(key);
    this.title.setTitle(key === 'title.home' ? `${SITE} | ${text}` : `${text} | ${SITE}`);
  }
}
