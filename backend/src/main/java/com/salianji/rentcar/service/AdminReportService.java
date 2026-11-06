package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.AdminStatsDto;
import com.salianji.rentcar.dto.FleetStatusDto;
import com.salianji.rentcar.dto.RevenuePeriod;
import com.salianji.rentcar.dto.RevenueReportDto;
import com.salianji.rentcar.model.Booking;
import com.salianji.rentcar.model.BookingStatus;
import com.salianji.rentcar.model.Car;
import com.salianji.rentcar.repository.BookingRepository;
import com.salianji.rentcar.repository.CarRepository;
import com.salianji.rentcar.repository.CompanyRepository;
import com.salianji.rentcar.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static com.salianji.rentcar.service.CarService.ACTIVE_STATUSES;

// Raportet e adminit: xhiro dhe gjendja e flotës.
// Xhiro llogaritet sipas DATËS SË MARRJES së makinës, sepse pagesa bëhet në momentin e marrjes.
// Llogariten vetëm rezervimet e konfirmuara ose të përfunduara.
@Service
public class AdminReportService {

    static final Set<BookingStatus> REVENUE_STATUSES = Set.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED);

    private final BookingRepository bookingRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public AdminReportService(BookingRepository bookingRepository,
                              CarRepository carRepository,
                              UserRepository userRepository,
                              CompanyRepository companyRepository) {
        this.bookingRepository = bookingRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
    }


    // ================= PËRMBLEDHJA =================

    @Transactional(readOnly = true)
    public AdminStatsDto stats() {
        LocalDate today = RentalRules.today();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate monthStart = today.withDayOfMonth(1);

        // Periudhat e mëparshme me të njëjtën gjatësi (për krahasim të drejtë)
        LocalDate yesterday = today.minusDays(1);
        LocalDate lastWeekStart = weekStart.minusWeeks(1);
        LocalDate lastWeekSameDay = today.minusWeeks(1);
        LocalDate lastMonthStart = monthStart.minusMonths(1);
        LocalDate lastMonthSameDay = today.minusMonths(1);   // p.sh. 31 mars → 28/29 shkurt

        List<FleetStatusDto> fleet = fleetStatus(today, null);
        long free = fleet.stream().filter(f -> f.state() == FleetStatusDto.State.FREE).count();
        long occupied = fleet.stream().filter(f -> f.state() == FleetStatusDto.State.OCCUPIED).count();

        return new AdminStatsDto(
            carRepository.count(),
            carRepository.countByActiveTrue(),
            bookingRepository.count(),
            bookingRepository.countByStatusIn(ACTIVE_STATUSES),
            bookingRepository.countByStatus(BookingStatus.PENDING),
            bookingRepository.sumTotalPriceByStatusIn(REVENUE_STATUSES),
            bookingRepository.countDistinctCustomers(),
            bookingRepository.sumRevenueBetween(REVENUE_STATUSES, today, today),
            bookingRepository.sumRevenueBetween(REVENUE_STATUSES, weekStart, today),
            bookingRepository.sumRevenueBetween(REVENUE_STATUSES, monthStart, today),
            bookingRepository.sumRevenueBetween(REVENUE_STATUSES, yesterday, yesterday),
            bookingRepository.sumRevenueBetween(REVENUE_STATUSES, lastWeekStart, lastWeekSameDay),
            bookingRepository.sumRevenueBetween(REVENUE_STATUSES, lastMonthStart, lastMonthSameDay),
            free,
            occupied,
            companyRepository.count(),
            bookingRepository.sumPlatformFeeByStatusIn(REVENUE_STATUSES)
        );
    }


    // Përmbledhja për panelin e një kompanie (llogaritet nga rezervimet e saj)
    @Transactional(readOnly = true)
    public AdminStatsDto companyStats(Long companyId) {
        LocalDate today = RentalRules.today();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate monthStart = today.withDayOfMonth(1);

        List<Booking> all = bookingRepository.findByCarCompanyIdOrderByCreatedAtDesc(companyId);
        List<Booking> paid = all.stream().filter(b -> REVENUE_STATUSES.contains(b.getStatus())).toList();

        List<FleetStatusDto> fleet = fleetStatus(today, companyId);
        long free = fleet.stream().filter(f -> f.state() == FleetStatusDto.State.FREE).count();
        long occupied = fleet.stream().filter(f -> f.state() == FleetStatusDto.State.OCCUPIED).count();

        return new AdminStatsDto(
            fleet.size(),
            fleet.stream().filter(f -> f.car().active()).count(),
            all.size(),
            all.stream().filter(b -> ACTIVE_STATUSES.contains(b.getStatus())).count(),
            all.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count(),
            sum(paid, null, null),
            all.stream().map(Booking::getCustomerEmail).filter(e -> e != null).distinct().count(),
            sum(paid, today, today),
            sum(paid, weekStart, today),
            sum(paid, monthStart, today),
            sum(paid, today.minusDays(1), today.minusDays(1)),
            sum(paid, weekStart.minusWeeks(1), today.minusWeeks(1)),
            sum(paid, monthStart.minusMonths(1), today.minusMonths(1)),
            free,
            occupied,
            1,
            paid.stream().map(b -> b.getPlatformFee() == null ? BigDecimal.ZERO : b.getPlatformFee())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
        );
    }

    // Shuma e xhiros sipas datës së marrjes (from/to null = pa kufi)
    private static BigDecimal sum(List<Booking> list, LocalDate from, LocalDate to) {
        return list.stream()
            .filter(b -> from == null || !b.getPickupDate().isBefore(from))
            .filter(b -> to == null || !b.getPickupDate().isAfter(to))
            .map(Booking::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }


    // ================= XHIRO =================

    @Transactional(readOnly = true)
    public RevenueReportDto revenue(RevenuePeriod period, Long companyId) {
        LocalDate today = RentalRules.today();
        List<LocalDate[]> buckets = new ArrayList<>();

        switch (period) {
            case DAY -> {                         // 30 ditët e fundit
                for (int i = 29; i >= 0; i--) {
                    LocalDate d = today.minusDays(i);
                    buckets.add(new LocalDate[]{d, d});
                }
            }
            case WEEK -> {                        // 12 javët e fundit (e hënë – e diel)
                LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                for (int i = 11; i >= 0; i--) {
                    LocalDate start = monday.minusWeeks(i);
                    buckets.add(new LocalDate[]{start, start.plusDays(6)});
                }
            }
            case MONTH -> {                       // 12 muajt e fundit
                LocalDate first = today.withDayOfMonth(1);
                for (int i = 11; i >= 0; i--) {
                    LocalDate start = first.minusMonths(i);
                    buckets.add(new LocalDate[]{start, start.plusMonths(1).minusDays(1)});
                }
            }
        }

        LocalDate from = buckets.get(0)[0];
        LocalDate to = buckets.get(buckets.size() - 1)[1];
        List<Booking> bookings = bookingRepository.findByStatusInAndPickupDateBetween(REVENUE_STATUSES, from, to)
            .stream()
            .filter(b -> companyId == null || belongsTo(b.getCar(), companyId))
            .toList();

        List<RevenueReportDto.Point> points = buckets.stream().map(b -> {
            List<Booking> inBucket = bookings.stream()
                .filter(x -> !x.getPickupDate().isBefore(b[0]) && !x.getPickupDate().isAfter(b[1]))
                .toList();
            BigDecimal sum = inBucket.stream().map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
            return new RevenueReportDto.Point(b[0], b[1], sum, inBucket.size());
        }).toList();

        BigDecimal total = points.stream().map(RevenueReportDto.Point::revenue).reduce(BigDecimal.ZERO, BigDecimal::add);
        long count = points.stream().mapToLong(RevenueReportDto.Point::bookings).sum();

        return new RevenueReportDto(period, total, count, points);
    }


    // ================= GJENDJA E FLOTËS =================

    // Për çdo makinë: e lirë apo e zënë në datën e dhënë, kush e ka dhe rezervimi i radhës
    @Transactional(readOnly = true)
    public List<FleetStatusDto> fleetStatus(LocalDate date, Long companyId) {
        List<Car> cars = carRepository.findAllByOrderByIdAsc().stream()
            .filter(c -> companyId == null || belongsTo(c, companyId))
            .toList();

        // Rezervimet aktive që nuk janë kthyer ende në këtë datë
        Map<Long, List<Booking>> byCar = bookingRepository
            .findByStatusInAndReturnDateAfterOrderByPickupDateAsc(ACTIVE_STATUSES, date)
            .stream()
            .collect(Collectors.groupingBy(b -> b.getCar().getId()));

        return cars.stream().map(car -> {
            List<Booking> list = byCar.getOrDefault(car.getId(), List.of());

            Booking current = list.stream()
                .filter(b -> !b.getPickupDate().isAfter(date))
                .findFirst().orElse(null);
            Booking next = list.stream()
                .filter(b -> b.getPickupDate().isAfter(date))
                .findFirst().orElse(null);

            FleetStatusDto.State state = !car.isActive()
                ? FleetStatusDto.State.INACTIVE
                : current != null ? FleetStatusDto.State.OCCUPIED : FleetStatusDto.State.FREE;

            return new FleetStatusDto(
                FleetStatusDto.CarInfo.from(car),
                state,
                FleetStatusDto.BookingInfo.from(current),
                FleetStatusDto.BookingInfo.from(next)
            );
        }).toList();
    }

    private static boolean belongsTo(Car car, Long companyId) {
        return car.getCompany() != null && companyId.equals(car.getCompany().getId());
    }
}
