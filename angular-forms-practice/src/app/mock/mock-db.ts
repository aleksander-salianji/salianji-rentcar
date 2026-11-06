// =====================================================
// "DATABAZA" DEMO — ruhet në localStorage të shfletuesit.
// Përdoret vetëm kur USE_MOCK_API = true.
// Kur backend-i Spring Boot të jetë gati, ky skedar nuk përdoret më.
// =====================================================

import { Booking, Car, User } from '../core/models';

export interface StoredUser extends User {
  password: string;
}

export interface DbState {
  users: StoredUser[];
  cars: Car[];
  bookings: Booking[];
  nextId: { user: number; car: number; booking: number };
}

const STORAGE_KEY = 'salianji.mockdb.v1';

function seed(): DbState {
  const cars: Car[] = [
    { id: 1, brand: 'Fiat', model: 'Panda', year: 2021, category: 'ECONOMY', transmission: 'MANUAL', fuel: 'PETROL', seats: 4, pricePerDay: 25, imageUrl: null, description: 'E vogël dhe ekonomike, ideale për qytetin.', active: true },
    { id: 2, brand: 'Volkswagen', model: 'Golf', year: 2020, category: 'ECONOMY', transmission: 'MANUAL', fuel: 'DIESEL', seats: 5, pricePerDay: 35, imageUrl: null, description: 'Komode dhe me konsum të ulët për rrugë të gjata.', active: true },
    { id: 3, brand: 'Toyota', model: 'Corolla Hybrid', year: 2022, category: 'SEDAN', transmission: 'AUTOMATIC', fuel: 'HYBRID', seats: 5, pricePerDay: 40, imageUrl: null, description: 'Hibride, e qetë dhe shumë ekonomike.', active: true },
    { id: 4, brand: 'Skoda', model: 'Octavia', year: 2021, category: 'SEDAN', transmission: 'AUTOMATIC', fuel: 'DIESEL', seats: 5, pricePerDay: 38, imageUrl: null, description: 'Bagazh i madh, perfekte për familjen.', active: true },
    { id: 5, brand: 'Dacia', model: 'Duster', year: 2022, category: 'SUV', transmission: 'MANUAL', fuel: 'DIESEL', seats: 5, pricePerDay: 45, imageUrl: null, description: 'SUV i fortë për rrugët malore.', active: true },
    { id: 6, brand: 'Toyota', model: 'RAV4', year: 2023, category: 'SUV', transmission: 'AUTOMATIC', fuel: 'HYBRID', seats: 5, pricePerDay: 65, imageUrl: null, description: 'SUV hibrid me 4x4 dhe teknologji të re.', active: true },
    { id: 7, brand: 'Mercedes-Benz', model: 'C-Class', year: 2022, category: 'LUXURY', transmission: 'AUTOMATIC', fuel: 'DIESEL', seats: 5, pricePerDay: 90, imageUrl: null, description: 'Elegancë dhe komoditet për raste të veçanta.', active: true },
    { id: 8, brand: 'BMW', model: 'X5', year: 2021, category: 'LUXURY', transmission: 'AUTOMATIC', fuel: 'DIESEL', seats: 5, pricePerDay: 120, imageUrl: null, description: 'SUV luksoz me hapësirë të madhe.', active: true }
  ];

  const users: StoredUser[] = [
    { id: 1, firstName: 'Admin', lastName: 'Salianji', email: 'admin@salianjirent.al', phone: '0690000000', role: 'ADMIN', password: 'Admin123' },
    { id: 2, firstName: 'Klient', lastName: 'Demo', email: 'klient@salianjirent.al', phone: '0681234567', role: 'CUSTOMER', password: 'Klient123' }
  ];

  return {
    users,
    cars,
    bookings: [],
    nextId: { user: 3, car: 9, booking: 1 }
  };
}

export class MockDb {

  state: DbState;

  constructor() {
    this.state = this.load() ?? seed();
    this.save();
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // localStorage jo i disponueshëm — të dhënat mbeten vetëm në memorie
    }
  }

  private load(): DbState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DbState) : null;
    } catch {
      return null;
    }
  }
}
