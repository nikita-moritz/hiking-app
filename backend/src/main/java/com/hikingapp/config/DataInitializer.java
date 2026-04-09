package com.hikingapp.config;

import com.hikingapp.entity.*;
import com.hikingapp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.countByRole(Role.SUPERUSER) == 0) {
            User superuser = new User();
            superuser.setUsername("superuser");
            superuser.setEmail("superuser@hikingapp.com");
            superuser.setPassword(passwordEncoder.encode("superuser123"));
            superuser.setRole(Role.SUPERUSER);
            userRepository.save(superuser);
            System.out.println(">>> Superuser created: username=superuser, password=superuser123");
        }
    }
}
