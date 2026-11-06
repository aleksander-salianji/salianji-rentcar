package com.salianji.rentcar.config;

import com.salianji.rentcar.service.ImageStorageService;
import jakarta.servlet.MultipartConfigElement;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.unit.DataSize;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadConfig implements WebMvcConfigurer {

    private final ImageStorageService storage;

    public UploadConfig(ImageStorageService storage) {
        this.storage = storage;
    }

    // Fotot në dosjen "uploads" shërbehen në adresën http://localhost:8080/uploads/...
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = storage.getRoot().toUri().toString();
        if (!location.endsWith("/")) {
            location += "/";
        }
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }

    // Madhësia maksimale e një ngarkimi (si parazgjedhje Spring lejon vetëm 1 MB)
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        factory.setMaxFileSize(DataSize.ofMegabytes(5));
        factory.setMaxRequestSize(DataSize.ofMegabytes(6));
        return factory.createMultipartConfig();
    }
}
