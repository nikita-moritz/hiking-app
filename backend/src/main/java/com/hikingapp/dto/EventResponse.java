package com.hikingapp.dto;

import com.hikingapp.entity.Event;

import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String title,
        String description,
        Long trailId,
        String trailName,
        Long organizerId,
        String organizerUsername,
        LocalDateTime eventDate,
        int maxParticipants,
        long confirmedCount,
        boolean joined,
        String status
) {
    public static EventResponse from(Event e, long confirmedCount, boolean joined) {
        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getTrail() != null ? e.getTrail().getId() : null,
                e.getTrail() != null ? e.getTrail().getName() : null,
                e.getOrganizer().getId(),
                e.getOrganizer().getUsername(),
                e.getEventDate(),
                e.getMaxParticipants(),
                confirmedCount,
                joined,
                e.getStatus().name()
        );
    }
}
