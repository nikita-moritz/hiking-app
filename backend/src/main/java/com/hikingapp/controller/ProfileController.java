package com.hikingapp.controller;

import com.hikingapp.dto.ChangePasswordRequest;
import com.hikingapp.dto.UserResponse;
import com.hikingapp.entity.User;
import com.hikingapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UserRepository userRepository,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public UserResponse getProfile(@AuthenticationPrincipal User user) {
        return UserResponse.from(user);
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(@AuthenticationPrincipal User user,
                                                  @RequestBody ChangePasswordRequest req) {
        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Неверный текущий пароль");
        }
        if (req.newPassword().length() < 6) {
            return ResponseEntity.badRequest().body("Пароль должен быть не менее 6 символов");
        }
        User managed = userRepository.findById(user.getId()).orElseThrow();
        managed.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(managed);
        return ResponseEntity.ok("Пароль изменён");
    }
}
