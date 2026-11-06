package com.salianji.rentcar.dto;

import com.salianji.rentcar.model.Role;
import com.salianji.rentcar.model.User;

public record UserDto(Long id, String firstName, String lastName, String email, String phone, Role role) {

    public static UserDto from(User u) {
        return new UserDto(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getPhone(), u.getRole());
    }
}
