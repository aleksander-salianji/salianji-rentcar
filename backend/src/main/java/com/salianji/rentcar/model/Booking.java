package com.salianji.rentcar.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // p.sh. SRC-2026-0001 (vendoset pasi merret id-ja)
    @Column(unique = true, length = 20)
    private String code;

    // Rezervimet e vjetra (kur klientët kishin llogari). Të rejat nuk kanë user.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // Klienti rezervon pa llogari: të dhënat ruhen te rezervimi
    @Column(length = 50)
    private String customerFirstName;

    @Column(length = 50)
    private String customerLastName;

    @Column(length = 120)
    private String customerEmail;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(nullable = false, length = 60)
    private String pickupLocation;

    @Column(nullable = false, length = 60)
    private String returnLocation;

    @Column(nullable = false)
    private LocalDate pickupDate;

    @Column(nullable = false)
    private LocalDate returnDate;

    @Column(nullable = false)
    private int days;

    @Column(nullable = false)
    private int driverAge;

    @Column(nullable = false, length = 20)
    private String licenseNumber;

    // Lista e telefonave ruhet në tabelën "booking_phone_numbers"
    @ElementCollection
    @CollectionTable(name = "booking_phone_numbers", joinColumns = @JoinColumn(name = "booking_id"))
    @OrderColumn(name = "position")
    @Column(name = "phone_number", length = 20, nullable = false)
    private List<String> phoneNumbers = new ArrayList<>();

    @Embedded
    private Address address;

    @Embedded
    private BookingExtras extras;

    // Çmimet ruhen në momentin e rezervimit (nëse ndryshon çmimi i makinës më vonë, rezervimi nuk ndikohet)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal extrasPrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    // Pjesa e platformës (komisioni) — ruhet në momentin e rezervimit
    @Column(precision = 10, scale = 2)
    private BigDecimal platformFee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCustomerFirstName() { return customerFirstName; }
    public void setCustomerFirstName(String customerFirstName) { this.customerFirstName = customerFirstName; }

    public String getCustomerLastName() { return customerLastName; }
    public void setCustomerLastName(String customerLastName) { this.customerLastName = customerLastName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerName() {
        return ((customerFirstName == null ? "" : customerFirstName) + " "
            + (customerLastName == null ? "" : customerLastName)).trim();
    }

    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getReturnLocation() { return returnLocation; }
    public void setReturnLocation(String returnLocation) { this.returnLocation = returnLocation; }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public int getDriverAge() { return driverAge; }
    public void setDriverAge(int driverAge) { this.driverAge = driverAge; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public List<String> getPhoneNumbers() { return phoneNumbers; }
    public void setPhoneNumbers(List<String> phoneNumbers) {
        this.phoneNumbers.clear();
        this.phoneNumbers.addAll(phoneNumbers);
    }

    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }

    public BookingExtras getExtras() { return extras; }
    public void setExtras(BookingExtras extras) { this.extras = extras; }

    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public BigDecimal getExtrasPrice() { return extrasPrice; }
    public void setExtrasPrice(BigDecimal extrasPrice) { this.extrasPrice = extrasPrice; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public BigDecimal getPlatformFee() { return platformFee; }
    public void setPlatformFee(BigDecimal platformFee) { this.platformFee = platformFee; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
}
