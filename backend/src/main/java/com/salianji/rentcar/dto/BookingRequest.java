package com.salianji.rentcar.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record BookingRequest(

    @NotNull(message = "Zgjidh makinën.")
    Long carId,

    @NotBlank(message = "Zgjidh vendin e marrjes.")
    String pickupLocation,

    @NotBlank(message = "Zgjidh vendin e kthimit.")
    String returnLocation,

    @NotNull(message = "Zgjidh datën e marrjes.")
    LocalDate pickupDate,

    @NotNull(message = "Zgjidh datën e kthimit.")
    LocalDate returnDate,

    @NotNull(message = "Shkruaj moshën e shoferit.")
    Integer driverAge,

    @NotBlank(message = "Shkruaj numrin e patentës.")
    @Pattern(regexp = ValidationPatterns.LICENSE, message = "Patenta duhet të ketë 6–12 shkronja ose shifra.")
    String licenseNumber,

    @NotEmpty(message = "Shkruaj të paktën një numër telefoni.")
    @Size(max = 3, message = "Maksimumi 3 numra telefoni.")
    List<@NotBlank @Pattern(regexp = ValidationPatterns.PHONE, message = "Numri i telefonit nuk është i vlefshëm.") String> phoneNumbers,

    @NotNull(message = "Shkruaj adresën.")
    @Valid
    AddressDto address,

    @NotNull
    ExtrasDto extras
) {
}
