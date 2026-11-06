package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.CarCategory;
import com.salianji.rentcar.model.FuelType;
import com.salianji.rentcar.model.Transmission;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CarRequest(

    @NotBlank(message = "Marka është e detyrueshme.")
    @Size(max = 40, message = "Marka është shumë e gjatë.")
    String brand,

    @NotBlank(message = "Modeli është i detyrueshëm.")
    @Size(max = 60, message = "Modeli është shumë i gjatë.")
    String model,

    @NotNull(message = "Viti është i detyrueshëm.")
    @Min(value = 2000, message = "Viti duhet të jetë 2000 ose më i ri.")
    @Max(value = 2100, message = "Viti nuk është i vlefshëm.")
    Integer year,

    @NotNull(message = "Kategoria është e detyrueshme.")
    CarCategory category,

    @NotNull(message = "Kambio është e detyrueshme.")
    Transmission transmission,

    @NotNull(message = "Karburanti është i detyrueshëm.")
    FuelType fuel,

    @NotNull(message = "Numri i vendeve është i detyrueshëm.")
    @Min(value = 2, message = "Të paktën 2 vende.")
    @Max(value = 9, message = "Maksimumi 9 vende.")
    Integer seats,

    @NotNull(message = "Çmimi është i detyrueshëm.")
    @DecimalMin(value = "1", message = "Çmimi duhet të jetë të paktën 1 €.")
    @DecimalMax(value = "1000", message = "Çmimi maksimal është 1000 €.")
    @Digits(integer = 6, fraction = 2, message = "Çmimi mund të ketë deri në 2 shifra pas presjes.")
    BigDecimal pricePerDay,

    @Size(max = 500, message = "URL e fotos është shumë e gjatë.")
    @Pattern(regexp = ValidationPatterns.URL, message = "URL e fotos duhet të fillojë me http:// ose https://")
    String imageUrl,

    @Size(max = 300, message = "Përshkrimi mund të ketë maksimumi 300 karaktere.")
    String description,

    @NotNull(message = "Zgjidh kompaninë.")
    Long companyId,

    boolean active
) {
}
