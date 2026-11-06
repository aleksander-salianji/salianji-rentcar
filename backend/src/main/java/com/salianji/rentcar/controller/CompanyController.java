package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.PublicCompanyDto;
import com.salianji.rentcar.service.CompanyService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Publike: lista e kompanive partnere
@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<PublicCompanyDto> list() {
        return companyService.listPublic();
    }

    @GetMapping("/{id}")
    public PublicCompanyDto get(@PathVariable Long id) {
        return companyService.getPublic(id);
    }
}
