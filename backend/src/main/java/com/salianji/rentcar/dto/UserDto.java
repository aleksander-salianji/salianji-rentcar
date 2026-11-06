package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.Role;
import com.salianji.rentcar.model.User;

// companyId / companyName vetëm për llogaritë e bizneseve
public record UserDto(Long id, String firstName, String lastName, String email, String phone, Role role,
                      Long companyId, String companyName) {

    // Duhet thirrur brenda një transaksioni (company ngarkohet me vonesë)
    public static UserDto from(User u) {
        var c = u.getCompany();
        return new UserDto(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getPhone(), u.getRole(),
            c == null ? null : c.getId(), c == null ? null : c.getName());
    }
}
