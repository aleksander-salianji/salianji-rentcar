package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.SupportRequest;
import com.salianji.rentcar.dto.SupportStatusRequest;
import com.salianji.rentcar.dto.SupportTicketDto;
import com.salianji.rentcar.service.SupportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// POST /api/support → publik (klientët nuk kanë llogari)
// /api/admin/support/** → vetëm ADMIN (shih SecurityConfig)
@RestController
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    @PostMapping("/api/support")
    @ResponseStatus(HttpStatus.CREATED)
    public SupportTicketDto create(@Valid @RequestBody SupportRequest request) {
        return supportService.create(request);
    }

    @GetMapping("/api/admin/support")
    public List<SupportTicketDto> list() {
        return supportService.list();
    }

    @GetMapping("/api/admin/support/open-count")
    public Map<String, Long> openCount() {
        return Map.of("open", supportService.openCount());
    }

    @PatchMapping("/api/admin/support/{id}/status")
    public SupportTicketDto setStatus(@PathVariable Long id, @Valid @RequestBody SupportStatusRequest request) {
        return supportService.setStatus(id, request.status());
    }
}
