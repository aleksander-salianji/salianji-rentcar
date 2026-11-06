import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import { errorMessage } from '../../core/http-error';
import { SUPPORT_TOPIC_LABELS } from '../../core/labels';
import { SupportStatus, SupportTicket } from '../../core/models';
import { SupportService } from '../../core/support.service';

type Filter = SupportStatus | 'ALL';

// Kërkesat për ndihmë nga klientët
@Component({
  selector: 'app-admin-support',
  imports: [DatePipe],
  template: `
    <div class="page-head">
      <div>
        <h1>Support</h1>
        <p>Mesazhet nga klientët. Përgjigju me email ose telefon, pastaj shënoje si të zgjidhur.</p>
      </div>
    </div>

    @if (error()) {
      <div class="alert alert-error">{{ error() }}</div>
    }

    <div class="tabs">
      @for (f of filters; track f.key) {
        <button type="button" class="btn btn-ghost btn-sm" [class.active]="filter() === f.key" (click)="filter.set(f.key)">
          {{ f.label }} <span class="count">{{ counts()[f.key] }}</span>
        </button>
      }
    </div>

    @if (loading()) {
      <div class="loading"><span class="spinner"></span> Duke ngarkuar...</div>
    } @else {
      <div class="list">
        @for (t of shown(); track t.id) {
          <article class="card ticket" [class.resolved]="t.status === 'RESOLVED'">
            <div class="ticket-head">
              <div>
                <strong>#{{ t.id }} · {{ topicLabels[t.topic] }}</strong>
                @if (t.status === 'OPEN') { <span class="badge badge-PENDING">E hapur</span> }
                @else { <span class="badge badge-CONFIRMED">E zgjidhur</span> }
                <div class="muted small">{{ t.createdAt | date:'dd/MM/yyyy HH:mm' }}
                  @if (t.resolvedAt) { · zgjidhur më {{ t.resolvedAt | date:'dd/MM HH:mm' }} }</div>
              </div>
              <div class="actions">
                <a class="btn btn-ghost btn-sm" [href]="replyLink(t)">Përgjigju me email</a>
                @if (t.phone) { <a class="btn btn-ghost btn-sm" [href]="'tel:' + t.phone">Telefono</a> }
                @if (t.status === 'OPEN') {
                  <button type="button" class="btn btn-primary btn-sm" [disabled]="busyId() === t.id" (click)="setStatus(t, 'RESOLVED')">E zgjidhur ✓</button>
                } @else {
                  <button type="button" class="btn btn-ghost btn-sm" [disabled]="busyId() === t.id" (click)="setStatus(t, 'OPEN')">Rihap</button>
                }
              </div>
            </div>
            <p class="who">
              <strong>{{ t.name }}</strong> · {{ t.email }}
              @if (t.phone) { · {{ t.phone }} }
              @if (t.bookingCode) { · Rezervimi <strong>{{ t.bookingCode }}</strong> }
            </p>
            <p class="msg">{{ t.message }}</p>
          </article>
        } @empty {
          <p class="empty">Nuk ka mesazhe këtu.</p>
        }
      </div>
    }
  `,
  styles: `
    .tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
    .tabs button.active { background: var(--navy); color: #fff; border-color: var(--navy); }
    .count { opacity: .7; margin-left: 4px; }
    .list { display: grid; gap: 12px; }
    .ticket { border-left: 4px solid var(--accent); }
    .ticket.resolved { border-left-color: var(--border); opacity: .8; }
    .ticket-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; }
    .ticket-head .badge { margin-left: 8px; }
    .actions { display: flex; flex-wrap: wrap; gap: 6px; align-items: flex-start; }
    .who { margin: 10px 0 6px; font-size: .92rem; }
    .msg { margin: 0; white-space: pre-wrap; }
  `
})
export class AdminSupport {

  private supportService = inject(SupportService);

  readonly topicLabels = SUPPORT_TOPIC_LABELS;
  readonly filters: { key: Filter; label: string }[] = [
    { key: 'OPEN', label: 'Të hapura' },
    { key: 'RESOLVED', label: 'Të zgjidhura' },
    { key: 'ALL', label: 'Të gjitha' }
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
      OPEN: list.filter(t => t.status === 'OPEN').length,
      RESOLVED: list.filter(t => t.status === 'RESOLVED').length
    };
  });

  shown = computed(() => {
    const f = this.filter();
    return this.tickets().filter(t => f === 'ALL' || t.status === f);
  });

  constructor() {
    this.supportService.list().subscribe({
      next: list => {
        this.tickets.set(list);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }

  replyLink(t: SupportTicket): string {
    const subject = `Re: Ndihmë #${t.id}${t.bookingCode ? ' – ' + t.bookingCode : ''}`;
    return `mailto:${t.email}?subject=${encodeURIComponent(subject)}`;
  }

  setStatus(t: SupportTicket, status: SupportStatus) {
    this.busyId.set(t.id);
    this.supportService.setStatus(t.id, status).subscribe({
      next: updated => {
        this.tickets.update(list => list.map(x => (x.id === updated.id ? updated : x)));
        this.busyId.set(null);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.busyId.set(null);
      }
    });
  }
}
