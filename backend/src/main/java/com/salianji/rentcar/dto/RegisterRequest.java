package com.salianji.rentcar.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

    @NotBlank(message = "Emri është i detyrueshëm.")
    @Size(min = 2, max = 50, message = "Emri duhet të ketë 2–50 shkronja.")
    String firstName,

    @NotBlank(message = "Mbiemri është i detyrueshëm.")
    @Size(min = 2, max = 50, message = "Mbiemri duhet të ketë 2–50 shkronja.")
    String lastName,

    @NotBlank(message = "Email është i detyrueshëm.")
    @Email(message = "Email nuk është i vlefshëm.")
    @Size(max = 120)
    String email,

    @NotBlank(message = "Telefoni është i detyrueshëm.")
    @Pattern(regexp = ValidationPatterns.PHONE, message = "Numri i telefonit nuk është i vlefshëm.")
    String phone,

    @NotBlank(message = "Fjalëkalimi është i detyrueshëm.")
    @Pattern(regexp = ValidationPatterns.PASSWORD,
             message = "Fjalëkalimi duhet të ketë të paktën 8 karaktere, me shkronja dhe shifra.")
    @Size(max = 100)
    String password
) {
}
