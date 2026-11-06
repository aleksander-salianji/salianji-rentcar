package com.salianji.rentcar.service;

// Ngjarjet që nisin njoftimet me email (dërgohen pasi ruhet rezervimi në databazë)
public final class BookingEvents {

    private BookingEvents() {
    }

    public record Created(Long bookingId) {
    }

    public record StatusChanged(Long bookingId) {
    }
}
