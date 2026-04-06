package com.hikingapp.dto;

import com.hikingapp.entity.EventParticipant;
import java.time.LocalDateTime;

public record ParticipantResponse(Long userId, String username, String status, LocalDateTime joinedAt) {
    public static ParticipantResponse from(EventParticipant p) {
        return new ParticipantResponse(
                p.getUser().getId(),
                p.getUser().getUsername(),
                p.getStatus().name(),
                p.getJoinedAt()
        );
    }
}
