package com.salianji.rentcar.dto;

import java.time.LocalDate;

public record BookedPeriodDto(LocalDate pickupDate, LocalDate returnDate) {
}
