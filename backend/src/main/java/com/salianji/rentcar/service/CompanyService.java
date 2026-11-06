package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.CompanyAccountRequest;
import com.salianji.rentcar.dto.CompanyDto;
import com.salianji.rentcar.dto.CompanyReportDto;
import com.salianji.rentcar.dto.CompanyRequest;
import com.salianji.rentcar.dto.PublicCompanyDto;
import com.salianji.rentcar.exception.ApiException;
import com.salianji.rentcar.model.Booking;
import com.salianji.rentcar.model.Company;
import com.salianji.rentcar.model.Role;
import com.salianji.rentcar.model.User;
import com.salianji.rentcar.repository.BookingRepository;
import com.salianji.rentcar.repository.CarRepository;
import com.salianji.rentcar.repository.CompanyRepository;
import com.salianji.rentcar.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public CompanyService(CompanyRepository companyRepository,
                          CarRepository carRepository,
                          BookingRepository bookingRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.carRepository = carRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ---------- PUBLIKE ----------

    @Transactional(readOnly = true)
    public List<PublicCompanyDto> listPublic() {
        return companyRepository.findByActiveTrueOrderByNameAsc().stream()
            .map(c -> PublicCompanyDto.from(c, carRepository.countByCompanyIdAndActiveTrue(c.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public PublicCompanyDto getPublic(Long id) {
        Company c = companyRepository.findByIdAndActiveTrue(id)
            .orElseThrow(() -> ApiException.notFound("Kompania nuk u gjet."));
        return PublicCompanyDto.from(c, carRepository.countByCompanyIdAndActiveTrue(id));
    }

    // Paneli i biznesit (edhe nëse kompania është çaktivizuar përkohësisht)
    @Transactional(readOnly = true)
    public PublicCompanyDto getForPanel(Long id) {
        return PublicCompanyDto.from(find(id), carRepository.countByCompanyId(id));
    }

    // ---------- ADMIN ----------

    @Transactional(readOnly = true)
    public List<CompanyDto> listAll() {
        return companyRepository.findAllByOrderByNameAsc().stream()
            .map(c -> CompanyDto.from(c, carRepository.countByCompanyId(c.getId()), accountEmail(c.getId())))
            .toList();
    }

    @Transactional
    public CompanyDto create(CompanyRequest req) {
        Company c = new Company();
        apply(c, req);
        companyRepository.save(c);
        return CompanyDto.from(c, 0, null);
    }

    @Transactional
    public CompanyDto update(Long id, CompanyRequest req) {
        Company c = find(id);
        apply(c, req);
        return CompanyDto.from(c, carRepository.countByCompanyId(id), accountEmail(id));
    }

    @Transactional
    public void delete(Long id) {
        find(id);
        if (carRepository.countByCompanyId(id) > 0) {
            throw ApiException.conflict("Kompania ka makina. Çaktivizoje ose kaloji makinat te një kompani tjetër.");
        }
        userRepository.deleteAll(userRepository.findByCompanyId(id));   // edhe login-i i saj
        companyRepository.deleteById(id);
    }

    // Krijon ose ndryshon login-in e kompanisë (email + fjalëkalim)
    @Transactional
    public CompanyDto setAccount(Long id, CompanyAccountRequest req) {
        Company c = find(id);
        String email = req.email().trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findFirstByCompanyIdAndRole(id, Role.COMPANY).orElseGet(User::new);
        userRepository.findByEmail(email)
            .filter(other -> !other.getId().equals(user.getId()))
            .ifPresent(other -> {
                throw ApiException.conflict("Ky email përdoret nga një llogari tjetër.");
            });

        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(Role.COMPANY);
        user.setCompany(c);
        user.setFirstName(c.getName().length() > 50 ? c.getName().substring(0, 50) : c.getName());
        user.setLastName("");
        user.setPhone(c.getPhone());
        userRepository.save(user);

        return CompanyDto.from(c, carRepository.countByCompanyId(id), email);
    }

    private String accountEmail(Long companyId) {
        return userRepository.findFirstByCompanyIdAndRole(companyId, Role.COMPANY).map(User::getEmail).orElse(null);
    }

    // Raporti për çdo kompani: rezervime të konfirmuara/përfunduara, xhiro dhe komisioni
    @Transactional(readOnly = true)
    public List<CompanyReportDto> report() {
        Map<Long, List<Booking>> byCompany = bookingRepository
            .findByStatusIn(AdminReportService.REVENUE_STATUSES)
            .stream()
            .filter(b -> b.getCar().getCompany() != null)
            .collect(Collectors.groupingBy(b -> b.getCar().getCompany().getId()));

        return companyRepository.findAllByOrderByNameAsc().stream().map(c -> {
            List<Booking> list = byCompany.getOrDefault(c.getId(), List.of());
            BigDecimal revenue = list.stream().map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal fee = list.stream()
                .map(b -> b.getPlatformFee() == null ? BigDecimal.ZERO : b.getPlatformFee())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            return new CompanyReportDto(c.getId(), c.getName(), carRepository.countByCompanyId(c.getId()),
                list.size(), revenue, fee);
        }).toList();
    }

    Company find(Long id) {
        return companyRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("Kompania nuk u gjet."));
    }

    private static void apply(Company c, CompanyRequest req) {
        c.setName(req.name().trim());
        c.setCity(req.city().trim());
        c.setAddress(blankToNull(req.address()));
        c.setPhone(blankToNull(req.phone()));
        c.setEmail(blankToNull(req.email()));
        c.setDescription(blankToNull(req.description()));
        c.setCommissionPercent(req.commissionPercent());
        c.setActive(req.active());
    }

    private static String blankToNull(String v) {
        return v == null || v.isBlank() ? null : v.trim();
    }
}
