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
    BookingStatus status,
    Instant createdAt
) {

    public record CarSummary(Long id, String brand, String model, int year, CarCategory category) {
    }

    public record CustomerSummary(Long id, String firstName, String lastName, String email) {
    }

    // Duhet thirrur brenda një transaksioni (car, user dhe phoneNumbers ngarkohen me vonesë)
    public static BookingDto from(Booking b) {
        var c = b.getCar();
        var u = b.getUser();
        return new BookingDto(
            b.getId(),
            b.getCode(),
            new CarSummary(c.getId(), c.getBrand(), c.getModel(), c.getYear(), c.getCategory()),
            new CustomerSummary(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail()),
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
            b.getStatus(),
            b.getCreatedAt()
        );
    }
}
