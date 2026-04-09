package com.hikingapp.dto;

import java.time.LocalDateTime;

public record EventRequest(
        String title,
        String titleEn,
        String titleRu,
        String titleDe,
        String description,
        Long trailId,
        LocalDateTime eventDate,
        Integer maxParticipants,
        Double latitude,
        Double longitude,
        String locationName
) {}
