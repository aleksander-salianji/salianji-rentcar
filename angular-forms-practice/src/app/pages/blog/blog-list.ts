import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { BlogService } from '../../core/blog.service';
import { errorMessage } from '../../core/http-error';
import { imageSrc } from '../../core/images';
import { BlogPostSummary } from '../../core/models';

// /blog — lista e artikujve
@Component({
  selector: 'app-blog-list',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="container blog-hero">
      <p class="label">Blogu · Bookers Car Albania</p>
      <h1 class="serif">Udhëtime dhe këshilla</h1>
      <p>Itinerare nëpër Shqipëri, këshilla për qiranë e makinës dhe ofertat e kompanive partnere.</p>
    </section>

    <section class="container">
      @if (categories().length > 1) {
        <div class="tabs">
          <button type="button" [class.active]="category() === ''" (click)="category.set('')">Të gjitha</button>
          @for (c of categories(); track c) {
            <button type="button" [class.active]="category() === c" (click)="category.set(c)">{{ c }}</button>
          }
        </div>
      } @else {
        <div style="height: 26px"></div>
      }

      @if (loading()) {
        <p class="loading">Duke ngarkuar...</p>
      } @else if (error()) {
        <p class="empty">{{ error() }}</p>
      } @else {
        <div class="grid">
          @for (p of shown(); track p.id; let first = $first) {
            <a class="post-card" [class.featured]="first && category() === ''" [routerLink]="['/blog', p.slug]">
              <div class="cover">
                @if (imageSrc(p.coverImageUrl); as src) {
                  <img [src]="src" [alt]="p.title" loading="lazy">
                } @else {
                  <div class="cover-empty">B</div>
                }
              </div>
              <div class="card-body">
                <span class="label">{{ p.category }}</span>
                <h2 class="serif">{{ p.title }}</h2>
                <p>{{ p.excerpt }}</p>
                <span class="meta">{{ p.publishedAt | date:'d MMMM yyyy' }} · {{ p.readMinutes }} min lexim</span>
                <span class="more">Lexo →</span>
              </div>
            </a>
          } @empty {
            <p class="empty">Ende nuk ka artikuj.</p>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './blog.css'
})
export class BlogListPage {

  private blogService = inject(BlogService);
  readonly imageSrc = imageSrc;

  posts = signal<BlogPostSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  category = signal('');

  categories = computed(() => [...new Set(this.posts().map(p => p.category))]);
  shown = computed(() => {
    const c = this.category();
    return this.posts().filter(p => !c || p.category === c);
  });

  constructor() {
    this.blogService.list().subscribe({
      next: list => {
        this.posts.set(list);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      }
    });
  }
}
