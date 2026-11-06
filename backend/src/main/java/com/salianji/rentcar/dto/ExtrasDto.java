package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.BookingExtras;

public record ExtrasDto(boolean gps, boolean childSeat, boolean fullInsurance) {

    public static ExtrasDto from(BookingExtras e) {
        return e == null
            ? new ExtrasDto(false, false, false)
            : new ExtrasDto(e.isGps(), e.isChildSeat(), e.isFullInsurance());
    }
}
