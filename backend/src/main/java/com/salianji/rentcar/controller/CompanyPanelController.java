package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.*;
import com.salianji.rentcar.exception.ApiException;
import com.salianji.rentcar.security.AuthUser;
import com.salianji.rentcar.service.AdminReportService;
import com.salianji.rentcar.service.BookingService;
import com.salianji.rentcar.service.CompanyService;
import com.salianji.rentcar.service.RentalRules;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

// Paneli i biznesit: çdo kompani sheh VETËM makinat, rezervimet dhe xhiron e vet.
// Vetëm për COMPANY (shih SecurityConfig: /api/company/** → hasRole("COMPANY"))
@RestController
@RequestMapping("/api/company")
public class CompanyPanelController {

    private final BookingService bookingService;
    private final AdminReportService reportService;
    private final CompanyService companyService;

    public CompanyPanelController(BookingService bookingService,
                                  AdminReportService reportService,
                                  CompanyService companyService) {
        this.bookingService = bookingService;
        this.reportService = reportService;
        this.companyService = companyService;
    }

    @GetMapping("/me")
    public PublicCompanyDto me(@AuthenticationPrincipal AuthUser user) {
        return companyService.getForPanel(companyId(user));
    }

    @GetMapping("/bookings")
    public List<BookingDto> bookings(@AuthenticationPrincipal AuthUser user) {
        return bookingService.list(companyId(user));
    }

    @PatchMapping("/bookings/{id}/status")
    public BookingDto updateStatus(@AuthenticationPrincipal AuthUser user,
                                   @PathVariable Long id,
                                   @Valid @RequestBody StatusUpdateRequest request) {
        return bookingService.updateStatus(id, request.status(), companyId(user));
    }

    @GetMapping("/stats")
    public AdminStatsDto stats(@AuthenticationPrincipal AuthUser user) {
        return reportService.companyStats(companyId(user));
    }

    @GetMapping("/revenue")
    public RevenueReportDto revenue(@AuthenticationPrincipal AuthUser user,
                                    @RequestParam(defaultValue = "DAY") RevenuePeriod period) {
        return reportService.revenue(period, companyId(user));
    }

    @GetMapping("/fleet")
    public List<FleetStatusDto> fleet(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reportService.fleetStatus(date != null ? date : RentalRules.today(), companyId(user));
    }

    private static Long companyId(AuthUser user) {
        if (user == null || user.companyId() == null) {
            throw ApiException.forbidden("Llogaria nuk është e lidhur me asnjë kompani.");
        }
        return user.companyId();
    }
}
