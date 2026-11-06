package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.BookingDto;
import com.salianji.rentcar.dto.BookingRequest;
import com.salianji.rentcar.exception.ApiException;
import com.salianji.rentcar.model.*;
import com.salianji.rentcar.repository.BookingRepository;
import com.salianji.rentcar.repository.CarRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

import static com.salianji.rentcar.service.CarService.ACTIVE_STATUSES;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final ApplicationEventPublisher events;

    public BookingService(BookingRepository bookingRepository,
                          CarRepository carRepository,
                          ApplicationEventPublisher events) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.events = events;
    }


    // ================= KLIENTI (pa llogari) =================

    @Transactional
    public BookingDto create(BookingRequest req) {
        LocalDate today = RentalRules.today();
        LocalDate from = req.pickupDate();
        LocalDate to = req.returnDate();

        // ---------- validimi i rregullave të biznesit ----------
        if (!RentalRules.LOCATIONS.contains(req.pickupLocation())
                || !RentalRules.LOCATIONS.contains(req.returnLocation())) {
            throw ApiException.badRequest("Vendi i marrjes ose i kthimit nuk është i vlefshëm.");
        }
        if (from.isBefore(today)) {
            throw ApiException.badRequest("Data e marrjes nuk mund të jetë në të kaluarën.");
        }
        if (!to.isAfter(from)) {
            throw ApiException.badRequest("Data e kthimit duhet të jetë pas datës së marrjes.");
        }
        int days = (int) ChronoUnit.DAYS.between(from, to);
        if (days < RentalRules.MIN_DAYS) {
            throw ApiException.badRequest("Qiraja minimale është " + RentalRules.MIN_DAYS + " ditë.");
        }
        if (days > RentalRules.MAX_DAYS) {
            throw ApiException.badRequest("Qiraja nuk mund të zgjasë më shumë se " + RentalRules.MAX_DAYS + " ditë.");
        }
        if (req.driverAge() < RentalRules.MIN_DRIVER_AGE || req.driverAge() > RentalRules.MAX_DRIVER_AGE) {
            throw ApiException.badRequest("Mosha e shoferit duhet të jetë "
                + RentalRules.MIN_DRIVER_AGE + "–" + RentalRules.MAX_DRIVER_AGE + " vjeç.");
        }

        // Blloko makinën deri në fund të transaksionit (mbron nga dy rezervime njëkohësisht)
        Car car = carRepository.findByIdForUpdate(req.carId())
            .filter(Car::isActive)
            .filter(c -> c.getCompany() == null || c.getCompany().isActive())
            .orElseThrow(() -> ApiException.notFound("Makina nuk u gjet."));

        if (bookingRepository.existsOverlap(car.getId(), from, to, ACTIVE_STATUSES)) {
            throw ApiException.conflict("Makina është e zënë për këto data. Zgjidh data të tjera.");
        }

        PriceCalculator.Price price = PriceCalculator.calculate(car.getPricePerDay(), days, req.extras());

        // ---------- ruajtja ----------
        Booking booking = new Booking();
        booking.setCustomerFirstName(req.firstName().trim());
        booking.setCustomerLastName(req.lastName().trim());
        booking.setCustomerEmail(req.email().trim().toLowerCase(Locale.ROOT));
        booking.setCar(car);
        booking.setPickupLocation(req.pickupLocation());
        booking.setReturnLocation(req.returnLocation());
        booking.setPickupDate(from);
        booking.setReturnDate(to);
        booking.setDays(days);
        booking.setDriverAge(req.driverAge());
        booking.setLicenseNumber(req.licenseNumber().trim().toUpperCase(Locale.ROOT));
        booking.setPhoneNumbers(req.phoneNumbers().stream().map(String::trim).toList());
        booking.setAddress(new Address(
            req.address().street().trim(),
            req.address().city().trim(),
            req.address().zipCode() == null ? null : req.address().zipCode().trim()
        ));
        booking.setExtras(new BookingExtras(req.extras().gps(), req.extras().childSeat(), req.extras().fullInsurance()));
        booking.setPricePerDay(price.pricePerDay());
        booking.setBasePrice(price.basePrice());
        booking.setExtrasPrice(price.extrasPrice());
        booking.setDiscount(price.discount());
        booking.setTotalPrice(price.totalPrice());
        // komisioni i platformës sipas përqindjes së kompanisë
        BigDecimal percent = car.getCompany() == null ? BigDecimal.ZERO : car.getCompany().getCommissionPercent();
        booking.setPlatformFee(price.totalPrice().multiply(percent)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        booking.setStatus(BookingStatus.PENDING);

        bookingRepository.saveAndFlush(booking);

        // Kodi ndërtohet nga id-ja: BCA-2026-0001
        booking.setCode(String.format("BCA-%d-%04d", today.getYear(), booking.getId()));

        // njoftimi me email te kompania (pasi të ruhet rezervimi)
        events.publishEvent(new BookingEvents.Created(booking.getId()));

        return BookingDto.from(booking);
    }

    // Klienti e gjen rezervimin me kodin + një nga numrat e telefonit të rezervimit
    @Transactional(readOnly = true)
    public BookingDto lookup(String code, String phone) {
        return BookingDto.from(findByCodeAndPhone(code, phone));
    }

    @Transactional
    public BookingDto cancel(String code, String phone) {
        Booking booking = findByCodeAndPhone(code, phone);

        if (!ACTIVE_STATUSES.contains(booking.getStatus())) {
            throw ApiException.badRequest("Ky rezervim nuk mund të anulohet.");
        }
        Instant deadline = booking.getCreatedAt().plus(RentalRules.CANCELLATION_WINDOW_HOURS, ChronoUnit.HOURS);
        if (Instant.now().isAfter(deadline)) {
            throw ApiException.badRequest("Rezervimi mund të anulohet vetëm brenda "
                + RentalRules.CANCELLATION_WINDOW_HOURS + " orëve nga krijimi. Për ndryshime telefono kompaninë.");
        }
        if (!booking.getPickupDate().isAfter(RentalRules.today())) {
            throw ApiException.badRequest("Rezervimi nuk mund të anulohet në ditën e marrjes ose më vonë.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        events.publishEvent(new BookingEvents.StatusChanged(booking.getId()));
        return BookingDto.from(booking);
    }

    private Booking findByCodeAndPhone(String code, String phone) {
        String wanted = digits(phone);
        if (code == null || code.isBlank() || wanted.length() < 7) {
            throw ApiException.badRequest("Shkruaj kodin e rezervimit dhe numrin e telefonit.");
        }
        // I njëjti mesazh nëse kodi ose telefoni është gabim (mos zbulo cili)
        return bookingRepository.findWithDetailsByCode(code.trim().toUpperCase(Locale.ROOT))
            .filter(b -> b.getPhoneNumbers().stream().map(BookingService::digits).anyMatch(p -> samePhone(p, wanted)))
            .orElseThrow(() -> ApiException.notFound("Nuk u gjet asnjë rezervim me këtë kod dhe telefon."));
    }

    private static String digits(String s) {
        return s == null ? "" : s.replaceAll("\\D", "");
    }

    // 0691234567 dhe +355691234567 janë i njëjti numër
    private static boolean samePhone(String a, String b) {
        String x = a.startsWith("355") ? a.substring(3) : a.replaceFirst("^0", "");
        String y = b.startsWith("355") ? b.substring(3) : b.replaceFirst("^0", "");
        return !x.isEmpty() && x.equals(y);
    }


    // ================= ADMIN / BIZNESI =================

    // companyId == null → të gjitha (admin); përndryshe vetëm rezervimet e asaj kompanie
    @Transactional(readOnly = true)
    public List<BookingDto> list(Long companyId) {
        List<Booking> list = companyId == null
            ? bookingRepository.findAllByOrderByCreatedAtDesc()
            : bookingRepository.findByCarCompanyIdOrderByCreatedAtDesc(companyId);
        return list.stream().map(BookingDto::from).toList();
    }

    @Transactional
    public BookingDto updateStatus(Long bookingId, BookingStatus newStatus, Long companyId) {
        Booking booking = bookingRepository.findWithDetailsById(bookingId)
            .filter(b -> companyId == null
                || (b.getCar().getCompany() != null && companyId.equals(b.getCar().getCompany().getId())))
            .orElseThrow(() -> ApiException.notFound("Rezervimi nuk u gjet."));

        // Rikthimi i një rezervimi të anuluar në aktiv kërkon kontroll të ri disponueshmërie
        boolean reactivating = !ACTIVE_STATUSES.contains(booking.getStatus()) && ACTIVE_STATUSES.contains(newStatus);
        if (reactivating) {
            carRepository.findByIdForUpdate(booking.getCar().getId());
            if (bookingRepository.existsOverlap(booking.getCar().getId(),
                    booking.getPickupDate(), booking.getReturnDate(), ACTIVE_STATUSES)) {
                throw ApiException.conflict("Makina është zënë nga një rezervim tjetër për këto data.");
            }
        }

        booking.setStatus(newStatus);
        events.publishEvent(new BookingEvents.StatusChanged(booking.getId()));
        return BookingDto.from(booking);
    }
}
