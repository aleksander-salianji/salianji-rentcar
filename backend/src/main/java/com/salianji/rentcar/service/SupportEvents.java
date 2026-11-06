package com.salianji.rentcar.service;

// Njoftimi me email për adminin kur vjen një kërkesë e re për ndihmë
public final class SupportEvents {

    private SupportEvents() {
    }

    public record Created(Long ticketId) {
    }
}
