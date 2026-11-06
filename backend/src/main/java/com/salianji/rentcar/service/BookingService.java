package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.AdminStatsDto;
import com.salianji.rentcar.dto.BookingDto;
import com.salianji.rentcar.dto.BookingRequest;
import com.salianji.rentcar.exception.ApiException;
import com.salianji.rentcar.model.*;
import com.salianji.rentcar.repository.BookingRepository;
import com.salianji.rentcar.repository.CarRepository;
import com.salianji.rentcar.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import static com.salianji.rentcar.service.CarService.ACTIVE_STATUSES;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          CarRepository carRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
    }


    // ================= KLIENTI =================

    @Transactional
    public BookingDto create(Long userId, BookingRequest req) {
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
            .orElseThrow(() -> ApiException.notFound("Makina nuk u gjet."));

        if (bookingRepository.existsOverlap(car.getId(), from, to, ACTIVE_STATUSES)) {
            throw ApiException.conflict("Makina është e zënë për këto data. Zgjidh data të tjera.");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> ApiException.unauthorized("Sesioni ka skaduar."));

        PriceCalculator.Price price = PriceCalculator.calculate(car.getPricePerDay(), days, req.extras());

        // ---------- ruajtja ----------
        Booking booking = new Booking();
        booking.setUser(user);
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
        booking.setStatus(BookingStatus.PENDING);

        bookingRepository.saveAndFlush(booking);

        // Kodi ndërtohet nga id-ja: SRC-2026-0001
        booking.setCode(String.format("SRC-%d-%04d", today.getYear(), booking.getId()));

        return BookingDto.from(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> myBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(BookingDto::from).toList();
    }

    @Transactional
    public BookingDto cancel(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findWithDetailsById(bookingId)
            .filter(b -> b.getUser().getId().equals(userId))
            .orElseThrow(() -> ApiException.notFound("Rezervimi nuk u gjet."));

        if (!ACTIVE_STATUSES.contains(booking.getStatus())) {
            throw ApiException.badRequest("Ky rezervim nuk mund të anulohet.");
        }
        if (!booking.getPickupDate().isAfter(RentalRules.today())) {
            throw ApiException.badRequest("Rezervimi nuk mund të anulohet në ditën e marrjes ose më vonë.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return BookingDto.from(booking);
    }


    // ================= ADMIN =================

    @Transactional(readOnly = true)
    public List<BookingDto> listAll() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
            .stream().map(BookingDto::from).toList();
    }

    @Transactional
    public BookingDto updateStatus(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findWithDetailsById(bookingId)
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
        return BookingDto.from(booking);
    }

    @Transactional(readOnly = true)
    public AdminStatsDto stats() {
        return new AdminStatsDto(
            carRepository.count(),
            carRepository.countByActiveTrue(),
            bookingRepository.count(),
            bookingRepository.countByStatusIn(ACTIVE_STATUSES),
            bookingRepository.countByStatus(BookingStatus.PENDING),
            bookingRepository.sumTotalPriceByStatusIn(Set.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED)),
            userRepository.countByRole(Role.CUSTOMER)
        );
    }
}
