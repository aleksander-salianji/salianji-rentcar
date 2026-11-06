package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.BookedPeriodDto;
import com.salianji.rentcar.dto.CarDto;
import com.salianji.rentcar.service.CarService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

// Publike: nuk kërkon login
@RestController
@RequestMapping("/api/cars")
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    // Kërkimi: /api/cars?city=Tiranë&from=2026-11-10&to=2026-11-14&companyId=2 (të gjitha opsionale)
    @GetMapping
    public List<CarDto> list(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Long companyId) {
        return carService.search(city, from, to, companyId);
    }

    @GetMapping("/{id}")
    public CarDto get(@PathVariable Long id) {
        return carService.getActive(id);
    }

    @GetMapping("/{id}/booked-periods")
    public List<BookedPeriodDto> bookedPeriods(@PathVariable Long id) {
        return carService.bookedPeriods(id);
    }
}
