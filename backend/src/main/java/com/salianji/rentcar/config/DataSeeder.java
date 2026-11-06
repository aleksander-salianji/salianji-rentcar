package com.salianji.rentcar.config;

import com.salianji.rentcar.model.*;
import com.salianji.rentcar.repository.CarRepository;
import com.salianji.rentcar.repository.CompanyRepository;
import com.salianji.rentcar.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Map;

// Herën e parë që niset aplikacioni (databaza bosh) krijon adminin dhe makinat fillestare
@Component
@Order(2)
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    // Foto reale nga Wikimedia Commons (licenca të lira) — shih database/FOTOT-KREDITE.md
    private static final Map<String, String> SEED_PHOTOS = Map.ofEntries(
        Map.entry("Fiat Panda", "https://commons.wikimedia.org/wiki/Special:FilePath/2021_Fiat_Panda_Sport_1.0_Hybrid.jpg?width=1280"),
        Map.entry("Volkswagen Golf", "https://commons.wikimedia.org/wiki/Special:FilePath/Volkswagen_Golf_VIII_Facelift_IMG_0375.jpg?width=1280"),
        Map.entry("Toyota Corolla Hybrid", "https://commons.wikimedia.org/wiki/Special:FilePath/Toyota_Corolla_sedan_E210_hydrid.jpg?width=1280"),
        Map.entry("Skoda Octavia", "https://commons.wikimedia.org/wiki/Special:FilePath/Skoda_Octavia_IV_liftback_(cropped).jpg?width=1280"),
        Map.entry("Dacia Duster", "https://commons.wikimedia.org/wiki/Special:FilePath/Dacia_Duster_II_Facelift_IMG_6233.jpg?width=1280"),
        Map.entry("Toyota RAV4", "https://commons.wikimedia.org/wiki/Special:FilePath/2022_MY_Toyota_RAV4_Hybrid_facelift_XA50.jpg?width=1280"),
        Map.entry("Mercedes-Benz C-Class", "https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes-Benz_C_200_AVANTGARDE_(W206)_front.jpg?width=1280"),
        Map.entry("BMW X5", "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_G05_X5_xDrive30d_M_Sport_Carbon_Black_(1).jpg?width=1280"),
        Map.entry("Renault Clio", "https://commons.wikimedia.org/wiki/Special:FilePath/Renault_Clio_V_1X7A0309.jpg?width=1280"),
        Map.entry("Peugeot 208", "https://commons.wikimedia.org/wiki/Special:FilePath/Peugeot_208_II.jpg?width=1280"),
        Map.entry("Toyota Yaris Hybrid", "https://commons.wikimedia.org/wiki/Special:FilePath/Toyota_Yaris_Hybrid_(XP210)_1X7A0353.jpg?width=1280"),
        Map.entry("Hyundai i20", "https://commons.wikimedia.org/wiki/Special:FilePath/Hyundai_i20_(BC3)_IMG_5670.jpg?width=1280"),
        Map.entry("Volkswagen Passat", "https://commons.wikimedia.org/wiki/Special:FilePath/VW_Passat_B8_Sedan.jpg?width=1280"),
        Map.entry("Audi A4", "https://commons.wikimedia.org/wiki/Special:FilePath/Audi_A4_40_TFSI_B9_Monsoon_Grey_Metallic_(1).jpg?width=1280"),
        Map.entry("Kia Sportage", "https://commons.wikimedia.org/wiki/Special:FilePath/Kia_Sportage_Hybrid_NQ5_PE_1.6_HEV_(1).jpg?width=1280"),
        Map.entry("Volkswagen Tiguan", "https://commons.wikimedia.org/wiki/Special:FilePath/VW_Tiguan_II_Facelift_front.jpg?width=1280"),
        Map.entry("Mercedes-Benz E-Class", "https://commons.wikimedia.org/wiki/Special:FilePath/2018_Mercedes-Benz_E_300_(W_213)_sedan_(2018-11-02)_01.jpg?width=1280"),
        Map.entry("Mercedes-Benz V-Class", "https://commons.wikimedia.org/wiki/Special:FilePath/2023_Mercedes-Benz_V-Class_300d_(W447)_IMG_9814.jpg?width=1280")
    );

    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(UserRepository userRepository,
                      CarRepository carRepository,
                      CompanyRepository companyRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${app.admin.email}") String adminEmail,
                      @Value("${app.admin.password}") String adminPassword) {
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.companyRepository = companyRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        Company main = seedMainCompany();
        seedCars(main);
        assignCarsWithoutCompany(main);
    }

    // Kompania kryesore (jotja). Komisioni 0%, sepse makinat janë të tuat.
    private Company seedMainCompany() {
        return companyRepository.findFirstByNameIgnoreCase("Salianji Rent Car").orElseGet(() -> {
            Company c = new Company();
            c.setName("Salianji Rent Car");
            c.setCity("Tiranë");
            c.setAddress("Rruga e Elbasanit, Tiranë");
            c.setPhone("0690000000");
            c.setEmail("info@salianjirent.al");
            c.setDescription("Kompania kryesore e platformës.");
            c.setCommissionPercent(BigDecimal.ZERO);
            c.setActive(true);
            log.info("U krijua kompania kryesore: Salianji Rent Car");
            return companyRepository.save(c);
        });
    }

    // Makinat e vjetra (para se të kishte kompani) i kalojnë kompanisë kryesore
    private void assignCarsWithoutCompany(Company main) {
        List<Car> orphans = carRepository.findByCompanyIsNull();
        if (!orphans.isEmpty()) {
            orphans.forEach(c -> c.setCompany(main));
            carRepository.saveAll(orphans);
            log.info("{} makina u lidhën me kompaninë kryesore.", orphans.size());
        }
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

    private void seedCars(Company main) {
        if (carRepository.count() > 0) {
            return;
        }
        List<Car> cars = List.of(
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
                new BigDecimal("120"), "SUV luksoz me hapësirë të madhe."),
            new Car("Renault", "Clio", 2021, CarCategory.ECONOMY, Transmission.MANUAL, FuelType.PETROL, 5,
                new BigDecimal("28"), "Kompakte dhe e lehtë për t'u parkuar në qytet."),
            new Car("Peugeot", "208", 2022, CarCategory.ECONOMY, Transmission.MANUAL, FuelType.PETROL, 5,
                new BigDecimal("30"), "Moderne, me konsum të ulët dhe ekran me navigim."),
            new Car("Toyota", "Yaris Hybrid", 2022, CarCategory.ECONOMY, Transmission.AUTOMATIC, FuelType.HYBRID, 5,
                new BigDecimal("32"), "Hibride automatike, shumë ekonomike në qytet."),
            new Car("Hyundai", "i20", 2021, CarCategory.ECONOMY, Transmission.MANUAL, FuelType.PETROL, 5,
                new BigDecimal("27"), "Praktike dhe e besueshme për çdo ditë."),
            new Car("Volkswagen", "Passat", 2021, CarCategory.SEDAN, Transmission.AUTOMATIC, FuelType.DIESEL, 5,
                new BigDecimal("50"), "Sedan i rehatshëm për udhëtime të gjata."),
            new Car("Audi", "A4", 2021, CarCategory.SEDAN, Transmission.AUTOMATIC, FuelType.PETROL, 5,
                new BigDecimal("70"), "Sedan premium me komoditet dhe stil."),
            new Car("Kia", "Sportage", 2023, CarCategory.SUV, Transmission.AUTOMATIC, FuelType.HYBRID, 5,
                new BigDecimal("60"), "SUV hibrid, i gjerë dhe ekonomik."),
            new Car("Volkswagen", "Tiguan", 2022, CarCategory.SUV, Transmission.AUTOMATIC, FuelType.DIESEL, 5,
                new BigDecimal("58"), "SUV familjar me bagazh të madh."),
            new Car("Mercedes-Benz", "E-Class", 2020, CarCategory.LUXURY, Transmission.AUTOMATIC, FuelType.DIESEL, 5,
                new BigDecimal("100"), "Sedan luksoz për biznes dhe raste të veçanta."),
            new Car("Mercedes-Benz", "V-Class", 2023, CarCategory.LUXURY, Transmission.AUTOMATIC, FuelType.DIESEL, 8,
                new BigDecimal("130"), "Minivan luksoz me 8 vende, ideal për grupe dhe transferta nga aeroporti.")
        );
        cars.forEach(c -> {
            c.setImageUrl(SEED_PHOTOS.get(c.getBrand() + " " + c.getModel()));
            c.setCompany(main);
        });
        carRepository.saveAll(cars);
        log.info("U shtuan {} makinat fillestare.", cars.size());
    }
}
