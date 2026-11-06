# Salianji Rent Car — Frontend (Angular)

## Si ta vendosësh në projekt

1. Hap dosjen `angular-forms-practice` (aty ku ndodhet `package.json`).
2. Fshi gjithçka brenda `src/app/`.
3. Kopjo dosjen `src/app/` nga ky zip te `angular-forms-practice/src/app/`.
4. Zëvendëso `angular-forms-practice/src/styles.css` me `src/styles.css` nga ky zip.
5. Në terminal, brenda `angular-forms-practice`:

   ```
   npm install
   ng serve
   ```

6. Hap `http://localhost:4200`.

## Llogaritë demo

| Roli   | Email                    | Fjalëkalimi |
|--------|--------------------------|-------------|
| Admin  | admin@salianjirent.al    | Admin123    |
| Klient | klient@salianjirent.al   | Klient123   |

Mund të krijosh edhe llogari të re te **Regjistrohu**.

## Mënyra demo dhe backend-i

Te `src/app/core/config.ts`:

```ts
export const USE_MOCK_API = true;
```

- `true`: aplikacioni punon pa backend. Të dhënat ruhen në shfletues (localStorage).
- `false`: aplikacioni lidhet me backend-in Spring Boot te `http://localhost:8080/api`.

Për të fshirë të gjitha të dhënat demo: F12 → Application → Local Storage → fshi çelësat `salianji.*`.

## Struktura

```
src/app/
├── app.ts / app.html / app.css   → header, menyja, footer
├── app.routes.ts                 → faqet dhe mbrojtja me guard
├── app.config.ts                 → HttpClient, router, gjuha shqip
├── core/
│   ├── config.ts                 → API_URL dhe USE_MOCK_API
│   ├── models.ts                 → interfaces (User, Car, Booking...)
│   ├── labels.ts                 → tekstet shqip, vendet, shtesat, rregullat
│   ├── validators.ts             → validatorët custom, async, group
│   ├── pricing.ts                → llogaritja e çmimit
│   ├── auth.service.ts           → login, regjistrim, token JWT
│   ├── auth.interceptor.ts       → shton token-in në çdo kërkesë
│   ├── guards.ts                 → authGuard, adminGuard, guestGuard
│   ├── car.service.ts            → API e makinave
│   └── booking.service.ts        → API e rezervimeve
├── mock/                         → backend-i demo (vetëm kur USE_MOCK_API = true)
├── shared/                       → car-card, label pipe
└── pages/
    ├── home/                     → kryefaqja
    ├── cars/                     → lista me filtra
    ├── booking/                  → formulari i rezervimit
    ├── my-bookings/              → rezervimet e klientit
    ├── auth/                     → hyr, regjistrohu
    └── admin/                    → paneli: përmbledhja, rezervimet, makinat
```

## Ku janë konceptet e Reactive Forms

| Koncepti                 | Ku                                                        |
|--------------------------|-----------------------------------------------------------|
| Validator custom         | `forbiddenNameValidator`, te regjistrimi                  |
| Validator async          | `emailTakenValidator`, te regjistrimi (pyet serverin)     |
| Validator FormGroup      | `passwordMatchValidator`, `dateRangeValidator`            |
| Validator i gjithë formës| disponueshmëria e makinës, te rezervimi                   |
| FormGroup i ndërthurur   | `rental`, `driver`, `address`, `extras`, te rezervimi     |
| FormArray                | numrat e telefonit, te rezervimi                          |
| patchValue               | telefoni nga llogaria; butonat e llogarive demo           |
| setValue                 | "Ndrysho" te admin → makinat                              |
| reset                    | "Pastro" te rezervimi; "Makinë e re" te admin             |

## API që pret frontend-i (për backend-in Spring Boot)

| Metoda | Rruga                              | Kush      |
|--------|------------------------------------|-----------|
| POST   | /api/auth/register                 | publike   |
| POST   | /api/auth/login                    | publike   |
| GET    | /api/auth/me                       | i loguar  |
| GET    | /api/auth/email-exists?email=      | publike   |
| GET    | /api/cars                          | publike   |
| GET    | /api/cars/{id}                     | publike   |
| GET    | /api/cars/{id}/booked-periods      | publike   |
| POST   | /api/bookings                      | i loguar  |
| GET    | /api/bookings/my                   | i loguar  |
| PATCH  | /api/bookings/{id}/cancel          | i loguar  |
| GET    | /api/admin/cars                    | admin     |
| POST   | /api/admin/cars                    | admin     |
| PUT    | /api/admin/cars/{id}               | admin     |
| DELETE | /api/admin/cars/{id}               | admin     |
| GET    | /api/admin/bookings                | admin     |
| PATCH  | /api/admin/bookings/{id}/status    | admin     |
| GET    | /api/admin/stats                   | admin     |
