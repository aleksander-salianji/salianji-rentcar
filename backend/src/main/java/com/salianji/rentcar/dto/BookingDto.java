package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.Booking;
import com.salianji.rentcar.model.BookingStatus;
import com.salianji.rentcar.model.CarCategory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record BookingDto(
    Long id,
    String code,
    CarSummary car,
    CustomerSummary customer,
    CompanySummary company,
    String pickupLocation,
    String returnLocation,
    LocalDate pickupDate,
    LocalDate returnDate,
    int days,
    int driverAge,
    String licenseNumber,
    List<String> phoneNumbers,
    AddressDto address,
    ExtrasDto extras,
    BigDecimal pricePerDay,
    BigDecimal basePrice,
    BigDecimal extrasPrice,
    BigDecimal discount,
    BigDecimal totalPrice,
    BigDecimal platformFee,
    BookingStatus status,
    Instant createdAt
) {

    public record CarSummary(Long id, String brand, String model, int year, CarCategory category) {
    }

    public record CustomerSummary(Long id, String firstName, String lastName, String email) {
    }

    public record CompanySummary(Long id, String name, String city, String phone) {
    }

    // Duhet thirrur brenda një transaksioni (car dhe phoneNumbers ngarkohen me vonesë)
    public static BookingDto from(Booking b) {
        var c = b.getCar();
        var co = c.getCompany();
        return new BookingDto(
            b.getId(),
            b.getCode(),
            new CarSummary(c.getId(), c.getBrand(), c.getModel(), c.getYear(), c.getCategory()),
            new CustomerSummary(null, b.getCustomerFirstName(), b.getCustomerLastName(), b.getCustomerEmail()),
            co == null ? null : new CompanySummary(co.getId(), co.getName(), co.getCity(), co.getPhone()),
            b.getPickupLocation(),
            b.getReturnLocation(),
            b.getPickupDate(),
            b.getReturnDate(),
            b.getDays(),
            b.getDriverAge(),
            b.getLicenseNumber(),
            List.copyOf(b.getPhoneNumbers()),
            AddressDto.from(b.getAddress()),
            ExtrasDto.from(b.getExtras()),
            b.getPricePerDay(),
            b.getBasePrice(),
            b.getExtrasPrice(),
            b.getDiscount(),
            b.getTotalPrice(),
            b.getPlatformFee() == null ? BigDecimal.ZERO : b.getPlatformFee(),
            b.getStatus(),
            b.getCreatedAt()
        );
    }
}
