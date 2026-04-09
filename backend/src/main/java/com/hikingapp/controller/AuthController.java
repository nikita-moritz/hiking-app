package com.hikingapp.controller;

import com.hikingapp.dto.AuthResponse;
import com.hikingapp.dto.LoginRequest;
import com.hikingapp.dto.RegisterRequest;
import com.hikingapp.dto.UserResponse;
import com.hikingapp.entity.User;
import com.hikingapp.security.JwtUtil;
import com.hikingapp.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon-key}")
    private String supabaseAnonKey;

    public AuthController(AuthenticationManager authManager, JwtUtil jwtUtil, UserService userService) {
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        User user = (User) userService.loadUserByUsername(req.username());
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(userService.createUser(req));
    }

    @PostMapping("/supabase")
    public ResponseEntity<AuthResponse> supabaseLogin(@RequestHeader("Authorization") String bearerToken) {
        String supabaseToken = bearerToken.replace("Bearer ", "");

        // Verify token with Supabase and get user info
        RestTemplate rest = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + supabaseToken);
        headers.set("apikey", supabaseAnonKey);

        try {
            ResponseEntity<Map> resp = rest.exchange(
                supabaseUrl + "/auth/v1/user",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
            );
            Map<String, Object> supabaseUser = resp.getBody();
            String email = (String) supabaseUser.get("email");
            Map<String, Object> meta = (Map<String, Object>) supabaseUser.get("user_metadata");
            String name = meta != null && meta.get("name") != null
                ? (String) meta.get("name")
                : email.split("@")[0];

            User user = userService.findOrCreateByEmail(email, name);
            String token = jwtUtil.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
