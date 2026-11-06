package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.Company;

// Për klientët (pa komisionin)
public record PublicCompanyDto(
    Long id,
    String name,
    String city,
    String address,
    String phone,
    String email,
    String description,
    long carCount
) {

    public static PublicCompanyDto from(Company c, long carCount) {
        return new PublicCompanyDto(c.getId(), c.getName(), c.getCity(), c.getAddress(), c.getPhone(),
            c.getEmail(), c.getDescription(), carCount);
    }
}
