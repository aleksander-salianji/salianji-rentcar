import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { API_URL } from './config';
import { AuthResponse, LoginRequest, RegisterRequest, User } from './models';

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
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}


@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _user = signal<User | null>(readStorage(TOKEN_KEY) ? readUser() : null);

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');
  readonly fullName = computed(() => {
    const u = this._user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  });

  get token(): string | null {
    return readStorage(TOKEN_KEY);
  }


  login(request: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, request).pipe(
      tap(res => this.startSession(res)),
      map(res => res.user)
    );
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, request).pipe(
      tap(res => this.startSession(res)),
      map(res => res.user)
    );
  }

  emailExists(email: string): Observable<boolean> {
    return this.http
      .get<{ exists: boolean }>(`${API_URL}/auth/email-exists`, { params: { email } })
      .pipe(map(res => res.exists));
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
