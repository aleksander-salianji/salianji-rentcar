package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.BookingDto;
import com.salianji.rentcar.dto.BookingRequest;
import com.salianji.rentcar.security.AuthUser;
import com.salianji.rentcar.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Kërkon login (shih SecurityConfig)
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingDto create(@AuthenticationPrincipal AuthUser user,
                             @Valid @RequestBody BookingRequest request) {
        return bookingService.create(user.id(), request);
    }

    @GetMapping("/my")
    public List<BookingDto> myBookings(@AuthenticationPrincipal AuthUser user) {
        return bookingService.myBookings(user.id());
    }

    @PatchMapping("/{id}/cancel")
    public BookingDto cancel(@AuthenticationPrincipal AuthUser user, @PathVariable Long id) {
        return bookingService.cancel(user.id(), id);
    }
}
