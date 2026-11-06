import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_URL } from './config';
import { BlogPost, BlogPostRequest, BlogPostSummary } from './models';

@Injectable({ providedIn: 'root' })
export class BlogService {

  private http = inject(HttpClient);

  // ---------- PUBLIKE ----------

  list(): Observable<BlogPostSummary[]> {
    return this.http.get<BlogPostSummary[]>(`${API_URL}/blog`);
  }

  get(slug: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${API_URL}/blog/${encodeURIComponent(slug)}`);
  }

  // ---------- ADMIN ----------

  adminList(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${API_URL}/admin/blog`);
  }

  create(request: BlogPostRequest): Observable<BlogPost> {
    return this.http.post<BlogPost>(`${API_URL}/admin/blog`, request);
  }

  update(id: number, request: BlogPostRequest): Observable<BlogPost> {
    return this.http.put<BlogPost>(`${API_URL}/admin/blog/${id}`, request);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/admin/blog/${id}`);
  }

  uploadImage(id: number, image: Blob, fileName = 'foto.jpg'): Observable<BlogPost> {
    const form = new FormData();
    form.append('file', image, fileName);
    return this.http.post<BlogPost>(`${API_URL}/admin/blog/${id}/image`, form);
  }
}

// ---------- PËRMBAJTJA ----------
// Teksti i artikullit ndahet në blloqe (pa HTML, pra i sigurt):
//   "## Titull" → nëntitull · "- pikë" → listë · rresht bosh → paragraf i ri
// Një tip i vetëm (jo union), që template-i ta lexojë pa gabime tipi
export interface BlogBlock {
  kind: 'h' | 'p' | 'ul';
  text: string;
  items: string[];
}

export function parseBlogContent(content: string): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'p', text: paragraph.join(' '), items: [] });
      paragraph = [];
    }
    if (list.length) {
      blocks.push({ kind: 'ul', text: '', items: list });
      list = [];
    }
  };

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (line.startsWith('## ')) {
      flush();
      blocks.push({ kind: 'h', text: line.slice(3).trim(), items: [] });
    } else if (/^[-•*] /.test(line)) {
      if (paragraph.length) {
        blocks.push({ kind: 'p', text: paragraph.join(' '), items: [] });
        paragraph = [];
      }
      list.push(line.slice(2).trim());
    } else {
      if (list.length) {
        blocks.push({ kind: 'ul', text: '', items: list });
        list = [];
      }
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
