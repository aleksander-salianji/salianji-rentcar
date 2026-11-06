package com.salianji.rentcar.service;

import com.salianji.rentcar.model.Booking;
import com.salianji.rentcar.model.BookingStatus;
import com.salianji.rentcar.model.Company;
import com.salianji.rentcar.model.SupportTicket;
import com.salianji.rentcar.repository.BookingRepository;
import com.salianji.rentcar.repository.SupportTicketRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

// Dërgon email-et e rezervimeve.
// Nëse email-i nuk është konfiguruar te application.properties (spring.mail.*),
// mesazhi shkruhet vetëm në log dhe aplikacioni vazhdon normalisht.
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final BookingRepository bookingRepository;
    private final SupportTicketRepository supportRepository;
    private final ObjectProvider<JavaMailSender> mailSender;
    private final String from;
    private final String platformName;
    private final String supportEmail;

    public NotificationService(BookingRepository bookingRepository,
                               SupportTicketRepository supportRepository,
                               ObjectProvider<JavaMailSender> mailSender,
                               @Value("${app.mail.from:${spring.mail.username:}}") String from,
                               @Value("${app.name:Bookers Car Albania}") String platformName,
                               @Value("${app.support.email:${app.admin.email}}") String supportEmail) {
        this.bookingRepository = bookingRepository;
        this.supportRepository = supportRepository;
        this.mailSender = mailSender;
        this.from = from;
        this.platformName = platformName;
        this.supportEmail = supportEmail;
    }

    // Admini merr çdo kërkesë të re për ndihmë (përgjigjja shkon direkt te klienti me Reply)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void newSupportToAdmin(Long ticketId) {
        SupportTicket t = supportRepository.findById(ticketId).orElse(null);
        if (t == null) {
            return;
        }
        String subject = "Ndihmë #" + t.getId() + " – " + t.getTopic() + " – " + t.getName();
        String body = """
            Kërkesë e re për ndihmë te %s.

            Nr.:        #%d
            Tema:       %s
            Emri:       %s
            Email:      %s
            Telefoni:   %s
            Rezervimi:  %s

            %s

            Përgjigju këtij email-i për t'i shkruar klientit direkt.
            Shëno si "e zgjidhur" te Paneli i adminit → Support.
            """.formatted(
            platformName, t.getId(), t.getTopic(), t.getName(), t.getEmail(),
            t.getPhone() == null ? "-" : t.getPhone(),
            t.getBookingCode() == null ? "-" : t.getBookingCode(),
            t.getMessage()
        );
        send(supportEmail, subject, body, t.getEmail());
    }

    // Kompania merr rezervimin e ri me të gjitha detajet
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void newBookingToCompany(Long bookingId) {
        Booking b = bookingRepository.findWithDetailsById(bookingId).orElse(null);
        if (b == null) {
            return;
        }
        Company company = b.getCar().getCompany();
        String to = company == null ? null : company.getEmail();

        String subject = "Rezervim i ri " + b.getCode() + " – " + b.getCar().getBrand() + " " + b.getCar().getModel()
            + " (" + b.getPickupDate().format(DATE) + " – " + b.getReturnDate().format(DATE) + ")";

        List<String> extras = new ArrayList<>();
        if (b.getExtras() != null) {
            if (b.getExtras().isGps()) extras.add("GPS");
            if (b.getExtras().isChildSeat()) extras.add("Karrige për fëmijë");
            if (b.getExtras().isFullInsurance()) extras.add("Sigurim i plotë");
        }

        String body = """
            Përshëndetje %s,

            Keni një rezervim të ri nga %s.

            Kodi:            %s
            Makina:          %s %s (%d)
            Marrja:          %s · %s
            Kthimi:          %s · %s
            Ditë:            %d
            Shtesat:         %s
            Totali:          %s €
            Komisioni:       %s €

            KLIENTI
            Emri:            %s %s
            Email:           %s
            Telefoni:        %s
            Mosha:           %d
            Patenta:         %s
            Adresa:          %s, %s %s

            Ju lutem kontaktoni klientin dhe konfirmoni rezervimin
            te paneli i biznesit në %s (Hyr · Biznese).
            Statusi në platformë: Në pritje.

            %s
            """.formatted(
            company == null ? "" : company.getName(), platformName,
            b.getCode(),
            b.getCar().getBrand(), b.getCar().getModel(), b.getCar().getYear(),
            b.getPickupDate().format(DATE), b.getPickupLocation(),
            b.getReturnDate().format(DATE), b.getReturnLocation(),
            b.getDays(),
            extras.isEmpty() ? "Asnjë" : String.join(", ", extras),
            b.getTotalPrice(),
            b.getPlatformFee() == null ? "0.00" : b.getPlatformFee(),
            b.getCustomerFirstName(), b.getCustomerLastName(),
            b.getCustomerEmail(),
            String.join(", ", b.getPhoneNumbers()),
            b.getDriverAge(),
            b.getLicenseNumber(),
            b.getAddress() == null ? "" : b.getAddress().getStreet(),
            b.getAddress() == null ? "" : b.getAddress().getCity(),
            b.getAddress() == null || b.getAddress().getZipCode() == null ? "" : b.getAddress().getZipCode(),
            platformName,
            platformName
        );

        send(to, subject, body, b.getCustomerEmail());
    }

    // Klienti njoftohet kur rezervimi konfirmohet ose anulohet
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void statusToCustomer(Long bookingId) {
        Booking b = bookingRepository.findWithDetailsById(bookingId).orElse(null);
        if (b == null || (b.getStatus() != BookingStatus.CONFIRMED && b.getStatus() != BookingStatus.CANCELLED)) {
            return;
        }
        boolean confirmed = b.getStatus() == BookingStatus.CONFIRMED;
        Company company = b.getCar().getCompany();

        String subject = (confirmed ? "Rezervimi u konfirmua " : "Rezervimi u anulua ") + b.getCode();
        String body = """
            Përshëndetje %s,

            Rezervimi juaj %s për %s %s %s.

            Marrja:   %s · %s
            Kthimi:   %s · %s
            Totali:   %s € (paguhet në momentin e marrjes)

            Kompania: %s%s

            Kodi dhe numri i telefonit ju duhen për të parë rezervimin te "Rezervimi im".

            Faleminderit që zgjodhët %s.
            """.formatted(
            b.getCustomerFirstName(),
            b.getCode(), b.getCar().getBrand(), b.getCar().getModel(),
            confirmed ? "u konfirmua" : "u anulua",
            b.getPickupDate().format(DATE), b.getPickupLocation(),
            b.getReturnDate().format(DATE), b.getReturnLocation(),
            b.getTotalPrice(),
            company == null ? "-" : company.getName(),
            company == null || company.getPhone() == null ? "" : " · " + company.getPhone(),
            platformName
        );

        send(b.getCustomerEmail(), subject, body, company == null ? null : company.getEmail());
    }

    private void send(String to, String subject, String body, String replyTo) {
        JavaMailSender sender = mailSender.getIfAvailable();
        if (to == null || to.isBlank()) {
            log.warn("Email-i nuk u dërgua (mungon adresa): {}", subject);
            return;
        }
        if (sender == null || from == null || from.isBlank()) {
            log.info("Email-i nuk është konfiguruar. Do të dërgohej te {}:\n{}\n{}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            if (replyTo != null && !replyTo.isBlank()) {
                msg.setReplyTo(replyTo);
            }
            msg.setSubject(subject);
            msg.setText(body);
            sender.send(msg);
            log.info("Email u dërgua te {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Email-i te {} nuk u dërgua: {}", to, e.getMessage());
        }
    }
}
