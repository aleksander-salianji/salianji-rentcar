import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { errorMessage } from '../../core/http-error';
import { SUPPORT_TOPIC_LABELS } from '../../core/labels';
import { SupportStatus, SupportTicket } from '../../core/models';
import { SupportService } from '../../core/support.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../shared/t.pipe';

type Filter = SupportStatus | 'ALL';

// Kërkesat për ndihmë nga klientët
@Component({
  selector: 'app-admin-support',
  imports: [DatePipe, TPipe],
  template: `
    <div class="page-head">
      <div>
        <h1>{{ 'admin.nav.support' | t }}</h1>
        <p>{{ 'admin.sup.subtitle' | t }}</p>
      </div>
    </div>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    <div class="tabs">
      @for (f of filters; track f.key) {
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          [class.active]="filter() === f.key"
          (click)="filter.set(f.key)"
        >
          {{ f.label | t }} <span class="count">{{ counts()[f.key] }}</span>
        </button>
      }
    </div>

    @if (loading()) {
      <div class="loading"><span class="spinner"></span> {{ 'common.loading' | t }}</div>
    } @else {
      <div class="list">
        @for (t of shown(); track t.id) {
          <article class="card ticket" [class.resolved]="t.status === 'RESOLVED'">
            <div class="ticket-head">
              <div>
                <strong>#{{ t.id }} · {{ 'enum.supportTopic.' + t.topic | t }}</strong>
                @if (t.status === 'OPEN') {
                  <span class="badge badge-PENDING">{{ 'admin.sup.open' | t }}</span>
                } @else {
                  <span class="badge badge-CONFIRMED">{{ 'admin.sup.resolved' | t }}</span>
                }
                <div class="muted small">
                  {{ t.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                  @if (t.resolvedAt) {
                    · {{ 'admin.sup.resolvedOn' | t }} {{ t.resolvedAt | date: 'dd/MM HH:mm' }}
                  }
                </div>
              </div>
              <div class="actions">
                <a class="btn btn-ghost btn-sm" [href]="replyLink(t)">{{
                  'admin.sup.reply' | t
                }}</a>
                @if (t.phone) {
                  <a class="btn btn-ghost btn-sm" [href]="'tel:' + t.phone">{{
                    'admin.sup.call' | t
                  }}</a>
                }
                @if (t.status === 'OPEN') {
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    [disabled]="busyId() === t.id"
                    (click)="setStatus(t, 'RESOLVED')"
                  >
                    {{ 'admin.sup.resolved' | t }} ✓
                  </button>
                } @else {
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    [disabled]="busyId() === t.id"
                    (click)="setStatus(t, 'OPEN')"
                  >
                    {{ 'admin.sup.reopen' | t }}
                  </button>
                }
              </div>
            </div>
            <p class="who">
              <strong>{{ t.name }}</strong> · {{ t.email }}
              @if (t.phone) {
                · {{ t.phone }}
              }
              @if (t.bookingCode) {
                · {{ 'admin.sup.booking' | t }} <strong>{{ t.bookingCode }}</strong>
              }
            </p>
            <p class="msg">{{ t.message }}</p>
          </article>
        } @empty {
          <p class="empty">{{ 'admin.sup.none' | t }}</p>
        }
      </div>
    }
  `,
  styles: `
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 14px;
    }
    .tabs button.active {
      background: var(--navy);
      color: #fff;
      border-color: var(--navy);
    }
    .count {
      opacity: 0.7;
      margin-left: 4px;
    }
    .list {
      display: grid;
      gap: 12px;
    }
    .ticket {
      border-left: 4px solid var(--accent);
    }
    .ticket.resolved {
      border-left-color: var(--border);
      opacity: 0.8;
    }
    .ticket-head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 10px;
    }
    .ticket-head .badge {
      margin-left: 8px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: flex-start;
    }
    .who {
      margin: 10px 0 6px;
      font-size: 0.92rem;
    }
    .msg {
      margin: 0;
      white-space: pre-wrap;
    }
  `,
})
export class AdminSupport {
  readonly i18n = inject(I18nService);

  private supportService = inject(SupportService);

  readonly topicLabels = SUPPORT_TOPIC_LABELS;
  readonly filters: { key: Filter; label: string }[] = [
    { key: 'OPEN', label: 'admin.sup.openPl' },
    { key: 'RESOLVED', label: 'admin.sup.resolvedPl' },
    { key: 'ALL', label: 'common.all' },
  ];

  tickets = signal<SupportTicket[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  busyId = signal<number | null>(null);
  filter = signal<Filter>('OPEN');

  counts = computed(() => {
    const list = this.tickets();
    return {
      ALL: list.length,
      OPEN: list.filter((t) => t.status === 'OPEN').length,
      RESOLVED: list.filter((t) => t.status === 'RESOLVED').length,
    };
  });

  shown = computed(() => {
    const f = this.filter();
    return this.tickets().filter((t) => f === 'ALL' || t.status === f);
  });

  constructor() {
    this.supportService.list().subscribe({
      next: (list) => {
        this.tickets.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  replyLink(t: SupportTicket): string {
    const subject = `Re: ${this.i18n.t('nav.help')} #${t.id}${t.bookingCode ? ' – ' + t.bookingCode : ''}`;
    return `mailto:${t.email}?subject=${encodeURIComponent(subject)}`;
  }

  setStatus(t: SupportTicket, status: SupportStatus) {
    this.busyId.set(t.id);
    this.supportService.setStatus(t.id, status).subscribe({
      next: (updated) => {
        this.tickets.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
        this.busyId.set(null);
      },
      error: (err) => {
        this.error.set(errorMessage(err));
        this.busyId.set(null);
      },
    });
  }
}
