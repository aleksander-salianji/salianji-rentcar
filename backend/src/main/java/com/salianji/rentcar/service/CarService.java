package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.BookedPeriodDto;
import com.salianji.rentcar.dto.CarDto;
import com.salianji.rentcar.dto.CarRequest;
import com.salianji.rentcar.exception.ApiException;
import com.salianji.rentcar.model.BookingStatus;
import com.salianji.rentcar.model.Car;
import com.salianji.rentcar.repository.BookingRepository;
import com.salianji.rentcar.repository.CarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class CarService {

    static final Set<BookingStatus> ACTIVE_STATUSES = Set.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;

    public CarService(CarRepository carRepository, BookingRepository bookingRepository) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
    }

    // ---------- PUBLIKE ----------

    @Transactional(readOnly = true)
    public List<CarDto> listActive() {
        return carRepository.findByActiveTrueOrderByPricePerDayAsc().stream().map(CarDto::from).toList();
    }

    @Transactional(readOnly = true)
    public CarDto getActive(Long id) {
        return carRepository.findByIdAndActiveTrue(id)
            .map(CarDto::from)
            .orElseThrow(() -> ApiException.notFound("Makina nuk u gjet."));
    }

    @Transactional(readOnly = true)
    public List<BookedPeriodDto> bookedPeriods(Long carId) {
        return bookingRepository
            .findByCarIdAndStatusInAndReturnDateAfterOrderByPickupDateAsc(carId, ACTIVE_STATUSES, RentalRules.today())
            .stream()
            .map(b -> new BookedPeriodDto(b.getPickupDate(), b.getReturnDate()))
            .toList();
    }

    // ---------- ADMIN ----------

    @Transactional(readOnly = true)
    public List<CarDto> listAll() {
        return carRepository.findAllByOrderByIdAsc().stream().map(CarDto::from).toList();
    }

    @Transactional
    public CarDto create(CarRequest req) {
        Car car = new Car();
        apply(car, req);
        return CarDto.from(carRepository.save(car));
    }

    @Transactional
    public CarDto update(Long id, CarRequest req) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("Makina nuk u gjet."));
        apply(car, req);
        return CarDto.from(car);
    }

    @Transactional
    public void delete(Long id) {
        if (!carRepository.existsById(id)) {
            throw ApiException.notFound("Makina nuk u gjet.");
        }
        // Rezervimet e vjetra duhet të ruhen, prandaj makina me rezervime vetëm çaktivizohet
        if (bookingRepository.existsByCarId(id)) {
            throw ApiException.conflict("Makina ka rezervime. Çaktivizoje në vend që ta fshish.");
        }
        carRepository.deleteById(id);
    }

    private static void apply(Car car, CarRequest req) {
        car.setBrand(req.brand().trim());
        car.setModel(req.model().trim());
        car.setYear(req.year());
        car.setCategory(req.category());
        car.setTransmission(req.transmission());
        car.setFuel(req.fuel());
        car.setSeats(req.seats());
        car.setPricePerDay(req.pricePerDay());
        car.setImageUrl(blankToNull(req.imageUrl()));
        car.setDescription(blankToNull(req.description()));
        car.setActive(req.active());
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
