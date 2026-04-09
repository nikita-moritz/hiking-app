package com.hikingapp.dto;

import com.hikingapp.entity.Event;

import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String title,
        String titleEn,
        String titleRu,
        String titleDe,
        String description,
        Long trailId,
        Long organizerId,
        String organizerName,
        LocalDateTime eventDate,
        Integer maxParticipants,
        long participantCount,
        String status,
        Double latitude,
        Double longitude,
        String locationName,
        LocalDateTime createdAt
) {
    public static EventResponse from(Event e, long participantCount) {
        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getTitleEn(),
                e.getTitleRu(),
                e.getTitleDe(),
                e.getDescription(),
                e.getTrail() != null ? e.getTrail().getId() : null,
                e.getOrganizer() != null ? e.getOrganizer().getId() : null,
                e.getOrganizerName(),
                e.getEventDate(),
                e.getMaxParticipants(),
                participantCount,
                e.getStatus(),
                e.getLatitude(),
                e.getLongitude(),
                e.getLocationName(),
                e.getCreatedAt()
        );
    }
}
