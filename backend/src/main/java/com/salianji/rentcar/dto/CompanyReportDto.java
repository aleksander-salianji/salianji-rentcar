package com.salianji.rentcar.dto;

import java.math.BigDecimal;

// Rezultatet e një kompanie: rezervime të konfirmuara/përfunduara, xhiro dhe komisioni i platformës
public record CompanyReportDto(
    Long companyId,
    String companyName,
    long cars,
    long bookings,
    BigDecimal revenue,
    BigDecimal platformFee
) {
}
