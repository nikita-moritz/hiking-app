package com.hikingapp.config;

import com.hikingapp.entity.*;
import com.hikingapp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TrailRepository trailRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           TrailRepository trailRepository,
                           EventRepository eventRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.trailRepository = trailRepository;
        this.eventRepository = eventRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Superuser
        if (userRepository.countByRole(Role.SUPERUSER) == 0) {
            User superuser = new User();
            superuser.setUsername("superuser");
            superuser.setEmail("superuser@hikingapp.com");
            superuser.setPassword(passwordEncoder.encode("superuser123"));
            superuser.setRole(Role.SUPERUSER);
            userRepository.save(superuser);
            System.out.println(">>> Superuser created: username=superuser, password=superuser123");
        }

        // Seed events (only if none exist)
        if (eventRepository.count() == 0) {
            User organizer = userRepository.findByUsername("superuser").orElse(null);
            if (organizer == null) return;

            var trails = trailRepository.findAll();
            if (trails.isEmpty()) return;

            String[][] seeds = {
                {"Весенний поход по Альпам",
                 "Групповой поход для начинающих. Берите удобную обувь и перекус.", "12", "7"},
                {"Горный марафон",
                 "Интенсивный маршрут для опытных туристов. Рекомендуется физподготовка.", "8", "14"},
                {"Норвежские фьорды — вечерний",
                 "Закатный поход вдоль скал. Берите фонарики.", "15", "3"},
            };

            for (int i = 0; i < seeds.length; i++) {
                Event event = new Event();
                event.setTitle(seeds[i][0]);
                event.setDescription(seeds[i][1]);
                event.setMaxParticipants(Integer.parseInt(seeds[i][2]));
                event.setEventDate(LocalDateTime.now().plusDays(Long.parseLong(seeds[i][3])));
                event.setOrganizer(organizer);
                if (i < trails.size()) event.setTrail(trails.get(i));
                eventRepository.save(event);
            }
            System.out.println(">>> Seed events created");
        }
    }
}
