package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.*;
import com.salianji.rentcar.service.AdminReportService;
import com.salianji.rentcar.service.BookingService;
import com.salianji.rentcar.service.CarService;
import com.salianji.rentcar.service.CompanyService;
import com.salianji.rentcar.service.RentalRules;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

// Vetëm për ADMIN (shih SecurityConfig: /api/admin/** → hasRole("ADMIN"))
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CarService carService;
    private final BookingService bookingService;
    private final AdminReportService reportService;
    private final CompanyService companyService;

    public AdminController(CarService carService,
                           BookingService bookingService,
                           AdminReportService reportService,
                           CompanyService companyService) {
        this.carService = carService;
        this.bookingService = bookingService;
        this.reportService = reportService;
        this.companyService = companyService;
    }

    // ---------- KOMPANITË ----------

    @GetMapping("/companies")
    public List<CompanyDto> companies() {
        return companyService.listAll();
    }

    @PostMapping("/companies")
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyDto createCompany(@Valid @RequestBody CompanyRequest request) {
        return companyService.create(request);
    }

    @PutMapping("/companies/{id}")
    public CompanyDto updateCompany(@PathVariable Long id, @Valid @RequestBody CompanyRequest request) {
        return companyService.update(id, request);
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Login-i i kompanisë (krijohet ose ndryshohet nga admini)
    @PutMapping("/companies/{id}/account")
    public CompanyDto setCompanyAccount(@PathVariable Long id, @Valid @RequestBody CompanyAccountRequest request) {
        return companyService.setAccount(id, request);
    }

    // Xhiro dhe komisioni për çdo kompani
    @GetMapping("/companies/report")
    public List<CompanyReportDto> companyReport() {
        return companyService.report();
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

    // Ngarkimi i fotos: multipart/form-data me fushën "file"
    @PostMapping(value = "/cars/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CarDto uploadCarImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return carService.uploadImage(id, file);
    }

    @DeleteMapping("/cars/{id}/image")
    public CarDto removeCarImage(@PathVariable Long id) {
        return carService.removeImage(id);
    }

    // ---------- REZERVIMET ----------

    @GetMapping("/bookings")
    public List<BookingDto> bookings() {
        return bookingService.list(null);
    }

    @PatchMapping("/bookings/{id}/status")
    public BookingDto updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return bookingService.updateStatus(id, request.status(), null);
    }

    // ---------- RAPORTET ----------

    @GetMapping("/stats")
    public AdminStatsDto stats() {
        return reportService.stats();
    }

    // Xhiro: ?period=DAY | WEEK | MONTH
    @GetMapping("/revenue")
    public RevenueReportDto revenue(@RequestParam(defaultValue = "DAY") RevenuePeriod period) {
        return reportService.revenue(period, null);
    }

    // Gjendja e flotës në një datë: ?date=2026-11-06 (pa datë = sot)
    @GetMapping("/fleet")
    public List<FleetStatusDto> fleet(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reportService.fleetStatus(date != null ? date : RentalRules.today(), null);
    }
}
