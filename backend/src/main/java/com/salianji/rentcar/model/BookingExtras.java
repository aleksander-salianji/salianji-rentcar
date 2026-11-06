package com.salianji.rentcar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

// Ruhet si kolona brenda tabelës "bookings"
@Embeddable
public class BookingExtras {

    @Column(name = "extra_gps", nullable = false)
    private boolean gps;

    @Column(name = "extra_child_seat", nullable = false)
    private boolean childSeat;

    @Column(name = "extra_full_insurance", nullable = false)
    private boolean fullInsurance;

    public BookingExtras() {
    }

    public BookingExtras(boolean gps, boolean childSeat, boolean fullInsurance) {
        this.gps = gps;
        this.childSeat = childSeat;
        this.fullInsurance = fullInsurance;
    }

    public boolean isGps() { return gps; }
    public boolean isChildSeat() { return childSeat; }
    public boolean isFullInsurance() { return fullInsurance; }
}
