package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.*;
import com.salianji.rentcar.service.BookingService;
import com.salianji.rentcar.service.CarService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Vetëm për ADMIN (shih SecurityConfig: /api/admin/** → hasRole("ADMIN"))
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CarService carService;
    private final BookingService bookingService;

    public AdminController(CarService carService, BookingService bookingService) {
        this.carService = carService;
        this.bookingService = bookingService;
    }

    // ---------- MAKINAT ----------

    @GetMapping("/cars")
    public List<CarDto> cars() {
        return carService.listAll();
    }

    @PostMapping("/cars")
    @ResponseStatus(HttpStatus.CREATED)
    public CarDto createCar(@Valid @RequestBody CarRequest request) {
        return carService.create(request);
    }

    @PutMapping("/cars/{id}")
    public CarDto updateCar(@PathVariable Long id, @Valid @RequestBody CarRequest request) {
        return carService.update(id, request);
    }

    @DeleteMapping("/cars/{id}")
    public ResponseEntity<Void> deleteCar(@PathVariable Long id) {
        carService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- REZERVIMET ----------

    @GetMapping("/bookings")
    public List<BookingDto> bookings() {
        return bookingService.listAll();
    }

    @PatchMapping("/bookings/{id}/status")
    public BookingDto updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return bookingService.updateStatus(id, request.status());
    }

    // ---------- STATISTIKAT ----------

    @GetMapping("/stats")
    public AdminStatsDto stats() {
        return bookingService.stats();
    }
}
