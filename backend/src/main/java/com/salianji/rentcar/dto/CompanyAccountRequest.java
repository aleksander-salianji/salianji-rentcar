package com.salianji.rentcar.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Admini krijon / ndryshon login-in e një kompanie
public record CompanyAccountRequest(

    @NotBlank(message = "Shkruaj email-in e hyrjes.")
    @Email(message = "Email nuk është i vlefshëm.")
    @Size(max = 120)
    String email,

    @NotBlank(message = "Shkruaj fjalëkalimin.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
             message = "Fjalëkalimi duhet të ketë të paktën 8 karaktere, me shkronja dhe shifra.")
    String password
) {
}
