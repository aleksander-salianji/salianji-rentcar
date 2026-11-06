package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.Company;

import java.math.BigDecimal;

// Për panelin e adminit (përfshin komisionin)
public record CompanyDto(
    Long id,
    String name,
    String city,
    String address,
    String phone,
    String email,
    String description,
    BigDecimal commissionPercent,
    boolean active,
    long carCount,
    String accountEmail   // email-i i login-it të kompanisë (null = pa llogari)
) {

    public static CompanyDto from(Company c, long carCount, String accountEmail) {
        return new CompanyDto(c.getId(), c.getName(), c.getCity(), c.getAddress(), c.getPhone(), c.getEmail(),
            c.getDescription(), c.getCommissionPercent(), c.isActive(), carCount, accountEmail);
    }
}
