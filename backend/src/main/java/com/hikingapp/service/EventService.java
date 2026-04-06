package com.hikingapp.service;

import com.hikingapp.dto.EventRequest;
import com.hikingapp.dto.EventResponse;
import com.hikingapp.dto.ParticipantResponse;
import com.hikingapp.entity.*;
import com.hikingapp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepo;
    private final EventParticipantRepository participantRepo;
    private final TrailRepository trailRepo;
    private final UserRepository userRepo;

    public EventService(EventRepository eventRepo,
                        EventParticipantRepository participantRepo,
                        TrailRepository trailRepo,
                        UserRepository userRepo) {
        this.eventRepo = eventRepo;
        this.participantRepo = participantRepo;
        this.trailRepo = trailRepo;
        this.userRepo = userRepo;
    }

    public List<EventResponse> getAll(Long currentUserId) {
        return eventRepo.findAll().stream()
                .map(e -> toResponse(e, currentUserId))
                .toList();
    }

    public List<EventResponse> getUpcoming(Long currentUserId) {
        return eventRepo.findByStatusOrderByEventDateAsc(EventStatus.UPCOMING).stream()
                .map(e -> toResponse(e, currentUserId))
                .toList();
    }

    public EventResponse getById(Long id, Long currentUserId) {
        Event event = findEvent(id);
        return toResponse(event, currentUserId);
    }

    @Transactional
    public EventResponse create(EventRequest req, Long organizerId) {
        User organizer = userRepo.findById(organizerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Event event = new Event();
        event.setTitle(req.title());
        event.setDescription(req.description());
        event.setEventDate(req.eventDate());
        event.setMaxParticipants(req.maxParticipants());
        event.setOrganizer(organizer);

        if (req.trailId() != null) {
            trailRepo.findById(req.trailId()).ifPresent(event::setTrail);
        }

        return toResponse(eventRepo.save(event), organizerId);
    }

    @Transactional
    public EventResponse update(Long id, EventRequest req, Long requesterId) {
        Event event = findEvent(id);
        checkOrganizerOrSuperuser(event, requesterId);

        event.setTitle(req.title());
        event.setDescription(req.description());
        event.setEventDate(req.eventDate());
        event.setMaxParticipants(req.maxParticipants());
        event.setUpdatedAt(LocalDateTime.now());

        if (req.trailId() != null) {
            trailRepo.findById(req.trailId()).ifPresent(event::setTrail);
        }

        return toResponse(eventRepo.save(event), requesterId);
    }

    @Transactional
    public void cancel(Long id, Long requesterId) {
        Event event = findEvent(id);
        checkOrganizerOrSuperuser(event, requesterId);
        event.setStatus(EventStatus.CANCELLED);
        event.setUpdatedAt(LocalDateTime.now());
        eventRepo.save(event);
    }

    @Transactional
    public EventResponse join(Long eventId, Long userId) {
        Event event = findEvent(eventId);

        if (event.getStatus() != EventStatus.UPCOMING) {
            throw new IllegalStateException("Нельзя записаться — событие не активно");
        }

        long confirmed = participantRepo.countByEventIdAndStatus(eventId, ParticipantStatus.CONFIRMED);
        if (confirmed >= event.getMaxParticipants()) {
            throw new IllegalStateException("Мест нет — событие заполнено");
        }

        var existing = participantRepo.findByEventIdAndUserId(eventId, userId);
        if (existing.isPresent()) {
            EventParticipant p = existing.get();
            if (p.getStatus() == ParticipantStatus.CONFIRMED) {
                throw new IllegalStateException("Вы уже записаны на это событие");
            }
            p.setStatus(ParticipantStatus.CONFIRMED);
            participantRepo.save(p);
        } else {
            User user = userRepo.findById(userId).orElseThrow();
            participantRepo.save(new EventParticipant(event, user));
        }

        return toResponse(event, userId);
    }

    @Transactional
    public EventResponse leave(Long eventId, Long userId) {
        EventParticipant p = participantRepo.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new IllegalStateException("Вы не записаны на это событие"));
        p.setStatus(ParticipantStatus.CANCELLED);
        participantRepo.save(p);
        return toResponse(findEvent(eventId), userId);
    }

    public List<ParticipantResponse> getParticipants(Long eventId) {
        return participantRepo.findByEventId(eventId).stream()
                .map(ParticipantResponse::from)
                .toList();
    }

    public List<EventResponse> getMyEvents(Long userId) {
        return participantRepo.findByUserId(userId).stream()
                .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED)
                .map(p -> toResponse(p.getEvent(), userId))
                .toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Event findEvent(Long id) {
        return eventRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Событие не найдено: " + id));
    }

    private void checkOrganizerOrSuperuser(Event event, Long requesterId) {
        User requester = userRepo.findById(requesterId).orElseThrow();
        if (!event.getOrganizer().getId().equals(requesterId)
                && requester.getRole() != Role.SUPERUSER) {
            throw new SecurityException("Нет прав на редактирование этого события");
        }
    }

    private EventResponse toResponse(Event e, Long currentUserId) {
        long confirmed = participantRepo.countByEventIdAndStatus(e.getId(), ParticipantStatus.CONFIRMED);
        boolean joined = currentUserId != null &&
                participantRepo.findByEventIdAndUserId(e.getId(), currentUserId)
                        .map(p -> p.getStatus() == ParticipantStatus.CONFIRMED)
                        .orElse(false);
        return EventResponse.from(e, confirmed, joined);
    }
}
