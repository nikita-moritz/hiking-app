package com.hikingapp.repository;

import com.hikingapp.entity.EventParticipant;
import com.hikingapp.entity.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {
    List<EventParticipant> findByEventId(Long eventId);
    List<EventParticipant> findByUserId(Long userId);
    Optional<EventParticipant> findByEventIdAndUserId(Long eventId, Long userId);
    long countByEventIdAndStatus(Long eventId, ParticipantStatus status);
}
