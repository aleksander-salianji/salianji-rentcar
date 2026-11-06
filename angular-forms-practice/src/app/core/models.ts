// =====================================================
// MODELET — përputhen me JSON-in që kthen backend-i
// =====================================================

// ---------- PËRDORUESI ----------

export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}


// ---------- MAKINA ----------

export type CarCategory = 'ECONOMY' | 'SEDAN' | 'SUV' | 'LUXURY';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  transmission: Transmission;
  fuel: FuelType;
  seats: number;
  pricePerDay: number;
  imageUrl: string | null;
  description: string | null;
  active: boolean;
}

export type CarRequest = Omit<Car, 'id'>;

export interface BookedPeriod {
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
}


// ---------- REZERVIMI ----------

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Address {
  street: string;
  city: string;
  zipCode: string;
}

export interface BookingExtras {
  gps: boolean;
  childSeat: boolean;
  fullInsurance: boolean;
}

export interface BookingRequest {
  carId: number;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  driverAge: number;
  licenseNumber: string;
  phoneNumbers: string[];
  address: Address;
  extras: BookingExtras;
}

export interface PriceBreakdown {
  days: number;
  pricePerDay: number;
  basePrice: number;
  extrasPrice: number;
  discount: number;
  totalPrice: number;
}

export interface Booking extends PriceBreakdown {
  id: number;
  code: string;
  car: Pick<Car, 'id' | 'brand' | 'model' | 'year' | 'category'>;
  customer: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  driverAge: number;
  licenseNumber: string;
  phoneNumbers: string[];
  address: Address;
  extras: BookingExtras;
  status: BookingStatus;
  createdAt: string; // ISO
}


// ---------- ADMIN ----------

export interface AdminStats {
  totalCars: number;
  activeCars: number;
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  totalCustomers: number;
}


// ---------- GABIMET NGA API ----------

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}
