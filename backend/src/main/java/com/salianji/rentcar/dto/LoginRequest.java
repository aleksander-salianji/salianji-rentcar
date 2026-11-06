package com.salianji.rentcar.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(

    @NotBlank(message = "Email është i detyrueshëm.")
    String email,

    @NotBlank(message = "Fjalëkalimi është i detyrueshëm.")
    String password
) {
}
