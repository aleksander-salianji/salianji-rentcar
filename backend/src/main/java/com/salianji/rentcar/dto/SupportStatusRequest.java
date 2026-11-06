package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.SupportStatus;
import jakarta.validation.constraints.NotNull;

public record SupportStatusRequest(@NotNull(message = "Zgjidh statusin.") SupportStatus status) {
}
