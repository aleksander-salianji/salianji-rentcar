package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.BookingDto;
import com.salianji.rentcar.dto.BookingLookupRequest;
import com.salianji.rentcar.dto.BookingRequest;
import com.salianji.rentcar.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

// Publike: klienti rezervon pa llogari.
// Për ta parë ose anuluar rezervimin i duhen kodi + numri i telefonit.
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingDto create(@Valid @RequestBody BookingRequest request) {
        return bookingService.create(request);
    }

    // POST (jo GET) që telefoni të mos dalë në URL / log-e
    @PostMapping("/lookup")
    public BookingDto lookup(@Valid @RequestBody BookingLookupRequest request) {
        return bookingService.lookup(request.code(), request.phone());
    }

    @PostMapping("/cancel")
    public BookingDto cancel(@Valid @RequestBody BookingLookupRequest request) {
        return bookingService.cancel(request.code(), request.phone());
    }
}
