import { daysBetween } from './date.utils';
import { EXTRAS_OPTIONS, RENTAL_RULES } from './labels';
import { BookingExtras, PriceBreakdown } from './models';

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// E njëjta formulë përdoret edhe në backend.
// Në frontend shërben vetëm për parashikimin e çmimit; çmimi final vendoset nga serveri.
export function calculatePrice(
  pricePerDay: number,
  pickupDate: string | null | undefined,
  returnDate: string | null | undefined,
  extras: Partial<BookingExtras> | null | undefined
): PriceBreakdown {

  const days = daysBetween(pickupDate, returnDate);
  const basePrice = round2(pricePerDay * days);

  const extrasPerDay = EXTRAS_OPTIONS.reduce(
    (sum, opt) => sum + (extras?.[opt.key] ? opt.pricePerDay : 0),
    0
  );
  const extrasPrice = round2(extrasPerDay * days);

  const discount = days >= RENTAL_RULES.longRentalDays
    ? round2(basePrice * RENTAL_RULES.longRentalDiscount)
    : 0;

  return {
    days,
    pricePerDay,
    basePrice,
    extrasPrice,
    discount,
    totalPrice: round2(basePrice + extrasPrice - discount)
  };
}
