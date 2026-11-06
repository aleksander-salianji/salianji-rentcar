package com.salianji.rentcar.dto;

import jakarta.validation.constraints.*;

public record BlogPostRequest(

    @NotBlank(message = "Shkruaj titullin.")
    @Size(max = 150, message = "Titulli mund të ketë maksimumi 150 karaktere.")
    String title,

    // Opsional: nëse lihet bosh, krijohet nga titulli
    @Size(max = 160)
    @Pattern(regexp = "^[a-z0-9-]*$", message = "Adresa lejon vetëm shkronja të vogla, shifra dhe '-'.")
    String slug,

    @NotBlank(message = "Shkruaj përmbledhjen.")
    @Size(max = 300, message = "Përmbledhja mund të ketë maksimumi 300 karaktere.")
    String excerpt,

    @NotBlank(message = "Shkruaj përmbajtjen.")
    @Size(max = 60000, message = "Artikulli është shumë i gjatë.")
    String content,

    @Size(max = 500)
    @Pattern(regexp = ValidationPatterns.URL, message = "Adresa e fotos duhet të fillojë me http(s)://")
    String coverImageUrl,

    @NotBlank(message = "Zgjidh kategorinë.")
    @Size(max = 40)
    String category,

    boolean published
) {
}
