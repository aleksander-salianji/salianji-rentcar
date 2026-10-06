export {};

interface Booking {
  readonly id: number;
  customerName: string;
  carModel: string;
  days: number;
  extraDriver?: boolean;

  getTotalPrice(pricePerDay: number): number;
}

const booking: Booking = {
  id: 1,
  customerName: 'Aleks',
  carModel: 'BMW X5',
  days: 5,
  extraDriver: true,

  getTotalPrice(pricePerDay: number): number {
    let total = pricePerDay * this.days;

    if (this.extraDriver) {
      total += 20;
    }

    return total;
  }
};

console.log(booking);

console.log(
  `Çmimi total: ${booking.getTotalPrice(80)} €`
);