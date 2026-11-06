import {
  BookingExtras,
  BookingStatus,
  CarCategory,
  FuelType,
  SupportTopic,
  Transmission
} from './models';

// Backend-i përdor emra në anglisht (ECONOMY, MANUAL...).
// Këtu i kthejmë në shqip për t'i shfaqur në faqe.

export const CATEGORY_LABELS: Record<CarCategory, string> = {
  ECONOMY: 'Ekonomike',
  SEDAN: 'Sedan',
  SUV: 'SUV',
  LUXURY: 'Luksoze'
};

export const TRANSMISSION_LABELS: Record<Transmission, string> = {
  MANUAL: 'Manuale',
  AUTOMATIC: 'Automatike'
};

export const FUEL_LABELS: Record<FuelType, string> = {
  PETROL: 'Benzinë',
  DIESEL: 'Naftë',
  HYBRID: 'Hibride',
  ELECTRIC: 'Elektrike'
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Në pritje',
  CONFIRMED: 'E konfirmuar',
  CANCELLED: 'E anuluar',
  COMPLETED: 'E përfunduar'
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as CarCategory[];
export const TRANSMISSIONS = Object.keys(TRANSMISSION_LABELS) as Transmission[];
export const FUELS = Object.keys(FUEL_LABELS) as FuelType[];
export const STATUSES = Object.keys(STATUS_LABELS) as BookingStatus[];

export const LOCATIONS: readonly string[] = [
  'Tiranë - Qendër',
  'Aeroporti Rinas',
  'Durrës',
  'Vlorë',
  'Shkodër',
  'Sarandë'
];

// Qytetet ku mund të ndodhet një kompani (për kërkimin)
export const CITIES: readonly string[] = [
  'Tiranë', 'Durrës', 'Vlorë', 'Shkodër', 'Sarandë', 'Elbasan', 'Korçë', 'Fier', 'Berat', 'Gjirokastër'
];

export interface ExtraOption {
  key: keyof BookingExtras;
  label: string;
  description: string;
  pricePerDay: number;
}

export const EXTRAS_OPTIONS: readonly ExtraOption[] = [
  { key: 'gps', label: 'GPS', description: 'Navigim me harta të Shqipërisë', pricePerDay: 5 },
  { key: 'childSeat', label: 'Karrige për fëmijë', description: 'Për fëmijë 9–36 kg', pricePerDay: 7 },
  { key: 'fullInsurance', label: 'Sigurim i plotë', description: 'Pa franshizë në rast dëmi', pricePerDay: 15 }
];

export const RENTAL_RULES = {
  minDriverAge: 21,
  maxDriverAge: 75,
  minDays: 3,              // qiraja minimale
  maxDays: 30,
  cancelWindowHours: 24,   // anulimi lejohet vetëm brenda 24 orëve nga krijimi
  longRentalDays: 7,       // nga sa ditë fillon zbritja
  longRentalDiscount: 0.1  // 10%
} as const;


// ---------- NDIHMA / SUPPORT ----------
// Ndrysho këtu numrin, WhatsApp-in dhe email-in e vërtetë të supportit.
export const SUPPORT_CONTACT = {
  phone: '+355690000000',
  phoneLabel: '+355 69 000 0000',
  whatsapp: '355690000000',          // pa "+" dhe pa hapësira
  email: 'info@bookerscar.al',
  hours: 'Online 24/7'
} as const;

export const SUPPORT_TOPIC_LABELS: Record<SupportTopic, string> = {
  BOOKING: 'Rezervimi',
  CANCELLATION: 'Anulim / ndryshim',
  PAYMENT: 'Pagesa / çmimi',
  CAR: 'Problem me makinën',
  PARTNER: 'Dua të bëhem partner',
  CAREER: 'Karriera / aplikim për punë',
  OTHER: 'Tjetër'
};

export const SUPPORT_TOPICS = Object.keys(SUPPORT_TOPIC_LABELS) as SupportTopic[];

// ---------- BLOGU ----------
export const BLOG_CATEGORIES: readonly string[] = ['Udhëtime', 'Këshilla', 'Lajme', 'Oferta'];
