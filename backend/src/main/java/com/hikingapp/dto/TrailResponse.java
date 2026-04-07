package com.hikingapp.dto;

import com.hikingapp.entity.Trail;
import java.math.BigDecimal;
import java.util.List;

public record TrailResponse(
        Long id,
        String name,
        String location,
        BigDecimal distanceKm,
        String difficulty,
        List<EventResponse> upcomingEvents
) {
    public static TrailResponse from(Trail t, List<EventResponse> events) {
        return new TrailResponse(t.getId(), t.getName(), t.getLocation(),
                t.getDistanceKm(), t.getDifficulty(), events);
    }
}
