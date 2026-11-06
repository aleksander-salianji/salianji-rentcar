package com.salianji.rentcar.controller;

import com.salianji.rentcar.dto.AuthResponse;
import com.salianji.rentcar.dto.LoginRequest;
import com.salianji.rentcar.dto.UserDto;
import com.salianji.rentcar.security.AuthUser;
import com.salianji.rentcar.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// Login vetëm për bizneset partnere dhe adminin. Klientët nuk kanë llogari.
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal AuthUser user) {
        return authService.me(user.id());
    }
}
