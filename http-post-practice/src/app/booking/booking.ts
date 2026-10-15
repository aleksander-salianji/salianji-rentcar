
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Booking as BookingModel } from './booking.model';
import { BookingService } from './booking-service';

import { Car } from '../car.model';
import { CarService } from '../car-service';

@Component({
  selector: 'app-booking',
  imports: [FormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css'
})
export class Booking implements OnInit {
  private bookingService = inject(BookingService);
  private carService = inject(CarService);
  private route = inject(ActivatedRoute);

  selectedCar: Car | null = null;

  carId = 0;
  carBrand = '';
  carModel = '';
  carPrice = 0;

  name = '';
  email = '';
  phone = '';
  phonePrefix = '+355';

  countries = [
    { name: 'Shqipëri', prefix: '+355', flag: '🇦🇱' },
    { name: 'Itali', prefix: '+39', flag: '🇮🇹' },
    { name: 'Greqi', prefix: '+30', flag: '🇬🇷' },
    { name: 'Gjermani', prefix: '+49', flag: '🇩🇪' },
    { name: 'Mbretëri e Bashkuar', prefix: '+44', flag: '🇬🇧' },
    { name: 'Kosovë', prefix: '+383', flag: '🇽🇰' },
    { name: 'Maqedoni e Veriut', prefix: '+389', flag: '🇲🇰' }
  ];

  pickupLocation = '';
  returnLocation = '';

  pickupDate = '';
  returnDate = '';
  today = this.getTodayDate();

  hours = Array.from(
    { length: 12 },
    (_, index) => String(index + 1).padStart(2, '0')
  );

  minutes = ['00', '15', '30', '45'];

  pickupHour = '10';
  pickupMinute = '00';
  pickupPeriod = 'AM';

  returnHour = '10';
  returnMinute = '00';
  returnPeriod = 'AM';

  pickupTime = '10:00 AM';
  returnTime = '10:00 AM';

  rentalDays = 0;

  babySeat = false;
  extraDriver = false;
  outsideAlbania = false;
  over250Km = false;

  babySeatPrice = 10;
  extraDriverPrice = 20;
  outsideAlbaniaPrice = 30;
  over250KmPrice = 20;

  basePrice = 0;
  extraPrice = 0;
  totalPrice = 0;

  message = '';
  errorMessage = '';

  bookings: BookingModel[] = [];
  selectedBooking: BookingModel | null = null;

  ngOnInit(): void {
    this.loadBookings();

    this.route.queryParams.subscribe(params => {
      const id = Number(params['carId']);

      if (id > 0) {
        const car = this.carService.getCarById(id);

        if (car) {
          this.selectCar(car);
        }
      }
    });
  }

  getTodayDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Data minimale e kthimit: 3 dite pas marrjes.
  getMinReturnDate(): string {
    if (!this.pickupDate) {
      return this.today;
    }

    const date = new Date(`${this.pickupDate}T12:00:00`);
    date.setDate(date.getDate() + 3);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  loadBookings(): void {
    this.bookings = this.bookingService.getBookings();
  }

  selectCar(car: Car): void {
    this.selectedCar = car;
    this.carId = car.id;
    this.carBrand = car.brand;
    this.carModel = car.model;
    this.carPrice = car.price;

    this.calculateTotal();
  }

  onPickupDateChange(): void {
    if (
      this.returnDate &&
      this.returnDate < this.getMinReturnDate()
    ) {
      this.returnDate = '';
    }

    this.calculateRentalDays();
  }

  updatePickupTime(): void {
    this.pickupTime =
      `${this.pickupHour}:${this.pickupMinute} ${this.pickupPeriod}`;
  }

  updateReturnTime(): void {
    this.returnTime =
      `${this.returnHour}:${this.returnMinute} ${this.returnPeriod}`;
  }

  calculateRentalDays(): void {
    if (!this.pickupDate || !this.returnDate) {
      this.rentalDays = 0;
      this.calculateTotal();
      return;
    }

    const pickup = new Date(`${this.pickupDate}T12:00:00`);
    const returning = new Date(`${this.returnDate}T12:00:00`);

    const difference = returning.getTime() - pickup.getTime();

    this.rentalDays = Math.round(
      difference / (1000 * 60 * 60 * 24)
    );

    if (this.rentalDays < 0) {
      this.rentalDays = 0;
    }

    this.calculateTotal();
  }

  calculateTotal(): void {
    this.basePrice = this.carPrice * this.rentalDays;
    this.extraPrice = 0;

    if (this.babySeat) {
      this.extraPrice += this.babySeatPrice;
    }

    if (this.extraDriver) {
      this.extraPrice += this.extraDriverPrice;
    }

    if (this.outsideAlbania) {
      this.extraPrice +=
        this.outsideAlbaniaPrice * this.rentalDays;
    }

    if (this.over250Km) {
      this.extraPrice +=
        this.over250KmPrice * this.rentalDays;
    }

    this.totalPrice = this.basePrice + this.extraPrice;
  }

  private convertTo24Hour(time: string): string {
    const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

    if (!match) {
      return '00:00';
    }

    let hour = Number(match[1]);
    const minute = match[2];
    const period = match[3].toUpperCase();

    if (period === 'AM' && hour === 12) {
      hour = 0;
    } else if (period === 'PM' && hour !== 12) {
      hour += 12;
    }

    return `${String(hour).padStart(2, '0')}:${minute}`;
  }

  createBooking(): void {
    this.message = '';
    this.errorMessage = '';

    this.updatePickupTime();
    this.updateReturnTime();

    if (!this.name.trim()) {
      this.errorMessage = 'Vendos emrin e plotë.';
      return;
    }

    if (!this.email.trim()) {
      this.errorMessage = 'Vendos email-in.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      this.errorMessage = 'Vendos një email të vlefshëm.';
      return;
    }

    if (!this.phone.trim()) {
      this.errorMessage = 'Vendos numrin e telefonit.';
      return;
    }

    if (!this.carId || !this.selectedCar) {
      this.errorMessage = 'Zgjidh një makinë.';
      return;
    }

    if (!this.pickupLocation.trim()) {
      this.errorMessage = 'Vendos vendin e marrjes së makinës.';
      return;
    }

    if (!this.returnLocation.trim()) {
      this.errorMessage = 'Vendos vendin e kthimit të makinës.';
      return;
    }

    if (!this.pickupDate || !this.returnDate) {
      this.errorMessage = 'Zgjidh datën e marrjes dhe kthimit.';
      return;
    }

    if (this.pickupDate < this.today) {
      this.errorMessage =
        'Data e marrjes nuk mund të jetë në të kaluarën.';
      return;
    }

    if (this.returnDate < this.getMinReturnDate()) {
      this.errorMessage =
        'Rezervimi duhet të jetë për të paktën 3 ditë.';
      return;
    }

    this.calculateRentalDays();

    if (this.rentalDays < 3) {
      this.errorMessage =
        'Rezervimi duhet të jetë për të paktën 3 ditë.';
      return;
    }

    const pickupDateTime = new Date(
      `${this.pickupDate}T${this.convertTo24Hour(this.pickupTime)}:00`
    );

    const returnDateTime = new Date(
      `${this.returnDate}T${this.convertTo24Hour(this.returnTime)}:00`
    );

    if (pickupDateTime.getTime() < Date.now()) {
      this.errorMessage =
        'Data dhe ora e marrjes nuk mund të jenë në të kaluarën.';
      return;
    }

    if (returnDateTime <= pickupDateTime) {
      this.errorMessage =
        'Ora dhe data e kthimit duhet të jenë pas marrjes së makinës.';
      return;
    }

    const booking: BookingModel = {
      id: Date.now(),
      name: this.name.trim(),
      email: this.email.trim(),
      phone: `${this.phonePrefix} ${this.phone.trim()}`,
      carId: this.carId,
      carBrand: this.carBrand,
      carModel: this.carModel,
      pickupLocation: this.pickupLocation.trim(),
      returnLocation: this.returnLocation.trim(),
      pickupDate: this.pickupDate,
      returnDate: this.returnDate,
      pickupTime: this.pickupTime,
      returnTime: this.returnTime,
      rentalDays: this.rentalDays,
      babySeat: this.babySeat,
      extraDriver: this.extraDriver,
      outsideAlbania: this.outsideAlbania,
      over250Km: this.over250Km,
      status: 'pending',
      totalPrice: this.totalPrice
    };

    this.bookingService.addBooking(booking);
    this.loadBookings();
    this.selectedBooking = booking;

    this.message =
      `Rezervimi për ${this.carBrand} ${this.carModel} u krijua me sukses. Statusi: Në pritje të konfirmimit. Totali: ${this.totalPrice} €.`;

    this.resetFormAfterBooking();
  }

  getBookingById(id: number): BookingModel | undefined {
    return this.bookingService.getBookingById(id);
  }

  confirmBooking(id: number): void {
    this.bookingService.confirmBooking(id);
    this.loadBookings();
    this.message = `Rezervimi ${id} u konfirmua.`;
    this.errorMessage = '';
  }

  // Anulimi lejohet deri 24 ore para marrjes.
  cancelBooking(id: number): void {
    this.message = '';
    this.errorMessage = '';

    const booking = this.bookingService.getBookingById(id);

    if (!booking) {
      this.errorMessage = 'Rezervimi nuk u gjet.';
      return;
    }

    if (booking.status === 'cancelled') {
      this.errorMessage = 'Ky rezervim është anuluar tashmë.';
      return;
    }

    if (booking.status === 'confirmed') {
      // Politika 24-orëshe zbatohet edhe për rezervimet e konfirmuara.
    }

    const pickupTime24 = this.convertTo24Hour(booking.pickupTime);

    const pickupDateTime = new Date(
      `${booking.pickupDate}T${pickupTime24}:00`
    );

    const hoursUntilPickup =
      (pickupDateTime.getTime() - Date.now()) /
      (1000 * 60 * 60);

    if (hoursUntilPickup < 24) {
      this.errorMessage =
        'Anulimi lejohet vetëm deri në 24 orë para marrjes së makinës.';
      return;
    }

    this.bookingService.cancelBooking(id);
    this.loadBookings();

    this.message = `Rezervimi ${id} u anulua me sukses.`;
  }

  deleteBooking(id: number): void {
    this.bookingService.deleteBooking(id);
    this.loadBookings();

    if (this.selectedBooking?.id === id) {
      this.selectedBooking = null;
    }

    this.message = `Rezervimi ${id} u fshi.`;
    this.errorMessage = '';
  }

  resetFormAfterBooking(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.phonePrefix = '+355';

    this.pickupLocation = '';
    this.returnLocation = '';

    this.pickupDate = '';
    this.returnDate = '';

    this.pickupHour = '10';
    this.pickupMinute = '00';
    this.pickupPeriod = 'AM';

    this.returnHour = '10';
    this.returnMinute = '00';
    this.returnPeriod = 'AM';

    this.pickupTime = '10:00 AM';
    this.returnTime = '10:00 AM';

    this.rentalDays = 0;

    this.babySeat = false;
    this.extraDriver = false;
    this.outsideAlbania = false;
    this.over250Km = false;

    this.basePrice = 0;
    this.extraPrice = 0;
    this.totalPrice = 0;

    // Makina e zgjedhur mbetet aktive.
    this.calculateTotal();
  }
}
