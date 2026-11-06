package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.Booking;
import com.salianji.rentcar.model.BookingStatus;
import com.salianji.rentcar.model.Car;
import com.salianji.rentcar.model.CarCategory;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FleetStatusDto(CarInfo car, State state, BookingInfo current, BookingInfo next) {

    public enum State {
        FREE,       // e lirë
        OCCUPIED,   // e zënë
        INACTIVE    // çaktivizuar / në servis
    }

    public record CarInfo(Long id, String brand, String model, int year, CarCategory category,
                          BigDecimal pricePerDay, boolean active, Long companyId, String companyName) {

        public static CarInfo from(Car c) {
            var co = c.getCompany();
            return new CarInfo(c.getId(), c.getBrand(), c.getModel(), c.getYear(), c.getCategory(),
                c.getPricePerDay(), c.isActive(),
                co == null ? null : co.getId(), co == null ? null : co.getName());
        }
    }

    public record BookingInfo(Long id, String code, String customerName, String customerEmail, String phone,
                              LocalDate pickupDate, LocalDate returnDate,
                              String pickupLocation, String returnLocation, BookingStatus status) {

        public static BookingInfo from(Booking b) {
            if (b == null) {
                return null;
            }
            String phone = b.getPhoneNumbers().isEmpty() ? null : b.getPhoneNumbers().get(0);
            return new BookingInfo(b.getId(), b.getCode(), b.getCustomerName(), b.getCustomerEmail(),
                phone, b.getPickupDate(), b.getReturnDate(), b.getPickupLocation(), b.getReturnLocation(),
                b.getStatus());
        }
    }
}
