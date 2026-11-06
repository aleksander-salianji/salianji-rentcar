import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { BlogBlock, BlogService, parseBlogContent } from '../../core/blog.service';
import { errorMessage } from '../../core/http-error';
import { imageSrc } from '../../core/images';
import { BlogPost, BlogPostSummary } from '../../core/models';

// /blog/:slug — një artikull
@Component({
  selector: 'app-blog-post',
  imports: [RouterLink, DatePipe],
  template: `
    @if (loading()) {
      <p class="state">Duke ngarkuar...</p>
    } @else if (error()) {
      <div class="container state">
        <p>{{ error() }}</p>
        <a routerLink="/blog" class="back">← Të gjithë artikujt</a>
      </div>
    } @else if (post(); as p) {
      <article>
        <header class="container article">
          <a routerLink="/blog" class="back">← Blogu</a>
          <h1 class="serif">{{ p.title }}</h1>
          <p class="meta"><span class="label">{{ p.category }}</span><br>
            {{ p.publishedAt | date:'d MMMM yyyy' }} · {{ p.readMinutes }} min lexim</p>
          <p class="lead">{{ p.excerpt }}</p>
        </header>

        @if (imageSrc(p.coverImageUrl); as src) {
          <div class="container"><div class="cover"><img [src]="src" [alt]="p.title"></div></div>
        }

        <div class="container article content">
          @for (b of blocks(); track $index) {
            @if (b.kind === 'h') {
              <h2>{{ b.text }}</h2>
            } @else if (b.kind === 'ul') {
              <ul>
                @for (item of b.items; track $index) { <li>{{ item }}</li> }
              </ul>
            } @else {
              <p>{{ b.text }}</p>
            }
          }

          <aside class="cta">
            <div>
              <h3>Gati për udhëtim?</h3>
              <p>Krahaso makinat e kompanive partnere dhe rezervo pa llogari.</p>
            </div>
            <a class="gold-btn" routerLink="/makinat">Shiko makinat</a>
          </aside>
        </div>
      </article>

      @if (others().length) {
        <section class="container others">
          <p class="label">Lexo edhe</p>
          <div class="others-grid">
            @for (o of others(); track o.id) {
              <a class="other" [routerLink]="['/blog', o.slug]">
                <span>{{ o.category }}</span>
                <strong>{{ o.title }}</strong>
                <span>{{ o.readMinutes }} min lexim</span>
              </a>
            }
          </div>
        </section>
      }
    }
  `,
  styleUrl: './blog-post.css'
})
export class BlogPostPage {

  private blogService = inject(BlogService);
  private title = inject(Title);

  readonly slug = input.required<string>();
  readonly imageSrc = imageSrc;

  post = signal<BlogPost | null>(null);
  all = signal<BlogPostSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  blocks = computed<BlogBlock[]>(() => parseBlogContent(this.post()?.content ?? ''));
  others = computed(() => this.all().filter(p => p.slug !== this.slug()).slice(0, 3));

  constructor() {
    this.blogService.list().subscribe({ next: list => this.all.set(list), error: () => { /* injoro */ } });

    // ringarkohet kur kalon nga një artikull te tjetri
    effect(() => {
      const slug = this.slug();
      this.loading.set(true);
      this.error.set(null);
      this.blogService.get(slug).subscribe({
        next: p => {
          this.post.set(p);
          this.title.setTitle(`${p.title} | Bookers Car Albania`);
          this.loading.set(false);
          window.scrollTo(0, 0);
        },
        error: err => {
          this.error.set(errorMessage(err, 'Artikulli nuk u gjet.'));
          this.loading.set(false);
        }
      });
    });
  }
}
