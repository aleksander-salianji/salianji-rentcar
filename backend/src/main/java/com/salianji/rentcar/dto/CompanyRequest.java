package com.salianji.rentcar.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CompanyRequest(

    @NotBlank(message = "Emri i kompanisë është i detyrueshëm.")
    @Size(max = 80, message = "Emri është shumë i gjatë.")
    String name,

    @NotBlank(message = "Qyteti është i detyrueshëm.")
    @Size(max = 40)
    String city,

    @Size(max = 150, message = "Adresa është shumë e gjatë.")
    String address,

    @Size(max = 20, message = "Telefoni është shumë i gjatë.")
    String phone,

    @Email(message = "Email nuk është i vlefshëm.")
    @Size(max = 120)
    String email,

    @Size(max = 400, message = "Përshkrimi mund të ketë maksimumi 400 karaktere.")
    String description,

    @NotNull(message = "Komisioni është i detyrueshëm.")
    @DecimalMin(value = "0", message = "Komisioni nuk mund të jetë negativ.")
    @DecimalMax(value = "50", message = "Komisioni maksimal është 50%.")
    BigDecimal commissionPercent,

    boolean active
) {
}
