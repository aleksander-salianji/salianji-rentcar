package com.salianji.rentcar.security;

import com.salianji.rentcar.model.Role;

// Përdoruesi i loguar, i disponueshëm në controller me @AuthenticationPrincipal.
// companyId vendoset vetëm për llogaritë e bizneseve (role = COMPANY).
public record AuthUser(Long id, String email, Role role, Long companyId) {
}
