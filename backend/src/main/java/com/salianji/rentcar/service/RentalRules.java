package com.salianji.rentcar.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

// Rregullat e biznesit — të njëjtat si te frontend-i (core/labels.ts)
public final class RentalRules {

    private RentalRules() {
    }

    public static final ZoneId ZONE = ZoneId.of("Europe/Tirane");

    // Data e sotme sipas orës së Shqipërisë
    public static LocalDate today() {
        return LocalDate.now(ZONE);
    }

    public static final List<String> LOCATIONS = List.of(
        "Tiranë - Qendër",
        "Aeroporti Rinas",
        "Durrës",
        "Vlorë",
        "Shkodër",
        "Sarandë"
    );

    public static final int MIN_DRIVER_AGE = 21;
    public static final int MAX_DRIVER_AGE = 75;
    public static final int MIN_DAYS = 3;   // qiraja minimale
    public static final int MAX_DAYS = 30;

    // Klienti mund ta anulojë rezervimin vetëm brenda kaq orëve nga krijimi
    public static final int CANCELLATION_WINDOW_HOURS = 24;

    public static final int LONG_RENTAL_DAYS = 7;
    public static final BigDecimal LONG_RENTAL_DISCOUNT = new BigDecimal("0.10");

    // Çmimet e shtesave për ditë (€)
    public static final BigDecimal GPS_PER_DAY = new BigDecimal("5");
    public static final BigDecimal CHILD_SEAT_PER_DAY = new BigDecimal("7");
    public static final BigDecimal FULL_INSURANCE_PER_DAY = new BigDecimal("15");
}
