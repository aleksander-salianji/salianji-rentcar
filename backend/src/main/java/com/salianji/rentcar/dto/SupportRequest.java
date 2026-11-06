package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.SupportTopic;
import jakarta.validation.constraints.*;

public record SupportRequest(

    @NotNull(message = "Zgjidh temën.")
    SupportTopic topic,

    @NotBlank(message = "Shkruaj emrin.")
    @Size(max = 80, message = "Emri është shumë i gjatë.")
    String name,

    @NotBlank(message = "Shkruaj email-in.")
    @Email(message = "Email nuk është i vlefshëm.")
    @Size(max = 120)
    String email,

    @Size(max = 20, message = "Telefoni është shumë i gjatë.")
    String phone,

    @Size(max = 20, message = "Kodi i rezervimit është shumë i gjatë.")
    String bookingCode,

    @NotBlank(message = "Shkruaj mesazhin.")
    @Size(min = 10, max = 2000, message = "Mesazhi duhet të ketë 10–2000 karaktere.")
    String message,

    // Fushë e fshehur kundër robotëve: njerëzit nuk e plotësojnë
    String website
) {
}
