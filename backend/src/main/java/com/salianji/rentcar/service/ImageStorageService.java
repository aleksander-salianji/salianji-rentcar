package com.salianji.rentcar.service;

import com.salianji.rentcar.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

// Ruan fotot e makinave ("uploads/cars") dhe të blogut ("uploads/blog") në disk.
// Fotot shërbehen nga adresa /uploads/cars/<emri> (shih UploadConfig).
@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);

    public static final String CARS_URL_PREFIX = "/uploads/cars/";
    public static final String BLOG_URL_PREFIX = "/uploads/blog/";
    private static final long MAX_BYTES = 5L * 1024 * 1024; // 5 MB

    private final Path root;
    private final Path carsDir;
    private final Path blogDir;

    public ImageStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.carsDir = root.resolve("cars");
        this.blogDir = root.resolve("blog");
        try {
            Files.createDirectories(carsDir);
            Files.createDirectories(blogDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Nuk u krijua dosja e fotove: " + carsDir, e);
        }
        log.info("Fotot e makinave ruhen te: {}", carsDir);
    }

    public Path getRoot() {
        return root;
    }

    // Ruan foton dhe kthen adresën publike, p.sh. /uploads/cars/car-3-a1b2c3d4.jpg
    public String storeCarImage(Long carId, MultipartFile file) {
        return store(carsDir, CARS_URL_PREFIX, "car-" + carId, file);
    }

    // Foto kryesore e një artikulli të blogut → /uploads/blog/post-5-a1b2c3d4.jpg
    public String storeBlogImage(Long postId, MultipartFile file) {
        return store(blogDir, BLOG_URL_PREFIX, "post-" + postId, file);
    }

    private String store(Path dir, String urlPrefix, String namePrefix, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Zgjidh një foto.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw ApiException.badRequest("Foto është shumë e madhe (maksimumi 5 MB).");
        }

        byte[] bytes;
        try (InputStream in = file.getInputStream()) {
            bytes = in.readAllBytes();
        } catch (IOException e) {
            throw ApiException.badRequest("Foto nuk u lexua dot.");
        }

        // Kontrollojmë përmbajtjen e vërtetë të skedarit, jo vetëm emrin ose llojin që deklaron shfletuesi
        String ext = detectImageType(bytes);
        if (ext == null) {
            throw ApiException.badRequest("Lejohen vetëm foto JPG, PNG ose WEBP.");
        }

        String name = namePrefix + "-" + UUID.randomUUID().toString().substring(0, 8) + "." + ext;
        Path target = dir.resolve(name).normalize();
        try {
            Files.write(target, bytes);
        } catch (IOException e) {
            throw new UncheckedIOException("Foto nuk u ruajt.", e);
        }
        return urlPrefix + name;
    }

    // Fshin foton nga disku nëse është ngarkuar këtu (jo URL e jashtme)
    public void deleteIfLocal(String url) {
        if (url == null) {
            return;
        }
        Path dir;
        String name;
        if (url.startsWith(CARS_URL_PREFIX)) {
            dir = carsDir;
            name = url.substring(CARS_URL_PREFIX.length());
        } else if (url.startsWith(BLOG_URL_PREFIX)) {
            dir = blogDir;
            name = url.substring(BLOG_URL_PREFIX.length());
        } else {
            return;
        }
        if (name.isBlank() || name.contains("/") || name.contains("\\") || name.contains("..")) {
            return;
        }
        try {
            Files.deleteIfExists(dir.resolve(name));
        } catch (IOException e) {
            log.warn("Foto e vjetër nuk u fshi: {}", name, e);
        }
    }

    // Njeh llojin nga bajtet e para të skedarit
    private static String detectImageType(byte[] b) {
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return "png";
        }
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "webp";
        }
        return null;
    }
}
