package com.salianji.rentcar.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.salianji.rentcar.dto.ApiError;
import com.salianji.rentcar.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtService jwtService,
                                                   UserRepository userRepository,
                                                   ObjectMapper objectMapper) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)          // API me JWT, pa cookies
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                // klienti rezervon dhe e gjen / anulon rezervimin pa llogari
                .requestMatchers(HttpMethod.POST, "/api/bookings", "/api/bookings/lookup", "/api/bookings/cancel").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/support").permitAll()          // formulari i ndihmës
                .requestMatchers(HttpMethod.GET, "/api/cars", "/api/cars/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/companies", "/api/companies/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/blog", "/api/blog/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()          // fotot e makinave
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/company/**").hasRole("COMPANY")
                .anyRequest().authenticated()
            )
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req, res, ex) ->
                    writeError(res, objectMapper, HttpServletResponse.SC_UNAUTHORIZED, "Duhet të hysh në llogari."))
                .accessDeniedHandler((req, res, ex) ->
                    writeError(res, objectMapper, HttpServletResponse.SC_FORBIDDEN, "Nuk ke leje për këtë veprim."))
            )
            .addFilterBefore(new JwtAuthFilter(jwtService, userRepository),
                             UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Lejon frontend-in Angular (localhost:4200) të thërrasë API-në
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    private static void writeError(HttpServletResponse res, ObjectMapper mapper, int status, String message)
            throws IOException {
        res.setStatus(status);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        mapper.writeValue(res.getWriter(), new ApiError(message, null));
    }
}
