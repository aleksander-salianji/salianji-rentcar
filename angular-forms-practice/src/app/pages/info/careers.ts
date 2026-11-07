import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Job } from '../../core/careers';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../shared/t.pipe';
import { errorMessage } from '../../core/http-error';
import { SupportService } from '../../core/support.service';

// /karriera — pozicionet e hapura dhe aplikimi (shkon te Paneli → Support, tema "Karriera")
@Component({
  selector: 'app-careers',
  imports: [ReactiveFormsModule, TPipe],
  host: { class: 'dk' },
  template: `
    <section class="dk-hero">
      <div class="container">
        <p class="dk-label">{{ 'nav.careers' | t }}</p>
        <h1 class="dk-title">{{ 'careers.title' | t }}</h1>
        <p class="dk-lead">{{ 'careers.lead' | t }}</p>
      </div>
    </section>

    <section class="container dk-section">
      <div class="perks dk-grid">
        @for (p of perks(); track p.t) {
          <div class="dk-card">
            <h3>{{ p.t }}</h3>
            <p class="dk-muted">{{ p.d }}</p>
          </div>
        }
      </div>
    </section>

    <section class="container dk-section">
      <h2>
        {{ 'careers.open' | t }} <span class="count">{{ jobs().length }}</span>
      </h2>
      <div class="jobs">
        @for (j of jobs(); track j.id) {
          <article class="job" [class.open]="openJob() === j.id">
            <button
              type="button"
              class="job-head"
              [attr.aria-expanded]="openJob() === j.id"
              (click)="toggle(j.id)"
            >
              <span>
                <strong>{{ j.title }}</strong>
                <small>{{ j.team }} · {{ j.location }} · {{ j.type }}</small>
              </span>
              <span class="sign" aria-hidden="true">{{ openJob() === j.id ? '−' : '+' }}</span>
            </button>
            @if (openJob() === j.id) {
              <div class="job-body">
                <p>{{ j.summary }}</p>
                <div class="cols">
                  <div>
                    <h3>{{ 'careers.tasks' | t }}</h3>
                    <ul>
                      @for (t of j.tasks; track t) {
                        <li>{{ t }}</li>
                      }
                    </ul>
                  </div>
                  <div>
                    <h3>{{ 'careers.requirements' | t }}</h3>
                    <ul>
                      @for (r of j.requirements; track r) {
                        <li>{{ r }}</li>
                      }
                    </ul>
                  </div>
                </div>
                <button type="button" class="dk-btn" (click)="apply(j)">
                  {{ 'careers.apply' | t }}
                </button>
              </div>
            }
          </article>
        }
      </div>
    </section>

    <!-- APLIKIMI -->
    <section class="container dk-section" id="apliko">
      <div class="dk-card apply">
        @if (sent()) {
          <h2>{{ 'careers.thanks' | t }}</h2>
          <p class="dk-muted">{{ 'careers.sentText' | t: { id: sent() } }}</p>
          <button type="button" class="dk-btn ghost" (click)="sent.set(null)">
            {{ 'careers.applyOther' | t }}
          </button>
        } @else {
          <h2>{{ 'careers.apply' | t }}</h2>
          <p class="dk-muted">{{ 'careers.openApplicationHint' | t }}</p>

          @if (error()) {
            <p class="err">{{ error() }}</p>
          }

          <form [formGroup]="form" (ngSubmit)="send()" novalidate>
            <div class="fields">
              <label class="f span">
                <span>{{ 'careers.position' | t }}</span>
                <select formControlName="position">
                  @for (j of jobs(); track j.id) {
                    <option [value]="j.title">{{ j.title }}</option>
                  }
                  <option [value]="'careers.openApplication' | t">
                    {{ 'careers.openApplication' | t }}
                  </option>
                </select>
              </label>
              <label class="f">
                <span>{{ 'careers.fullName' | t }}</span>
                <input
                  type="text"
                  formControlName="name"
                  autocomplete="name"
                  [class.bad]="bad('name')"
                />
              </label>
              <label class="f">
                <span>{{ 'form.email' | t }}</span>
                <input
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  [class.bad]="bad('email')"
                />
              </label>
              <label class="f">
                <span>{{ 'company.phone' | t }}</span>
                <input
                  type="tel"
                  formControlName="phone"
                  autocomplete="tel"
                  placeholder="06XXXXXXXX"
                />
              </label>
              <label class="f">
                <span>{{ 'careers.cv' | t }}</span>
                <input
                  type="url"
                  formControlName="cv"
                  placeholder="https://..."
                  [class.bad]="bad('cv')"
                />
              </label>
              <label class="f span">
                <span>{{ 'careers.why' | t }}</span>
                <textarea
                  formControlName="message"
                  rows="5"
                  [class.bad]="bad('message')"
                  [placeholder]="'careers.whyPlaceholder' | t"
                ></textarea>
              </label>
              <input
                class="hp"
                type="text"
                formControlName="website"
                tabindex="-1"
                autocomplete="off"
                aria-hidden="true"
              />
            </div>
            @if (form.invalid && form.touched) {
              <p class="err">{{ 'careers.err' | t }}</p>
            }
            <button type="submit" class="dk-btn" [disabled]="sending()">
              {{ (sending() ? 'common.sending' : 'careers.send') | t }}
            </button>
          </form>
        }
      </div>
    </section>
  `,
  styles: `
    .perks h3 {
      margin: 0 0 6px;
      font-size: 1.05rem;
    }
    .perks p {
      margin: 0;
    }
    .count {
      color: var(--lx-gold);
      font-size: 1rem;
      vertical-align: middle;
    }
    .jobs {
      display: grid;
      gap: 10px;
      margin-top: 18px;
    }
    .job {
      border: 1px solid var(--lx-line);
      background: var(--lx-surface);
    }
    .job.open {
      border-color: var(--lx-gold);
    }
    .job-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      width: 100%;
      padding: 18px 20px;
      border: 0;
      background: none;
      color: var(--lx-text);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .job-head strong {
      display: block;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .job-head small {
      color: var(--lx-muted);
    }
    .sign {
      color: var(--lx-gold);
      font-size: 1.4rem;
    }
    .job-body {
      padding: 0 20px 20px;
      color: var(--lx-soft);
    }
    .cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 10px 0 18px;
    }
    .cols h3 {
      margin: 0 0 6px;
      font-size: 0.95rem;
      color: var(--lx-text);
    }
    .cols ul {
      margin: 0;
      padding-left: 18px;
    }
    .cols li {
      margin: 4px 0;
    }
    .apply h2 {
      margin-top: 0;
    }
    .fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin: 16px 0;
      position: relative;
    }
    .f {
      display: grid;
      gap: 6px;
    }
    .f.span {
      grid-column: 1 / -1;
    }
    .f span {
      color: var(--lx-muted);
      font-size: 0.74rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .f input,
    .f select,
    .f textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--lx-line);
      border-radius: 0;
      background: var(--lx-bg);
      color: var(--lx-text);
      font: inherit;
      color-scheme: dark;
    }
    .f input:focus,
    .f select:focus,
    .f textarea:focus {
      outline: none;
      border-color: var(--lx-gold);
    }
    .f .bad {
      border-color: #eb6b6b;
    }
    .err {
      color: #eb6b6b;
    }
    .hp {
      position: absolute;
      left: -9999px;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
    @media (max-width: 700px) {
      .cols,
      .fields {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class CareersPage {
  private supportService = inject(SupportService);
  private cdr = inject(ChangeDetectorRef);

  private i18n = inject(I18nService);

  // pozicionet dhe përfitimet vijnë nga JSON-i i gjuhës së zgjedhur
  jobs(): Job[] {
    return this.i18n.list<Job>('careers.jobs');
  }

  perks(): { t: string; d: string }[] {
    return this.i18n.list<{ t: string; d: string }>('careers.perks');
  }

  openJob = signal<string | null>('support');
  sending = signal(false);
  sent = signal<number | null>(null);
  error = signal<string | null>(null);

  form = new FormGroup({
    position: new FormControl('', { nonNullable: true }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
    cv: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^https?:\/\/\S+$/)],
    }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(20), Validators.maxLength(1500)],
    }),
    website: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.form.patchValue({ position: this.jobs()[0]?.title ?? '' });
    this.form.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => this.cdr.markForCheck());
  }

  toggle(id: string) {
    this.openJob.update((cur) => (cur === id ? null : id));
  }

  apply(job: Job) {
    this.sent.set(null);
    this.form.patchValue({ position: job.title });
    document.getElementById('apliko')?.scrollIntoView({ behavior: 'smooth' });
  }

  bad(name: 'name' | 'email' | 'cv' | 'message'): boolean {
    const c = this.form.controls[name];
    return c.invalid && c.touched;
  }

  send() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.sending.set(true);
    this.error.set(null);
    this.supportService
      .send({
        topic: 'CAREER',
        name: v.name.trim(),
        email: v.email.trim(),
        phone: v.phone.trim() || null,
        bookingCode: null,
        message: `Pozicioni: ${v.position}\nCV: ${v.cv.trim()}\n\n${v.message.trim()}`,
        website: v.website,
      })
      .subscribe({
        next: (t) => {
          this.sending.set(false);
          this.sent.set(t.id);
          this.form.reset({ position: v.position });
        },
        error: (err) => {
          this.sending.set(false);
          this.error.set(errorMessage(err, this.i18n.t('careers.error')));
        },
      });
  }
}
