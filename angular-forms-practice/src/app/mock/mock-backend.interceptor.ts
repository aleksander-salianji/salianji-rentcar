// =====================================================
// BACKEND DEMO
// Kap kërkesat HTTP drejt API_URL dhe u përgjigjet si të ishte
// serveri Spring Boot, me të njëjtat rrugë (endpoints) dhe të njëjtin JSON.
// Aktivizohet vetëm kur USE_MOCK_API = true (shih core/config.ts).
// =====================================================

import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { API_URL } from '../core/config';
import { daysBetween, periodsOverlap, todayISO } from '../core/date.utils';
import { LOCATIONS, RENTAL_RULES } from '../core/labels';
import {
  AdminStats,
  Booking,
  BookingRequest,
  BookingStatus,
  Car,
  CarRequest,
  LoginRequest,
  RegisterRequest,
  User
} from '../core/models';
import { calculatePrice } from '../core/pricing';
import { LICENSE_PATTERN, PASSWORD_PATTERN, PHONE_PATTERN } from '../core/validators';
import { MockDb, StoredUser } from './mock-db';

let db: MockDb | null = null;
function getDb(): MockDb {
  db ??= new MockDb();
  return db;
}

const ACTIVE_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED'];


export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_URL)) {
    return next(req);
  }
  // vonesë e vogël që të ngjajë me një server të vërtetë
  return timer(300).pipe(switchMap(() => handle(req)));
};


// ---------- NDIHMËS ----------

type Result = Observable<HttpEvent<unknown>>;

function ok(body: unknown, status = 200): Result {
  return of(new HttpResponse({ status, body }));
}

function fail(req: HttpRequest<unknown>, status: number, message: string): Result {
  return throwError(() => new HttpErrorResponse({ status, url: req.url, error: { message } }));
}

function toUser(u: StoredUser): User {
  const { password: _password, ...user } = u;
  return user;
}

function currentUser(req: HttpRequest<unknown>): StoredUser | undefined {
  const header = req.headers.get('Authorization') ?? '';
  const match = /^Bearer mock-token-(\d+)$/.exec(header);
  if (!match) {
    return undefined;
  }
  const id = Number(match[1]);
  return getDb().state.users.find(u => u.id === id);
}

function authResponse(u: StoredUser) {
  return { token: `mock-token-${u.id}`, user: toUser(u) };
}


// ---------- RRUGËT ----------

function handle(req: HttpRequest<unknown>): Result {
  const path = req.url.slice(API_URL.length);
  const method = req.method;
  const state = getDb().state;
  let m: RegExpExecArray | null;

  // ===== AUTH =====

  if (method === 'POST' && path === '/auth/register') {
    const body = req.body as RegisterRequest;
    const email = (body.email ?? '').trim().toLowerCase();

    if (!body.firstName?.trim() || !body.lastName?.trim()) {
      return fail(req, 400, 'Emri dhe mbiemri janë të detyrueshëm.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return fail(req, 400, 'Email nuk është i vlefshëm.');
    }
    if (!PASSWORD_PATTERN.test(body.password ?? '')) {
      return fail(req, 400, 'Fjalëkalimi duhet të ketë të paktën 8 karaktere, me shkronja dhe shifra.');
    }
    if (state.users.some(u => u.email === email)) {
      return fail(req, 409, 'Ky email është tashmë i regjistruar.');
    }

    const user: StoredUser = {
      id: state.nextId.user++,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email,
      phone: body.phone ?? '',
      role: 'CUSTOMER',
      password: body.password
    };
    state.users.push(user);
    getDb().save();
    return ok(authResponse(user), 201);
  }

  if (method === 'POST' && path === '/auth/login') {
    const body = req.body as LoginRequest;
    const email = (body.email ?? '').trim().toLowerCase();
    const user = state.users.find(u => u.email === email && u.password === body.password);
    return user ? ok(authResponse(user)) : fail(req, 401, 'Email ose fjalëkalim i gabuar.');
  }

  if (method === 'GET' && path === '/auth/me') {
    const user = currentUser(req);
    return user ? ok(toUser(user)) : fail(req, 401, 'Sesioni ka skaduar.');
  }

  if (method === 'GET' && path === '/auth/email-exists') {
    const email = (req.params.get('email') ?? '').trim().toLowerCase();
    return ok({ exists: state.users.some(u => u.email === email) });
  }


  // ===== MAKINAT (publike) =====

  if (method === 'GET' && path === '/cars') {
    return ok(state.cars.filter(c => c.active));
  }

  if (method === 'GET' && (m = /^\/cars\/(\d+)$/.exec(path))) {
    const car = state.cars.find(c => c.id === Number(m![1]) && c.active);
    return car ? ok(car) : fail(req, 404, 'Makina nuk u gjet.');
  }

  if (method === 'GET' && (m = /^\/cars\/(\d+)\/booked-periods$/.exec(path))) {
    const carId = Number(m[1]);
    const today = todayISO();
    const periods = state.bookings
      .filter(b => b.car.id === carId && ACTIVE_STATUSES.includes(b.status) && b.returnDate > today)
      .sort((a, b) => a.pickupDate.localeCompare(b.pickupDate))
      .map(b => ({ pickupDate: b.pickupDate, returnDate: b.returnDate }));
    return ok(periods);
  }


  // ===== Nga këtu e poshtë duhet login =====

  const user = currentUser(req);
  if (!user) {
    return fail(req, 401, 'Duhet të hysh në llogari.');
  }


  // ===== REZERVIMET (klienti) =====

  if (method === 'POST' && path === '/bookings') {
    const body = req.body as BookingRequest;
    const car = state.cars.find(c => c.id === body.carId && c.active);
    const today = todayISO();

    if (!car) {
      return fail(req, 404, 'Makina nuk u gjet.');
    }
    if (!LOCATIONS.includes(body.pickupLocation) || !LOCATIONS.includes(body.returnLocation)) {
      return fail(req, 400, 'Vendi i marrjes ose i kthimit nuk është i vlefshëm.');
    }
    if (!body.pickupDate || body.pickupDate < today) {
      return fail(req, 400, 'Data e marrjes nuk mund të jetë në të kaluarën.');
    }
    if (!body.returnDate || body.returnDate <= body.pickupDate) {
      return fail(req, 400, 'Data e kthimit duhet të jetë pas datës së marrjes.');
    }
    if (daysBetween(body.pickupDate, body.returnDate) > RENTAL_RULES.maxDays) {
      return fail(req, 400, `Qiraja nuk mund të zgjasë më shumë se ${RENTAL_RULES.maxDays} ditë.`);
    }
    if (body.driverAge < RENTAL_RULES.minDriverAge || body.driverAge > RENTAL_RULES.maxDriverAge) {
      return fail(req, 400, `Mosha e shoferit duhet të jetë ${RENTAL_RULES.minDriverAge}–${RENTAL_RULES.maxDriverAge} vjeç.`);
    }
    if (!LICENSE_PATTERN.test(body.licenseNumber ?? '')) {
      return fail(req, 400, 'Numri i patentës nuk është i vlefshëm.');
    }
    if (!body.phoneNumbers?.length || body.phoneNumbers.some(p => !PHONE_PATTERN.test(p))) {
      return fail(req, 400, 'Numrat e telefonit nuk janë të vlefshëm.');
    }

    const taken = state.bookings.some(b =>
      b.car.id === car.id &&
      ACTIVE_STATUSES.includes(b.status) &&
      periodsOverlap(body.pickupDate, body.returnDate, b.pickupDate, b.returnDate)
    );
    if (taken) {
      return fail(req, 409, 'Makina është e zënë për këto data. Zgjidh data të tjera.');
    }

    const id = state.nextId.booking++;
    const booking: Booking = {
      id,
      code: `SRC-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`,
      car: { id: car.id, brand: car.brand, model: car.model, year: car.year, category: car.category },
      customer: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
      pickupLocation: body.pickupLocation,
      returnLocation: body.returnLocation,
      pickupDate: body.pickupDate,
      returnDate: body.returnDate,
      driverAge: body.driverAge,
      licenseNumber: body.licenseNumber.toUpperCase(),
      phoneNumbers: body.phoneNumbers,
      address: body.address,
      extras: body.extras,
      ...calculatePrice(car.pricePerDay, body.pickupDate, body.returnDate, body.extras),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    state.bookings.push(booking);
    getDb().save();
    return ok(booking, 201);
  }

  if (method === 'GET' && path === '/bookings/my') {
    const mine = state.bookings
      .filter(b => b.customer.id === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(mine);
  }

  if (method === 'PATCH' && (m = /^\/bookings\/(\d+)\/cancel$/.exec(path))) {
    const booking = state.bookings.find(b => b.id === Number(m![1]) && b.customer.id === user.id);
    if (!booking) {
      return fail(req, 404, 'Rezervimi nuk u gjet.');
    }
    if (!ACTIVE_STATUSES.includes(booking.status)) {
      return fail(req, 400, 'Ky rezervim nuk mund të anulohet.');
    }
    if (booking.pickupDate <= todayISO()) {
      return fail(req, 400, 'Rezervimi nuk mund të anulohet në ditën e marrjes ose më vonë.');
    }
    booking.status = 'CANCELLED';
    getDb().save();
    return ok(booking);
  }


  // ===== ADMIN =====

  if (path.startsWith('/admin')) {
    if (user.role !== 'ADMIN') {
      return fail(req, 403, 'Nuk ke leje për këtë veprim.');
    }

    if (method === 'GET' && path === '/admin/cars') {
      return ok([...state.cars].sort((a, b) => a.id - b.id));
    }

    if (method === 'POST' && path === '/admin/cars') {
      const body = req.body as CarRequest;
      const car: Car = { ...body, id: state.nextId.car++ };
      state.cars.push(car);
      getDb().save();
      return ok(car, 201);
    }

    if (method === 'PUT' && (m = /^\/admin\/cars\/(\d+)$/.exec(path))) {
      const index = state.cars.findIndex(c => c.id === Number(m![1]));
      if (index < 0) {
        return fail(req, 404, 'Makina nuk u gjet.');
      }
      const car: Car = { ...(req.body as CarRequest), id: state.cars[index].id };
      state.cars[index] = car;
      getDb().save();
      return ok(car);
    }

    if (method === 'DELETE' && (m = /^\/admin\/cars\/(\d+)$/.exec(path))) {
      const id = Number(m[1]);
      if (state.bookings.some(b => b.car.id === id)) {
        return fail(req, 409, 'Makina ka rezervime. Çaktivizoje në vend që ta fshish.');
      }
      state.cars = state.cars.filter(c => c.id !== id);
      getDb().save();
      return ok(null, 204);
    }

    if (method === 'GET' && path === '/admin/bookings') {
      return ok([...state.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    }

    if (method === 'PATCH' && (m = /^\/admin\/bookings\/(\d+)\/status$/.exec(path))) {
      const booking = state.bookings.find(b => b.id === Number(m![1]));
      if (!booking) {
        return fail(req, 404, 'Rezervimi nuk u gjet.');
      }
      booking.status = (req.body as { status: BookingStatus }).status;
      getDb().save();
      return ok(booking);
    }

    if (method === 'GET' && path === '/admin/stats') {
      const stats: AdminStats = {
        totalCars: state.cars.length,
        activeCars: state.cars.filter(c => c.active).length,
        totalBookings: state.bookings.length,
        activeBookings: state.bookings.filter(b => ACTIVE_STATUSES.includes(b.status)).length,
        pendingBookings: state.bookings.filter(b => b.status === 'PENDING').length,
        totalRevenue: state.bookings
          .filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
          .reduce((sum, b) => sum + b.totalPrice, 0),
        totalCustomers: state.users.filter(u => u.role === 'CUSTOMER').length
      };
      return ok(stats);
    }
  }

  return fail(req, 404, `Rruga ${method} ${path} nuk ekziston.`);
}
