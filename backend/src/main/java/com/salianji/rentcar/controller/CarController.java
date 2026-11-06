package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.BookedPeriodDto;
import com.salianji.rentcar.dto.CarDto;
import com.salianji.rentcar.service.CarService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Publike: nuk kërkon login
@RestController
@RequestMapping("/api/cars")
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @GetMapping
    public List<CarDto> list() {
        return carService.listActive();
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
