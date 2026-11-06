package com.salianji.rentcar.dto;

import java.math.BigDecimal;

public record AdminStatsDto(
    long totalCars,
    long activeCars,
    long totalBookings,
    long activeBookings,
    long pendingBookings,
    BigDecimal totalRevenue,
    long totalCustomers
) {
}
