package com.hikingapp.dto;

import java.time.LocalDateTime;

public record EventRequest(
        String title,
        String description,
        Long trailId,
        LocalDateTime eventDate,
        int maxParticipants
) {}
