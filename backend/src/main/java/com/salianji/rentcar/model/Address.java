package com.salianji.rentcar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

// Ruhet si kolona brenda tabelës "bookings"
@Embeddable
public class Address {

    @Column(name = "address_street", length = 150)
    private String street;

    @Column(name = "address_city", length = 60)
    private String city;

    @Column(name = "address_zip_code", length = 10)
    private String zipCode;

    public Address() {
    }

    public Address(String street, String city, String zipCode) {
        this.street = street;
        this.city = city;
        this.zipCode = zipCode;
    }

    public String getStreet() { return street; }
    public String getCity() { return city; }
    public String getZipCode() { return zipCode; }
}
