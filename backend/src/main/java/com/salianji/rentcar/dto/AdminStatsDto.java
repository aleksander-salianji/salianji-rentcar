package com.salianji.rentcar.dto;

import java.math.BigDecimal;

public record AdminStatsDto(
    long totalCars,
    long activeCars,
    long totalBookings,
    long activeBookings,
    long pendingBookings,
    BigDecimal totalRevenue,
    long totalCustomers,
    BigDecimal revenueToday,
    BigDecimal revenueThisWeek,
    BigDecimal revenueThisMonth,
    // Për krahasim (▲▼): e njëjta gjatësi periudhe më parë
    BigDecimal revenueYesterday,        // dje
    BigDecimal revenueLastWeekToDate,   // java e kaluar, nga e hëna deri në të njëjtën ditë të javës
    BigDecimal revenueLastMonthToDate,  // muaji i kaluar, nga data 1 deri në të njëjtën datë
    long freeCarsToday,
    long occupiedCarsToday,
    long totalCompanies,
    BigDecimal platformFeeTotal   // komisioni i fituar nga rezervimet e konfirmuara/përfunduara
) {
}
