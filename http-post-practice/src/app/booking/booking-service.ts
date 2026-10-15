import { Injectable } from '@angular/core';
import { Booking } from './booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private bookings: Booking[] = [];

  private nextId = 1;

  getBookings(): Booking[] {
    return this.bookings;
  }

  getBookingById(id: number): Booking | undefined {
    return this.bookings.find(
      booking => booking.id === id
    );
  }

  addBooking(booking: Omit<Booking, 'id' | 'status'>): Booking {

    const newBooking: Booking = {
      ...booking,
      id: this.nextId++,
      status: 'pending'
    };

    this.bookings.push(newBooking);

    return newBooking;
  }

  confirmBooking(id: number): void {

    const booking = this.getBookingById(id);

    if (booking) {
      booking.status = 'confirmed';
    }
  }

  cancelBooking(id: number): void {

    const booking = this.getBookingById(id);

    if (booking) {
      booking.status = 'cancelled';
    }
  }

  deleteBooking(id: number): void {

    this.bookings = this.bookings.filter(
      booking => booking.id !== id
    );
  }
}