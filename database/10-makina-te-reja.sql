-- =====================================================
-- Salianji Rent Car: 10 makina të reja me foto reale
-- Burimi i fotove: Wikimedia Commons (licenca të lira, shih FOTOT-KREDITE.md)
-- Ekzekutoje në HeidiSQL: hap Query, ngjite këtë dhe shtyp F9.
-- Nëse një makinë ekziston tashmë (e njëjta markë dhe model), nuk shtohet përsëri.
-- =====================================================

USE salianji_rentcar;

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Renault', 'Clio', 2021, 'ECONOMY', 'MANUAL', 'PETROL', 5, 28.00, 'Kompakte dhe e lehtë për t''u parkuar në qytet.', 'https://commons.wikimedia.org/wiki/Special:FilePath/Renault_Clio_V_1X7A0309.jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Renault' AND model = 'Clio');

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Peugeot', '208', 2022, 'ECONOMY', 'MANUAL', 'PETROL', 5, 30.00, 'Moderne, me konsum të ulët dhe ekran me navigim.', 'https://commons.wikimedia.org/wiki/Special:FilePath/Peugeot_208_II.jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Peugeot' AND model = '208');

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Toyota', 'Yaris Hybrid', 2022, 'ECONOMY', 'AUTOMATIC', 'HYBRID', 5, 32.00, 'Hibride automatike, shumë ekonomike në qytet.', 'https://commons.wikimedia.org/wiki/Special:FilePath/Toyota_Yaris_Hybrid_(XP210)_1X7A0353.jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Toyota' AND model = 'Yaris Hybrid');

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Hyundai', 'i20', 2021, 'ECONOMY', 'MANUAL', 'PETROL', 5, 27.00, 'Praktike dhe e besueshme për çdo ditë.', 'https://commons.wikimedia.org/wiki/Special:FilePath/Hyundai_i20_(BC3)_IMG_5670.jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Hyundai' AND model = 'i20');

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Volkswagen', 'Passat', 2021, 'SEDAN', 'AUTOMATIC', 'DIESEL', 5, 50.00, 'Sedan i rehatshëm për udhëtime të gjata.', 'https://commons.wikimedia.org/wiki/Special:FilePath/VW_Passat_B8_Sedan.jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Volkswagen' AND model = 'Passat');

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Audi', 'A4', 2021, 'SEDAN', 'AUTOMATIC', 'PETROL', 5, 70.00, 'Sedan premium me komoditet dhe stil.', 'https://commons.wikimedia.org/wiki/Special:FilePath/Audi_A4_40_TFSI_B9_Monsoon_Grey_Metallic_(1).jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Audi' AND model = 'A4');

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Kia', 'Sportage', 2023, 'SUV', 'AUTOMATIC', 'HYBRID', 5, 60.00, 'SUV hibrid, i gjerë dhe ekonomik.', 'https://commons.wikimedia.org/wiki/Special:FilePath/Kia_Sportage_Hybrid_NQ5_PE_1.6_HEV_(1).jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Kia' AND model = 'Sportage');

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Volkswagen', 'Tiguan', 2022, 'SUV', 'AUTOMATIC', 'DIESEL', 5, 58.00, 'SUV familjar me bagazh të madh.', 'https://commons.wikimedia.org/wiki/Special:FilePath/VW_Tiguan_II_Facelift_front.jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Volkswagen' AND model = 'Tiguan');

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Mercedes-Benz', 'E-Class', 2020, 'LUXURY', 'AUTOMATIC', 'DIESEL', 5, 100.00, 'Sedan luksoz për biznes dhe raste të veçanta.', 'https://commons.wikimedia.org/wiki/Special:FilePath/2018_Mercedes-Benz_E_300_(W_213)_sedan_(2018-11-02)_01.jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Mercedes-Benz' AND model = 'E-Class');

INSERT INTO cars (brand, model, manufacture_year, category, transmission, fuel, seats, price_per_day, description, image_url, active)
SELECT 'Mercedes-Benz', 'V-Class', 2023, 'LUXURY', 'AUTOMATIC', 'DIESEL', 8, 130.00, 'Minivan luksoz me 8 vende, ideal për grupe dhe transferta nga aeroporti.', 'https://commons.wikimedia.org/wiki/Special:FilePath/2023_Mercedes-Benz_V-Class_300d_(W447)_IMG_9814.jpg?width=1280', TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM cars WHERE brand = 'Mercedes-Benz' AND model = 'V-Class');

SELECT id, brand, model, category, price_per_day, image_url FROM cars ORDER BY id;
