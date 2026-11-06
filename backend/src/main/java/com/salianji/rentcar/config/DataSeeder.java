package com.salianji.rentcar.config;

import com.salianji.rentcar.model.*;
import com.salianji.rentcar.repository.CarRepository;
import com.salianji.rentcar.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

// Herën e parë që niset aplikacioni (databaza bosh) krijon adminin dhe makinat fillestare
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(UserRepository userRepository,
                      CarRepository carRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${app.admin.email}") String adminEmail,
                      @Value("${app.admin.password}") String adminPassword) {
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedCars();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        User admin = new User();
        admin.setFirstName("Admin");
        admin.setLastName("Salianji");
        admin.setEmail(adminEmail);
        admin.setPhone("0690000000");
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
        log.warn("U krijua llogaria e adminit: {} — ndrysho fjalëkalimin para se ta publikosh!", adminEmail);
    }

    private void seedCars() {
        if (carRepository.count() > 0) {
            return;
        }
        carRepository.saveAll(List.of(
            new Car("Fiat", "Panda", 2021, CarCategory.ECONOMY, Transmission.MANUAL, FuelType.PETROL, 4,
                new BigDecimal("25"), "E vogël dhe ekonomike, ideale për qytetin."),
            new Car("Volkswagen", "Golf", 2020, CarCategory.ECONOMY, Transmission.MANUAL, FuelType.DIESEL, 5,
                new BigDecimal("35"), "Komode dhe me konsum të ulët për rrugë të gjata."),
            new Car("Toyota", "Corolla Hybrid", 2022, CarCategory.SEDAN, Transmission.AUTOMATIC, FuelType.HYBRID, 5,
                new BigDecimal("40"), "Hibride, e qetë dhe shumë ekonomike."),
            new Car("Skoda", "Octavia", 2021, CarCategory.SEDAN, Transmission.AUTOMATIC, FuelType.DIESEL, 5,
                new BigDecimal("38"), "Bagazh i madh, perfekte për familjen."),
            new Car("Dacia", "Duster", 2022, CarCategory.SUV, Transmission.MANUAL, FuelType.DIESEL, 5,
                new BigDecimal("45"), "SUV i fortë për rrugët malore."),
            new Car("Toyota", "RAV4", 2023, CarCategory.SUV, Transmission.AUTOMATIC, FuelType.HYBRID, 5,
                new BigDecimal("65"), "SUV hibrid me 4x4 dhe teknologji të re."),
            new Car("Mercedes-Benz", "C-Class", 2022, CarCategory.LUXURY, Transmission.AUTOMATIC, FuelType.DIESEL, 5,
                new BigDecimal("90"), "Elegancë dhe komoditet për raste të veçanta."),
            new Car("BMW", "X5", 2021, CarCategory.LUXURY, Transmission.AUTOMATIC, FuelType.DIESEL, 5,
                new BigDecimal("120"), "SUV luksoz me hapësirë të madhe.")
        ));
        log.info("U shtuan 8 makinat fillestare.");
    }
}
