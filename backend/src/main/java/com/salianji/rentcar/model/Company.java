package com.salianji.rentcar.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;

// Kompania e qirasë që i ofron makinat e saj në platformë
@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 40)
    private String city;

    @Column(length = 150)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(length = 120)
    private String email;

    @Column(length = 400)
    private String description;

    // Komisioni i platformës për çdo rezervim të konfirmuar (në %)
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionPercent = BigDecimal.TEN;

    // false = kompania dhe makinat e saj nuk shfaqen te klientët
    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getCommissionPercent() { return commissionPercent; }
    public void setCommissionPercent(BigDecimal commissionPercent) { this.commissionPercent = commissionPercent; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
}
