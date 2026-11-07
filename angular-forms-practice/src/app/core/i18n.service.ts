import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

// Gjuhët e faqes. Përkthimet janë te public/i18n/<kodi>.json
// Për të shtuar një gjuhë: shto rreshtin këtu + skedarin JSON.
export const LANGUAGES = [
  { code: 'sq', label: 'Shqip', short: 'SQ' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'it', label: 'Italiano', short: 'IT' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'el', label: 'Ελληνικά', short: 'EL' },
  { code: 'tr', label: 'Türkçe', short: 'TR' }
] as const;

export type Lang = (typeof LANGUAGES)[number]['code'];

type Dict = Record<string, unknown>;

const STORAGE_KEY = 'bookers.lang';
const DEFAULT_LANG: Lang = 'sq';

// Për kod jashtë komponentëve (p.sh. mesazhet e gabimeve). Vendoset nga I18nService.
let activeTranslate: (key: string, params?: Record<string, unknown>) => string = key => key;
export function translate(key: string, params?: Record<string, unknown>): string {
  return activeTranslate(key, params);
}

// Tekste që vijnë nga serveri ose databaza (në shqip) → përkthimi nga seksioni "text" i JSON-it
let activeText: (value: string) => string = value => value;
export function translateText(value: string): string {
  return activeText(value);
}

// "  a \r\n b " → "a\nb" (që krahasimi të mos varet nga hapësirat)
function normalizeText(value: string): string {
  return value.replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).join('\n').trim();
}

function isLang(v: unknown): v is Lang {
  return LANGUAGES.some(l => l.code === v);
}

@Injectable({ providedIn: 'root' })
export class I18nService {

  private http = inject(HttpClient);
  private document = inject(DOCUMENT);

  private readonly _lang = signal<Lang>(DEFAULT_LANG);
  private readonly dict = signal<Dict>({});
  private fallback: Dict = {};                 // shqipja, nëse mungon një përkthim
  private cache = new Map<Lang, Dict>();

  readonly lang = this._lang.asReadonly();
  readonly languages = LANGUAGES;
  readonly current = computed(() => LANGUAGES.find(l => l.code === this._lang())!);

  // "text": { "<teksti në shqip>": "<përkthimi>" }
  private readonly textMap = computed(() => {
    const map = new Map<string, string>();
    const section = this.dict()['text'];
    if (section && typeof section === 'object') {
      for (const [k, v] of Object.entries(section as Dict)) {
        if (typeof v === 'string') {
          map.set(normalizeText(k), v);
        }
      }
    }
    return map;
  });

  // Thirret një herë para se të hapet aplikacioni (app.config.ts)
  async init(): Promise<void> {
    activeTranslate = (key, params) => this.t(key, params);
    activeText = value => this.text(value);
    this.fallback = await this.load(DEFAULT_LANG);
    await this.use(this.initialLang());
  }

  async use(lang: Lang): Promise<void> {
    const dict = await this.load(lang);
    this.dict.set(dict);
    this._lang.set(lang);
    this.document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // injoro
    }
  }

  // t('nav.cars') ose t('cars.count', { n: 5 }) → "5 makina"
  t(key: string, params?: Record<string, unknown>): string {
    const value = this.lookup(this.dict(), key) ?? this.lookup(this.fallback, key);
    let text = typeof value === 'string' ? value : key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.split(`{${k}}`).join(String(v ?? ''));
      }
    }
    return text;
  }

  // Përkthen një tekst që vjen nga serveri/databaza (p.sh. përshkrimi i makinës, mesazhi i gabimit).
  // Nëse nuk ka përkthim, kthehet teksti origjinal.
  text(value: string | null | undefined): string {
    if (!value) {
      return value ?? '';
    }
    return this.textMap().get(normalizeText(value)) ?? value;
  }

  // Artikujt e blogut: "blogPosts": { "<slug>": { "title", "excerpt", "content" } }
  localizePost<T extends { slug: string; title: string; excerpt: string; content?: string }>(post: T): T {
    const tr = this.lookup(this.dict(), `blogPosts.${post.slug}`) as Partial<Record<'title' | 'excerpt' | 'content', string>> | undefined;
    if (!tr || typeof tr !== 'object') {
      return post;
    }
    return {
      ...post,
      title: tr.title ?? post.title,
      excerpt: tr.excerpt ?? post.excerpt,
      ...(post.content !== undefined && tr.content ? { content: tr.content } : {})
    };
  }

  // Për lista (p.sh. pyetjet e shpeshta, pozicionet e punës)
  list<T>(key: string): T[] {
    const value = this.lookup(this.dict(), key) ?? this.lookup(this.fallback, key);
    return Array.isArray(value) ? (value as T[]) : [];
  }

  private lookup(dict: Dict, key: string): unknown {
    let cur: unknown = dict;
    for (const part of key.split('.')) {
      if (cur && typeof cur === 'object' && part in (cur as Dict)) {
        cur = (cur as Dict)[part];
      } else {
        return undefined;
      }
    }
    return cur;
  }

  private async load(lang: Lang): Promise<Dict> {
    const cached = this.cache.get(lang);
    if (cached) {
      return cached;
    }
    try {
      const dict = await firstValueFrom(this.http.get<Dict>(`/i18n/${lang}.json`));
      this.cache.set(lang, dict);
      return dict;
    } catch {
      return {};
    }
  }

  private initialLang(): Lang {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) {
        return saved;
      }
    } catch {
      // injoro
    }
    // gjuha e shfletuesit, nëse e kemi
    const browser = (navigator.language || '').slice(0, 2).toLowerCase();
    return isLang(browser) ? browser : DEFAULT_LANG;
  }
}
