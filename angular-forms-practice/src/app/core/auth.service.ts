import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { API_URL } from './config';
import { AuthResponse, LoginRequest, User } from './models';

const TOKEN_KEY = 'salianji.token';
const USER_KEY = 'salianji.user';

// localStorage mund të mos jetë i disponueshëm (p.sh. dritare private) — prandaj try/catch
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // injoro
  }
}

function readUser(): User | null {
  const raw = readStorage(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    const user = JSON.parse(raw) as User;
    // llogaritë e vjetra të klientëve nuk hyjnë më
    return user.role === 'ADMIN' || user.role === 'COMPANY' ? user : null;
  } catch {
    return null;
  }
}


// Login vetëm për bizneset partnere dhe adminin. Klientët rezervojnë pa llogari.
@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _user = signal<User | null>(readStorage(TOKEN_KEY) ? readUser() : null);

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly isCompany = computed(() => this._user()?.role === 'COMPANY');

  // Ku të shkojë përdoruesi pas login-it
  readonly panelUrl = computed(() => (this.isAdmin() ? '/admin' : this.isCompany() ? '/paneli' : '/'));

  readonly displayName = computed(() => {
    const u = this._user();
    if (!u) {
      return '';
    }
    return u.role === 'COMPANY' ? (u.companyName ?? u.firstName) : `${u.firstName} ${u.lastName}`.trim();
  });

  constructor() {
    // token i mbetur nga një llogari e vjetër klienti → pastroje
    if (this.token && !this._user()) {
      writeStorage(TOKEN_KEY, null);
      writeStorage(USER_KEY, null);
    }
  }

  get token(): string | null {
    return readStorage(TOKEN_KEY);
  }


  login(request: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, request).pipe(
      tap(res => this.startSession(res)),
      map(res => res.user)
    );
  }

  // Rifreskon të dhënat e përdoruesit nga serveri (thirret kur hapet aplikacioni)
  refreshCurrentUser(): void {
    if (!this.token) {
      return;
    }
    this.http.get<User>(`${API_URL}/auth/me`).subscribe({
      next: user => this.setUser(user),
      error: () => {
        // 401 trajtohet nga interceptor-i
      }
    });
  }

  logout(redirectHome = true): void {
    writeStorage(TOKEN_KEY, null);
    writeStorage(USER_KEY, null);
    this._user.set(null);
    if (redirectHome) {
      this.router.navigateByUrl('/');
    }
  }


  private startSession(res: AuthResponse): void {
    writeStorage(TOKEN_KEY, res.token);
    this.setUser(res.user);
  }

  private setUser(user: User): void {
    writeStorage(USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }
}
