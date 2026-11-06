package com.salianji.rentcar.service;

import com.salianji.rentcar.dto.AuthResponse;
import com.salianji.rentcar.dto.LoginRequest;
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

    // Hyjnë vetëm: ADMIN dhe COMPANY (kompani aktive)
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(normalizeEmail(req.email()))
            .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
            .filter(AuthService::canLogin)
            // I njëjti mesazh për çdo rast (mos zbulo cili është gabim)
            .orElseThrow(() -> ApiException.unauthorized("Email ose fjalëkalim i gabuar."));

        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    @Transactional(readOnly = true)
    public UserDto me(Long userId) {
        return userRepository.findById(userId)
            .filter(AuthService::canLogin)
            .map(UserDto::from)
            .orElseThrow(() -> ApiException.unauthorized("Sesioni ka skaduar."));
    }

    static boolean canLogin(User u) {
        return u.getRole() == Role.ADMIN
            || (u.getRole() == Role.COMPANY && u.getCompany() != null && u.getCompany().isActive());
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
