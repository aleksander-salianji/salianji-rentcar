package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.SupportStatus;
import com.salianji.rentcar.model.SupportTicket;
import com.salianji.rentcar.model.SupportTopic;

import java.time.Instant;

public record SupportTicketDto(
    Long id,
    SupportTopic topic,
    String name,
    String email,
    String phone,
    String bookingCode,
    String message,
    SupportStatus status,
    Instant createdAt,
    Instant resolvedAt
) {

    public static SupportTicketDto from(SupportTicket t) {
        return new SupportTicketDto(t.getId(), t.getTopic(), t.getName(), t.getEmail(), t.getPhone(),
            t.getBookingCode(), t.getMessage(), t.getStatus(), t.getCreatedAt(), t.getResolvedAt());
    }
}
