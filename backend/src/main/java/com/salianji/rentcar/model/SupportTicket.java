package com.salianji.rentcar.model;

import jakarta.persistence.*;

import java.time.Instant;

// Mesazh nga një klient (pa llogari) drejt supportit të platformës
@Entity
@Table(name = "support_tickets")
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SupportTopic topic;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 20)
    private String phone;

    // Kodi i rezervimit (opsional), p.sh. BCA-2026-0001
    @Column(length = 20)
    private String bookingCode;

    @Column(nullable = false, length = 2000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SupportStatus status = SupportStatus.OPEN;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant resolvedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public Long getId() { return id; }

    public SupportTopic getTopic() { return topic; }
    public void setTopic(SupportTopic topic) { this.topic = topic; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBookingCode() { return bookingCode; }
    public void setBookingCode(String bookingCode) { this.bookingCode = bookingCode; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public SupportStatus getStatus() { return status; }
    public void setStatus(SupportStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
