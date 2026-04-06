package com.hikingapp.controller;

import com.hikingapp.dto.UserResponse;
import com.hikingapp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('SUPERUSER')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PutMapping("/{id}/role")
    public UserResponse updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userService.updateRole(id, body.get("role"));
    }

    @PutMapping("/{id}/toggle")
    public UserResponse toggleActive(@PathVariable Long id) {
        return userService.toggleActive(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
