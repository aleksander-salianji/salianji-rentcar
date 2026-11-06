package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.Address;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressDto(

    @NotBlank(message = "Rruga është e detyrueshme.")
    @Size(max = 150, message = "Rruga është shumë e gjatë.")
    String street,

    @NotBlank(message = "Qyteti është i detyrueshëm.")
    @Size(max = 60, message = "Qyteti është shumë i gjatë.")
    String city,

    @Pattern(regexp = ValidationPatterns.ZIP_CODE, message = "Kodi postar duhet të ketë 4 shifra.")
    String zipCode
) {

    public static AddressDto from(Address a) {
        return a == null ? null : new AddressDto(a.getStreet(), a.getCity(), a.getZipCode());
    }
}
