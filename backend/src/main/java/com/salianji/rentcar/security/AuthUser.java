package com.salianji.rentcar.security;

import com.salianji.rentcar.model.Role;

// Përdoruesi i loguar, i disponueshëm në controller me @AuthenticationPrincipal
public record AuthUser(Long id, String email, Role role) {
}
