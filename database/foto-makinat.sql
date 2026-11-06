-- =====================================================
-- Salianji Rent Car: foto reale për 8 makinat fillestare
-- Burimi: Wikimedia Commons (licenca të lira, shih FOTOT-KREDITE.md)
-- Ekzekutoje në HeidiSQL: hap Query, ngjite këtë dhe shtyp F9.
-- Mbishkruan vetëm makinat që NUK kanë ende foto të ngarkuar nga ti.
-- =====================================================

USE salianji_rentcar;

UPDATE cars SET image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2021_Fiat_Panda_Sport_1.0_Hybrid.jpg?width=1280'
WHERE brand = 'Fiat' AND model = 'Panda' AND (image_url IS NULL OR image_url = '');

UPDATE cars SET image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Volkswagen_Golf_VIII_Facelift_IMG_0375.jpg?width=1280'
WHERE brand = 'Volkswagen' AND model = 'Golf' AND (image_url IS NULL OR image_url = '');

UPDATE cars SET image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Toyota_Corolla_sedan_E210_hydrid.jpg?width=1280'
WHERE brand = 'Toyota' AND model = 'Corolla Hybrid' AND (image_url IS NULL OR image_url = '');

UPDATE cars SET image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Skoda_Octavia_IV_liftback_(cropped).jpg?width=1280'
WHERE brand = 'Skoda' AND model = 'Octavia' AND (image_url IS NULL OR image_url = '');

UPDATE cars SET image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Dacia_Duster_II_Facelift_IMG_6233.jpg?width=1280'
WHERE brand = 'Dacia' AND model = 'Duster' AND (image_url IS NULL OR image_url = '');

UPDATE cars SET image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/2022_MY_Toyota_RAV4_Hybrid_facelift_XA50.jpg?width=1280'
WHERE brand = 'Toyota' AND model = 'RAV4' AND (image_url IS NULL OR image_url = '');

UPDATE cars SET image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes-Benz_C_200_AVANTGARDE_(W206)_front.jpg?width=1280'
WHERE brand = 'Mercedes-Benz' AND model = 'C-Class' AND (image_url IS NULL OR image_url = '');

UPDATE cars SET image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/BMW_G05_X5_xDrive30d_M_Sport_Carbon_Black_(1).jpg?width=1280'
WHERE brand = 'BMW' AND model = 'X5' AND (image_url IS NULL OR image_url = '');

SELECT id, brand, model, image_url FROM cars;
