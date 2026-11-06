package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.AuthResponse;
import com.salianji.rentcar.dto.LoginRequest;
import com.salianji.rentcar.dto.RegisterRequest;
import com.salianji.rentcar.dto.UserDto;
import com.salianji.rentcar.exception.ApiException;
import com.salianji.rentcar.model.Role;
import com.salianji.rentcar.model.User;
import com.salianji.rentcar.repository.UserRepository;
import com.salianji.rentcar.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = normalizeEmail(req.email());

        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("Ky email është tashmë i regjistruar.");
        }

        User user = new User();
        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        user.setEmail(email);
        user.setPhone(req.phone().trim());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(Role.CUSTOMER);
        userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(normalizeEmail(req.email()))
            .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
            // I njëjti mesazh për email ose fjalëkalim të gabuar (mos zbulo cili është gabim)
            .orElseThrow(() -> ApiException.unauthorized("Email ose fjalëkalim i gabuar."));

        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    @Transactional(readOnly = true)
    public UserDto me(Long userId) {
        return userRepository.findById(userId)
            .map(UserDto::from)
            .orElseThrow(() -> ApiException.unauthorized("Sesioni ka skaduar."));
    }

    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return email != null && !email.isBlank() && userRepository.existsByEmail(normalizeEmail(email));
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
