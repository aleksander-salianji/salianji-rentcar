package com.salianji.rentcar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BookingLookupRequest(

    @NotBlank(message = "Shkruaj kodin e rezervimit.")
    @Size(max = 20)
    String code,

    @NotBlank(message = "Shkruaj numrin e telefonit.")
    @Size(max = 20)
    String phone
) {
}
