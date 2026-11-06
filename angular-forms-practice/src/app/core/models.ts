// =====================================================
// MODELET — përputhen me JSON-in që kthen backend-i
// =====================================================

// ---------- PËRDORUESI ----------

// Klientët nuk kanë llogari: hyjnë vetëm adminët dhe bizneset
export type Role = 'CUSTOMER' | 'ADMIN' | 'COMPANY';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  companyId: number | null;    // vetëm për bizneset
  companyName: string | null;
}

export interface LoginRequest {
  email: string;
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
  companyId: number | null;
  companyName: string | null;
  companyCity: string | null;
}

export type CarRequest = Omit<Car, 'id' | 'companyName' | 'companyCity'>;

// Filtrat e kërkimit (si në Booking)
export interface CarSearch {
  city?: string;
  from?: string;      // YYYY-MM-DD
  to?: string;        // YYYY-MM-DD
  companyId?: number;
}


// ---------- KOMPANIA ----------

export interface Company {
  id: number;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  carCount: number;
}

// Vetëm për adminin
export interface AdminCompany extends Company {
  commissionPercent: number;
  active: boolean;
  accountEmail: string | null;   // email-i i login-it (null = pa llogari)
}

export type CompanyRequest = Omit<AdminCompany, 'id' | 'carCount' | 'accountEmail'>;

// Login-i i një kompanie (e krijon admini)
export interface CompanyAccountRequest {
  email: string;
  password: string;
}

export interface CompanyReport {
  companyId: number;
  companyName: string;
  cars: number;
  bookings: number;
  revenue: number;
  platformFee: number;
}

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
  firstName: string;
  lastName: string;
  email: string;
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

// Klienti e gjen rezervimin me kodin + telefonin
export interface BookingLookup {
  code: string;
  phone: string;
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
  customer: { id: number | null; firstName: string; lastName: string; email: string };
  company: { id: number; name: string; city: string; phone: string | null } | null;
  platformFee: number;
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
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueYesterday: number;
  revenueLastWeekToDate: number;
  revenueLastMonthToDate: number;
  freeCarsToday: number;
  occupiedCarsToday: number;
  totalCompanies: number;
  platformFeeTotal: number;
}

// ---------- XHIRO ----------

export type RevenuePeriod = 'DAY' | 'WEEK' | 'MONTH';

export interface RevenuePoint {
  start: string;   // YYYY-MM-DD
  end: string;     // YYYY-MM-DD
  revenue: number;
  bookings: number;
}

export interface RevenueReport {
  period: RevenuePeriod;
  total: number;
  bookings: number;
  points: RevenuePoint[];
}

// ---------- GJENDJA E FLOTËS ----------

export type FleetState = 'FREE' | 'OCCUPIED' | 'INACTIVE';

export interface FleetBooking {
  id: number;
  code: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  status: BookingStatus;
}

export interface FleetStatus {
  car: Pick<Car, 'id' | 'brand' | 'model' | 'year' | 'category' | 'pricePerDay' | 'active' | 'companyId' | 'companyName'>;
  state: FleetState;
  current: FleetBooking | null;
  next: FleetBooking | null;
}


// ---------- NDIHMA / SUPPORT ----------

export type SupportTopic = 'BOOKING' | 'CANCELLATION' | 'PAYMENT' | 'CAR' | 'PARTNER' | 'CAREER' | 'OTHER';
export type SupportStatus = 'OPEN' | 'RESOLVED';

export interface SupportRequest {
  topic: SupportTopic;
  name: string;
  email: string;
  phone: string | null;
  bookingCode: string | null;
  message: string;
  website: string;   // fushë e fshehur kundër robotëve (bosh)
}

export interface SupportTicket {
  id: number;
  topic: SupportTopic;
  name: string;
  email: string;
  phone: string | null;
  bookingCode: string | null;
  message: string;
  status: SupportStatus;
  createdAt: string;
  resolvedAt: string | null;
}


// ---------- BLOGU ----------

export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  category: string;
  publishedAt: string | null;
  readMinutes: number;
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  published: boolean;
  updatedAt: string;
}

export interface BlogPostRequest {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  category: string;
  published: boolean;
}


// ---------- GABIMET NGA API ----------

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}
