package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.Car;
import com.salianji.rentcar.model.CarCategory;
import com.salianji.rentcar.model.FuelType;
import com.salianji.rentcar.model.Transmission;

import java.math.BigDecimal;

public record CarDto(
    Long id,
    String brand,
    String model,
    int year,
    CarCategory category,
    Transmission transmission,
    FuelType fuel,
    int seats,
    BigDecimal pricePerDay,
    String imageUrl,
    String description,
    boolean active
) {

    public static CarDto from(Car c) {
        return new CarDto(c.getId(), c.getBrand(), c.getModel(), c.getYear(), c.getCategory(),
            c.getTransmission(), c.getFuel(), c.getSeats(), c.getPricePerDay(),
            c.getImageUrl(), c.getDescription(), c.isActive());
    }
}
