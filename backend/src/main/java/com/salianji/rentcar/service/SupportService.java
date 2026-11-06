package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.SupportRequest;
import com.salianji.rentcar.dto.SupportTicketDto;
import com.salianji.rentcar.exception.ApiException;
import com.salianji.rentcar.model.SupportStatus;
import com.salianji.rentcar.model.SupportTicket;
import com.salianji.rentcar.repository.SupportTicketRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class SupportService {

    private final SupportTicketRepository repository;
    private final ApplicationEventPublisher events;

    public SupportService(SupportTicketRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    // Klienti dërgon mesazh (pa llogari). Kthen numrin e kërkesës.
    @Transactional
    public SupportTicketDto create(SupportRequest req) {
        SupportTicket t = new SupportTicket();
        t.setTopic(req.topic());
        t.setName(req.name().trim());
        t.setEmail(req.email().trim().toLowerCase(Locale.ROOT));
        t.setPhone(blankToNull(req.phone()));
        t.setBookingCode(req.bookingCode() == null || req.bookingCode().isBlank()
            ? null : req.bookingCode().trim().toUpperCase(Locale.ROOT));
        t.setMessage(req.message().trim());
        t.setStatus(SupportStatus.OPEN);

        // Robot (plotësoi fushën e fshehur): përgjigju si zakonisht, por mos e ruaj
        if (req.website() != null && !req.website().isBlank()) {
            return SupportTicketDto.from(t);
        }

        repository.save(t);
        events.publishEvent(new SupportEvents.Created(t.getId()));
        return SupportTicketDto.from(t);
    }

    // ---------- ADMIN ----------

    @Transactional(readOnly = true)
    public List<SupportTicketDto> list() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(SupportTicketDto::from).toList();
    }

    @Transactional(readOnly = true)
    public long openCount() {
        return repository.countByStatus(SupportStatus.OPEN);
    }

    @Transactional
    public SupportTicketDto setStatus(Long id, SupportStatus status) {
        SupportTicket t = repository.findById(id)
            .orElseThrow(() -> ApiException.notFound("Kërkesa nuk u gjet."));
        t.setStatus(status);
        t.setResolvedAt(status == SupportStatus.RESOLVED ? Instant.now() : null);
        return SupportTicketDto.from(t);
    }

    private static String blankToNull(String v) {
        return v == null || v.isBlank() ? null : v.trim();
    }
}
