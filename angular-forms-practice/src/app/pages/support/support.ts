import { ChangeDetectorRef, Component, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { FaqGroup, FaqItem } from '../../core/faq';
import { errorMessage } from '../../core/http-error';
import { SUPPORT_CONTACT, SUPPORT_TOPIC_LABELS, SUPPORT_TOPICS } from '../../core/labels';
import { SupportTicket, SupportTopic } from '../../core/models';
import { SupportService } from '../../core/support.service';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../shared/t.pipe';

// Faqja e ndihmës: pyetje të shpeshta, kontakt i shpejtë dhe formular (pa llogari)
@Component({
  selector: 'app-support',
  imports: [ReactiveFormsModule, RouterLink, TPipe],
  templateUrl: './support.html',
  styleUrl: './support.css'
})
export class SupportPage implements OnInit {

  private supportService = inject(SupportService);
  private i18n = inject(I18nService);
  private cdr = inject(ChangeDetectorRef);

  // /ndihme?kodi=BCA-2026-0001&tema=CANCELLATION
  readonly kodi = input<string>();
  readonly tema = input<string>();

  readonly contact = SUPPORT_CONTACT;
  readonly topics = SUPPORT_TOPICS;
  readonly topicLabels = SUPPORT_TOPIC_LABELS;

  whatsappUrl(): string {
    return `https://wa.me/${SUPPORT_CONTACT.whatsapp}?text=${encodeURIComponent(this.i18n.t('support.whatsappText'))}`;
  }

  // nga një pyetje nga çdo grup (në gjuhën e zgjedhur); të gjitha janë te /pyetje
  faqs(): FaqItem[] {
    return this.i18n.list<FaqGroup>('faq.groups').map(g => g.items[0]).filter(Boolean);
  }

  openFaq = signal<number | null>(0);
  sending = signal(false);
  sent = signal<SupportTicket | null>(null);
  error = signal<string | null>(null);

  form = new FormGroup({
    topic: new FormControl<SupportTopic>('BOOKING', { nonNullable: true, validators: [Validators.required] }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    phone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
    bookingCode: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
    message: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]
    }),
    website: new FormControl('', { nonNullable: true })   // kurth për robotët (i fshehur)
  });

  constructor() {
    this.form.statusChanges.pipe(takeUntilDestroyed()).subscribe(() => this.cdr.markForCheck());
  }

  ngOnInit() {
    const code = this.kodi();
    const topic = this.tema() as SupportTopic | undefined;
    this.form.patchValue({
      bookingCode: code ?? '',
      topic: topic && SUPPORT_TOPICS.includes(topic) ? topic : 'BOOKING'
    });
  }

  toggleFaq(i: number) {
    this.openFaq.update(cur => (cur === i ? null : i));
  }

  isInvalid(name: 'name' | 'email' | 'phone' | 'bookingCode' | 'message'): boolean {
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

    this.supportService.send({
      topic: v.topic,
      name: v.name.trim(),
      email: v.email.trim(),
      phone: v.phone.trim() || null,
      bookingCode: v.bookingCode.trim().toUpperCase() || null,
      message: v.message.trim(),
      website: v.website
    }).subscribe({
      next: ticket => {
        this.sending.set(false);
        this.sent.set(ticket);
        this.form.reset({ topic: 'BOOKING' });
      },
      error: err => {
        this.sending.set(false);
        this.error.set(errorMessage(err, this.i18n.t('support.error')));
      }
    });
  }

  newMessage() {
    this.sent.set(null);
  }
}
