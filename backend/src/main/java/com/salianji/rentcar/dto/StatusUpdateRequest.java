package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
    @NotNull(message = "Statusi është i detyrueshëm.")
    BookingStatus status
) {
}
