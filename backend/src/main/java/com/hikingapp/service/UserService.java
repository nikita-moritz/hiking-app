package com.hikingapp.service;

import com.hikingapp.dto.RegisterRequest;
import com.hikingapp.dto.UserResponse;
import com.hikingapp.entity.Role;
import com.hikingapp.entity.User;
import com.hikingapp.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private static final int MAX_SUPERUSERS = 3;

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        return repo.findByUsername(username)
                .or(() -> repo.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public UserResponse createUser(RegisterRequest req) {
        if (repo.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (repo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Role role = parseRole(req.role());
        if (role == Role.SUPERUSER && repo.countByRole(Role.SUPERUSER) >= MAX_SUPERUSERS) {
            throw new IllegalStateException("Maximum number of superusers (" + MAX_SUPERUSERS + ") reached");
        }

        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPassword(encoder.encode(req.password()));
        user.setRole(role);
        return UserResponse.from(repo.save(user));
    }

    public User findOrCreateByEmail(String email, String name) {
        return repo.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setEmail(email);
            user.setUsername(name);
            user.setPassword(encoder.encode(java.util.UUID.randomUUID().toString()));
            user.setRole(Role.USER);
            return repo.save(user);
        });
    }

    public List<UserResponse> getAll() {
        return repo.findAll().stream().map(UserResponse::from).toList();
    }

    public UserResponse getById(Long id) {
        return repo.findById(id)
                .map(UserResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public UserResponse updateRole(Long id, String roleName) {
        User user = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        Role role = parseRole(roleName);
        if (role == Role.SUPERUSER && repo.countByRole(Role.SUPERUSER) >= MAX_SUPERUSERS) {
            throw new IllegalStateException("Maximum number of superusers reached");
        }
        user.setRole(role);
        return UserResponse.from(repo.save(user));
    }

    public UserResponse toggleActive(Long id) {
        User user = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setActive(!user.isActive());
        return UserResponse.from(repo.save(user));
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role == null ? "USER" : role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + role);
        }
    }
}
