
export interface Booking {
  id: number;

  // Te dhenat e klientit
  name: string;
  email: string;
  phone: string;

  // Makina
  carId: number;
  carBrand: string;
  carModel: string;

  // Marrja dhe kthimi
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;

  // Qiraja
  rentalDays: number;

  // Opsionet
  babySeat: boolean;
  extraDriver: boolean;
  outsideAlbania: boolean;
  over250Km: boolean;

  // Statusi
  status: 'pending' | 'confirmed' | 'cancelled';

  // Cmimi perfundimtar
  totalPrice: number;
}
