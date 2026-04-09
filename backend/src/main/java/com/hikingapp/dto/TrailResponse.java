package com.hikingapp.dto;

import com.hikingapp.entity.Trail;

import java.math.BigDecimal;

public record TrailResponse(
        Long id,
        String name,
        String location,
        BigDecimal distanceKm,
        String difficulty,
        Double latitude,
        Double longitude
) {
    public static TrailResponse from(Trail t) {
        return new TrailResponse(
                t.getId(), t.getName(), t.getLocation(),
                t.getDistanceKm(), t.getDifficulty(),
                t.getLatitude(), t.getLongitude()
        );
    }
}
