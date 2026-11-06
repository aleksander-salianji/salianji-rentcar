package com.salianji.rentcar.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RevenueReportDto(
    RevenuePeriod period,
    BigDecimal total,
    long bookings,
    List<Point> points
) {

    // Një kolonë e grafikut: një ditë, një javë ose një muaj
    public record Point(LocalDate start, LocalDate end, BigDecimal revenue, long bookings) {
    }
}
