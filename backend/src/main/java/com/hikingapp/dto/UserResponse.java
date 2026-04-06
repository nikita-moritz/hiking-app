package com.hikingapp.dto;

import com.hikingapp.entity.User;
import java.time.LocalDateTime;

public record UserResponse(Long id, String username, String email, String role,
                           boolean active, LocalDateTime createdAt) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getEmail(),
                u.getRole().name(), u.isActive(), u.getCreatedAt());
    }
}
