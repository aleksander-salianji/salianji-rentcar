import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { BlogService } from '../../core/blog.service';
import { errorMessage } from '../../core/http-error';
import { imageSrc, resizeImage } from '../../core/images';
import { BLOG_CATEGORIES } from '../../core/labels';
import { BlogPost, BlogPostRequest } from '../../core/models';
import { I18nService } from '../../core/i18n.service';
import { TPipe } from '../../shared/t.pipe';
import { PlacePipe } from '../../shared/place.pipe';

// Paneli → Blogu: shkruaj, ndrysho, publiko artikuj
@Component({
  selector: 'app-admin-blog',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, TPipe, PlacePipe],
  templateUrl: './admin-blog.html',
  styles: `
    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 460px; gap: 20px; align-items: start; }
    .editor { position: sticky; top: 88px; }
    .editor h2 { font-size: 1.15rem; }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
    .thumb { width: 72px; height: 48px; object-fit: cover; border-radius: 6px; background: var(--bg); display: block; }
    .cover-box { display: grid; grid-template-columns: 120px 1fr; gap: 12px; align-items: center; }
    .cover-box img, .cover-empty { width: 120px; height: 72px; object-fit: cover; border-radius: 8px; background: var(--bg); }
    .cover-empty { display: grid; place-items: center; color: var(--muted); font-size: .8rem; }
    .cover-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .cover-actions label { cursor: pointer; }
    textarea.content { font-family: ui-monospace, Consolas, monospace; font-size: .88rem; line-height: 1.5; }
    .help { margin: 4px 0 0; }
    .mt { margin-top: 12px; }
    @media (max-width: 1100px) {
      .layout { grid-template-columns: 1fr; }
      .editor { position: static; }
    }
  `
})
export class AdminBlog {

  readonly i18n = inject(I18nService);

  private blogService = inject(BlogService);

  readonly categories = BLOG_CATEGORIES;
  readonly imageSrc = imageSrc;

  posts = signal<BlogPost[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  message = signal<string | null>(null);

  editingId = signal<number | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);

  photoFile = signal<File | null>(null);
  photoPreview = signal<string | null>(null);

  form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
    slug: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^[a-z0-9-]*$/), Validators.maxLength(160)] }),
    category: new FormControl(BLOG_CATEGORIES[0], { nonNullable: true, validators: [Validators.required] }),
    excerpt: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    coverImageUrl: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^((https?:\/\/|\/uploads\/).+)?$/)] }),
    published: new FormControl(true, { nonNullable: true })
  });

  constructor() {
    this.blogService.adminList().subscribe({
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

  isInvalid(name: keyof BlogPostRequest): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  edit(p: BlogPost) {
    this.editingId.set(p.id);
    this.formError.set(null);
    this.form.setValue({
      title: p.title,
      slug: p.slug,
      category: p.category,
      excerpt: p.excerpt,
      content: p.content,
      coverImageUrl: p.coverImageUrl ?? '',
      published: p.published
    });
    this.setPhoto(null, imageSrc(p.coverImageUrl));
  }

  newPost() {
    this.editingId.set(null);
    this.formError.set(null);
    this.form.reset({ category: BLOG_CATEGORIES[0], published: true });
    this.setPhoto(null, null);
  }

  onPhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      this.formError.set(this.i18n.t('admin.photoType'));
      return;
    }
    this.formError.set(null);
    this.setPhoto(file, URL.createObjectURL(file));
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const request: BlogPostRequest = {
      title: v.title.trim(),
      slug: v.slug.trim(),
      category: v.category,
      excerpt: v.excerpt.trim(),
      content: v.content,
      coverImageUrl: v.coverImageUrl.trim() || null,
      published: v.published
    };
    const id = this.editingId();
    this.saving.set(true);
    this.formError.set(null);

    try {
      let saved = await firstValueFrom(id === null ? this.blogService.create(request) : this.blogService.update(id, request));
      const file = this.photoFile();
      if (file) {
        saved = await firstValueFrom(this.blogService.uploadImage(saved.id, await resizeImage(file, 1800)));
      }
      this.posts.update(list => (list.some(p => p.id === saved.id)
        ? list.map(p => (p.id === saved.id ? saved : p))
        : [saved, ...list]));
      this.flash(this.i18n.t(id === null ? 'admin.blog.created' : 'admin.saved'));
      this.newPost();
    } catch (err) {
      this.formError.set(errorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  togglePublished(p: BlogPost) {
    const request: BlogPostRequest = {
      title: p.title, slug: p.slug, category: p.category, excerpt: p.excerpt,
      content: p.content, coverImageUrl: p.coverImageUrl, published: !p.published
    };
    this.blogService.update(p.id, request).subscribe({
      next: saved => this.posts.update(list => list.map(x => (x.id === saved.id ? saved : x))),
      error: err => this.error.set(errorMessage(err))
    });
  }

  remove(p: BlogPost) {
    if (!confirm(this.i18n.t('admin.blog.confirmDelete', { title: p.title }))) {
      return;
    }
    this.blogService.remove(p.id).subscribe({
      next: () => {
        this.posts.update(list => list.filter(x => x.id !== p.id));
        if (this.editingId() === p.id) {
          this.newPost();
        }
        this.flash(this.i18n.t('admin.blog.deleted'));
      },
      error: err => this.error.set(errorMessage(err))
    });
  }

  private setPhoto(file: File | null, preview: string | null) {
    const current = this.photoPreview();
    if (current?.startsWith('blob:')) {
      URL.revokeObjectURL(current);
    }
    this.photoFile.set(file);
    this.photoPreview.set(preview);
  }

  private flash(text: string) {
    this.message.set(text);
    setTimeout(() => this.message() === text && this.message.set(null), 3500);
  }
}
