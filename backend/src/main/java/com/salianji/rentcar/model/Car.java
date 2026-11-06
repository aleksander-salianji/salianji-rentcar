package com.salianji.rentcar.model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "cars")
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String brand;

    @Column(nullable = false, length = 60)
    private String model;

    // "year" është fjalë kyçe në SQL, prandaj kolona quhet ndryshe
    @Column(name = "manufacture_year", nullable = false)
    private int year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CarCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Transmission transmission;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FuelType fuel;

    @Column(nullable = false)
    private int seats;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 300)
    private String description;

    // false = nuk shfaqet te klientët (p.sh. në servis)
    @Column(nullable = false)
    private boolean active = true;

    public Car() {
    }

    public Car(String brand, String model, int year, CarCategory category, Transmission transmission,
               FuelType fuel, int seats, BigDecimal pricePerDay, String description) {
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.category = category;
        this.transmission = transmission;
        this.fuel = fuel;
        this.seats = seats;
        this.pricePerDay = pricePerDay;
        this.description = description;
    }

    public Long getId() { return id; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public CarCategory getCategory() { return category; }
    public void setCategory(CarCategory category) { this.category = category; }

    public Transmission getTransmission() { return transmission; }
    public void setTransmission(Transmission transmission) { this.transmission = transmission; }

    public FuelType getFuel() { return fuel; }
    public void setFuel(FuelType fuel) { this.fuel = fuel; }

    public int getSeats() { return seats; }
    public void setSeats(int seats) { this.seats = seats; }

    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
