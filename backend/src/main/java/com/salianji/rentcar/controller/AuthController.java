package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.AuthResponse;
import com.salianji.rentcar.dto.LoginRequest;
import com.salianji.rentcar.dto.RegisterRequest;
import com.salianji.rentcar.dto.UserDto;
import com.salianji.rentcar.security.AuthUser;
import com.salianji.rentcar.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal AuthUser user) {
        return authService.me(user.id());
    }

    // Përdoret nga validatori async i frontend-it
    @GetMapping("/email-exists")
    public Map<String, Boolean> emailExists(@RequestParam String email) {
        return Map.of("exists", authService.emailExists(email));
    }
}
