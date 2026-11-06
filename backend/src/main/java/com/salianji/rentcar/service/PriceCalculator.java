package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.ExtrasDto;

import java.math.BigDecimal;
import java.math.RoundingMode;

// Llogaritja e çmimit. Çmimi final vendoset gjithmonë këtu në server, jo në frontend.
public final class PriceCalculator {

    private PriceCalculator() {
    }

    public record Price(
        int days,
        BigDecimal pricePerDay,
        BigDecimal basePrice,
        BigDecimal extrasPrice,
        BigDecimal discount,
        BigDecimal totalPrice
    ) {
    }

    public static Price calculate(BigDecimal pricePerDay, int days, ExtrasDto extras) {
        BigDecimal dayCount = BigDecimal.valueOf(days);

        BigDecimal basePrice = money(pricePerDay.multiply(dayCount));

        BigDecimal extrasPerDay = BigDecimal.ZERO;
        if (extras.gps()) {
            extrasPerDay = extrasPerDay.add(RentalRules.GPS_PER_DAY);
        }
        if (extras.childSeat()) {
            extrasPerDay = extrasPerDay.add(RentalRules.CHILD_SEAT_PER_DAY);
        }
        if (extras.fullInsurance()) {
            extrasPerDay = extrasPerDay.add(RentalRules.FULL_INSURANCE_PER_DAY);
        }
        BigDecimal extrasPrice = money(extrasPerDay.multiply(dayCount));

        BigDecimal discount = days >= RentalRules.LONG_RENTAL_DAYS
            ? money(basePrice.multiply(RentalRules.LONG_RENTAL_DISCOUNT))
            : money(BigDecimal.ZERO);

        BigDecimal total = money(basePrice.add(extrasPrice).subtract(discount));

        return new Price(days, money(pricePerDay), basePrice, extrasPrice, discount, total);
    }

    private static BigDecimal money(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
