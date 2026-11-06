import { Component, computed, inject, input, LOCALE_ID, signal } from '@angular/core';
import { DecimalPipe, formatDate } from '@angular/common';

import { RevenuePeriod, RevenuePoint } from '../core/models';

interface ChartPoint {
  x: number;
  y: number;
  label: string;
  fullLabel: string;
  point: RevenuePoint;
  change: number | null;       // ndryshimi në % kundrejt pikës së mëparshme
  direction: 'up' | 'down' | 'same' | 'new';
}

// Ndryshimi në përqindje (null kur periudha e mëparshme ishte 0)
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / previous) * 100;
}

// Rrumbullakos maksimumin e boshtit Y në një vlerë të "bukur" (100, 250, 300...)
function niceMax(value: number): number {
  if (value <= 0) {
    return 100;
  }
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  return (Math.ceil((value / magnitude) * 2) / 2) * magnitude;
}

// Grafik me vijë që tregon si lëviz xhiroja: pikat e gjelbra = rritje, të kuqet = rënie
@Component({
  selector: 'app-revenue-chart',
  imports: [DecimalPipe],
  template: `
    <div class="chart">
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" role="img" aria-label="Grafiku i xhiros">
        <defs>
          <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f28c28" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#f28c28" stop-opacity="0" />
          </linearGradient>
        </defs>

        <!-- vijat horizontale dhe vlerat -->
        @for (g of grid(); track g.y) {
          <line [attr.x1]="PL" [attr.x2]="W - PR" [attr.y1]="g.y" [attr.y2]="g.y" class="grid" />
          <text [attr.x]="PL - 8" [attr.y]="g.y + 4" class="axis" text-anchor="end">{{ g.value | number:'1.0-0' }} €</text>
        }

        <!-- sipërfaqja dhe vija -->
        <path [attr.d]="areaPath()" fill="url(#revenueArea)" />
        <path [attr.d]="linePath()" class="line" />

        <!-- vija vertikale e pikës së zgjedhur -->
        @if (active(); as a) {
          <line [attr.x1]="a.x" [attr.x2]="a.x" [attr.y1]="PT" [attr.y2]="H - PB" class="cursor" />
        }

        <!-- pikat -->
        @for (c of coords(); track c.point.start; let i = $index) {
          <circle [attr.cx]="c.x" [attr.cy]="c.y" [attr.r]="hovered() === i ? 6 : 4"
                  [class]="'dot ' + c.direction" />
        }

        <!-- etiketat e boshtit X -->
        @for (c of xLabels(); track c.point.start) {
          <text [attr.x]="c.x" [attr.y]="H - 10" class="axis" text-anchor="middle">{{ c.label }}</text>
        }

        <!-- zona të padukshme për hover / prekje -->
        @for (c of coords(); track c.point.start; let i = $index) {
          <rect [attr.x]="c.x - colWidth() / 2" [attr.y]="PT" [attr.width]="colWidth()" [attr.height]="H - PT - PB"
                fill="transparent" (mouseenter)="hovered.set(i)" (click)="hovered.set(i)" />
        }
      </svg>

      @if (active(); as a) {
        <div class="tooltip" [style.left.%]="(a.x / W) * 100" [style.top.%]="(a.y / H) * 100">
          <strong>{{ a.fullLabel }}</strong>
          <span>{{ a.point.revenue | number:'1.0-2' }} € · {{ a.point.bookings }} rezervime</span>
          @switch (a.direction) {
            @case ('up') { <span class="up">▲ +{{ a.change | number:'1.0-0' }}% nga më parë</span> }
            @case ('down') { <span class="down">▼ {{ a.change | number:'1.0-0' }}% nga më parë</span> }
            @case ('new') { <span class="up">▲ e re (më parë 0 €)</span> }
            @default { <span class="muted">= pa ndryshim</span> }
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .chart { position: relative; }
    svg { display: block; width: 100%; height: auto; overflow: visible; }
    .grid { stroke: var(--border); stroke-width: 1; }
    .axis { fill: var(--muted); font-size: 11px; }
    .line { fill: none; stroke: var(--accent); stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; }
    .cursor { stroke: var(--navy-2); stroke-width: 1; stroke-dasharray: 3 3; }
    .dot { stroke: #fff; stroke-width: 2; transition: r .1s; }
    .dot.up, .dot.new { fill: #2e9d5b; }
    .dot.down { fill: #d64545; }
    .dot.same { fill: #9aa3b5; }
    .tooltip {
      position: absolute;
      transform: translate(-50%, calc(-100% - 12px));
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 150px;
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--navy);
      color: #fff;
      font-size: .8rem;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 4px 14px rgba(0, 0, 0, .2);
    }
    .tooltip .up { color: #7be0a4; }
    .tooltip .down { color: #ff9b9b; }
    .tooltip .muted { color: #a9b4cc; }
  `,
  host: { '(mouseleave)': 'hovered.set(null)' }
})
export class RevenueChart {

  private locale = inject(LOCALE_ID);

  readonly points = input.required<RevenuePoint[]>();
  readonly period = input.required<RevenuePeriod>();

  // përmasat e SVG-së
  readonly W = 720;
  readonly H = 260;
  readonly PL = 60;
  readonly PR = 16;
  readonly PT = 20;
  readonly PB = 34;

  hovered = signal<number | null>(null);

  private maxValue = computed(() => niceMax(Math.max(0, ...this.points().map(p => p.revenue))));

  coords = computed<ChartPoint[]>(() => {
    const pts = this.points();
    const n = pts.length;
    const plotW = this.W - this.PL - this.PR;
    const plotH = this.H - this.PT - this.PB;
    const max = this.maxValue();

    return pts.map((p, i) => {
      const prev = i > 0 ? pts[i - 1].revenue : null;
      const change = prev === null ? 0 : percentChange(p.revenue, prev);
      const direction: ChartPoint['direction'] =
        prev === null || change === 0 ? 'same'
          : change === null ? 'new'
          : change > 0 ? 'up' : 'down';

      return {
        x: this.PL + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1)),
        y: this.PT + plotH - (p.revenue / max) * plotH,
        label: this.shortLabel(p),
        fullLabel: this.fullLabel(p),
        point: p,
        change,
        direction
      };
    });
  });

  linePath = computed(() =>
    this.coords().map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ')
  );

  areaPath = computed(() => {
    const c = this.coords();
    if (!c.length) {
      return '';
    }
    const base = this.H - this.PB;
    return `${this.linePath()} L ${c[c.length - 1].x.toFixed(1)} ${base} L ${c[0].x.toFixed(1)} ${base} Z`;
  });

  grid = computed(() => {
    const plotH = this.H - this.PT - this.PB;
    return [0, 0.25, 0.5, 0.75, 1].map(f => ({
      y: this.PT + plotH - f * plotH,
      value: this.maxValue() * f
    }));
  });

  // Mos i shfaq të gjitha etiketat kur ka shumë pika (p.sh. 30 ditë)
  xLabels = computed(() => {
    const c = this.coords();
    const step = Math.ceil(c.length / 8);
    return c.filter((_, i) => i % step === 0 || i === c.length - 1);
  });

  colWidth = computed(() => {
    const n = this.coords().length;
    return n > 1 ? (this.W - this.PL - this.PR) / (n - 1) : this.W - this.PL - this.PR;
  });

  active = computed(() => {
    const i = this.hovered();
    return i === null ? null : this.coords()[i] ?? null;
  });


  private shortLabel(p: RevenuePoint): string {
    switch (this.period()) {
      case 'DAY': return formatDate(p.start, 'dd/MM', this.locale);
      case 'WEEK': return formatDate(p.start, 'dd/MM', this.locale);
      default: return formatDate(p.start, 'MMM yy', this.locale);   // MONTH
    }
  }

  private fullLabel(p: RevenuePoint): string {
    switch (this.period()) {
      case 'DAY': return formatDate(p.start, 'EEEE, dd/MM/yyyy', this.locale);
      case 'WEEK': return `Java ${formatDate(p.start, 'dd/MM', this.locale)} – ${formatDate(p.end, 'dd/MM/yyyy', this.locale)}`;
      default: return formatDate(p.start, 'MMMM yyyy', this.locale); // MONTH
    }
  }
}
