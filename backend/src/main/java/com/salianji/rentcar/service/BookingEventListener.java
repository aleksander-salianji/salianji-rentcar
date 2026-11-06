package com.salianji.rentcar.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class BookingEventListener {

    private final NotificationService notificationService;

    public BookingEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCreated(BookingEvents.Created event) {
        notificationService.newBookingToCompany(event.bookingId());
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onSupportCreated(SupportEvents.Created event) {
        notificationService.newSupportToAdmin(event.ticketId());
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStatusChanged(BookingEvents.StatusChanged event) {
        notificationService.statusToCustomer(event.bookingId());
    }
}
