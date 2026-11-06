package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.BookedPeriodDto;
import com.salianji.rentcar.dto.CarDto;
import com.salianji.rentcar.dto.CarRequest;
import com.salianji.rentcar.exception.ApiException;
import com.salianji.rentcar.model.BookingStatus;
import com.salianji.rentcar.model.Car;
import com.salianji.rentcar.repository.BookingRepository;
import com.salianji.rentcar.repository.CarRepository;
import com.salianji.rentcar.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class CarService {

    static final Set<BookingStatus> ACTIVE_STATUSES = Set.of(BookingStatus.PENDING, BookingStatus.CONFIRMED);

    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final ImageStorageService imageStorage;
    private final CompanyRepository companyRepository;

    public CarService(CarRepository carRepository,
                      BookingRepository bookingRepository,
                      ImageStorageService imageStorage,
                      CompanyRepository companyRepository) {
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.imageStorage = imageStorage;
        this.companyRepository = companyRepository;
    }

    // ---------- PUBLIKE ----------

    // Kërkimi si në Booking: qyteti, datat dhe kompania janë opsionale.
    // Kthen vetëm makinat aktive të kompanive aktive që janë të lira në ato data.
    @Transactional(readOnly = true)
    public List<CarDto> search(String city, LocalDate from, LocalDate to, Long companyId) {
        Set<Long> busy = new HashSet<>();
        if (from != null && to != null) {
            if (!to.isAfter(from)) {
                throw ApiException.badRequest("Data e kthimit duhet të jetë pas datës së marrjes.");
            }
            busy.addAll(bookingRepository.findBusyCarIds(ACTIVE_STATUSES, from, to));
        }
        String cityFilter = city == null || city.isBlank() ? null : city.trim();

        return carRepository.findByActiveTrueOrderByPricePerDayAsc().stream()
            .filter(c -> c.getCompany() == null || c.getCompany().isActive())
            .filter(c -> companyId == null || (c.getCompany() != null && companyId.equals(c.getCompany().getId())))
            .filter(c -> cityFilter == null || (c.getCompany() != null && cityFilter.equalsIgnoreCase(c.getCompany().getCity())))
            .filter(c -> !busy.contains(c.getId()))
            .map(CarDto::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public CarDto getActive(Long id) {
        return carRepository.findByIdAndActiveTrue(id)
            .filter(c -> c.getCompany() == null || c.getCompany().isActive())
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
        String oldImage = car.getImageUrl();
        apply(car, req);
        if (oldImage != null && !oldImage.equals(car.getImageUrl())) {
            imageStorage.deleteIfLocal(oldImage);
        }
        return CarDto.from(car);
    }

    // Ngarkon foton e makinës (zëvendëson të vjetrën)
    @Transactional
    public CarDto uploadImage(Long id, MultipartFile file) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("Makina nuk u gjet."));
        String oldImage = car.getImageUrl();
        car.setImageUrl(imageStorage.storeCarImage(id, file));
        imageStorage.deleteIfLocal(oldImage);
        return CarDto.from(car);
    }

    @Transactional
    public CarDto removeImage(Long id) {
        Car car = carRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("Makina nuk u gjet."));
        imageStorage.deleteIfLocal(car.getImageUrl());
        car.setImageUrl(null);
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
        carRepository.findById(id).ifPresent(car -> imageStorage.deleteIfLocal(car.getImageUrl()));
        carRepository.deleteById(id);
    }

    private void apply(Car car, CarRequest req) {
        car.setCompany(companyRepository.findById(req.companyId())
            .orElseThrow(() -> ApiException.badRequest("Kompania nuk u gjet.")));
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
