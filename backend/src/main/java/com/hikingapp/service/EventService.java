package com.hikingapp.service;

import com.hikingapp.dto.EventRequest;
import com.hikingapp.dto.EventResponse;
import com.hikingapp.entity.Event;
import com.hikingapp.entity.EventParticipant;
import com.hikingapp.entity.User;
import com.hikingapp.repository.EventParticipantRepository;
import com.hikingapp.repository.EventRepository;
import com.hikingapp.repository.TrailRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepo;
    private final EventParticipantRepository participantRepo;
    private final TrailRepository trailRepo;

    public EventService(EventRepository eventRepo,
                        EventParticipantRepository participantRepo,
                        TrailRepository trailRepo) {
        this.eventRepo = eventRepo;
        this.participantRepo = participantRepo;
        this.trailRepo = trailRepo;
    }

    public List<EventResponse> getUpcoming() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneMonthLater = now.plusDays(30);
        return eventRepo
                .findByStatusAndEventDateBetweenOrderByEventDateAsc("upcoming", now, oneMonthLater)
                .stream()
                .map(e -> EventResponse.from(e, participantRepo.countByEventIdAndStatus(e.getId(), "confirmed")))
                .toList();
    }

    public EventResponse getById(Long id) {
        Event e = eventRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
        return EventResponse.from(e, participantRepo.countByEventIdAndStatus(id, "confirmed"));
    }

    public EventResponse create(EventRequest req, User organizer) {
        Event e = new Event();
        e.setTitle(req.titleEn() != null ? req.titleEn() : req.title());
        e.setTitleEn(req.titleEn() != null ? req.titleEn() : req.title());
        e.setTitleRu(req.titleRu());
        e.setTitleDe(req.titleDe());
        e.setDescription(req.description());
        e.setEventDate(req.eventDate());
        e.setMaxParticipants(req.maxParticipants() != null ? req.maxParticipants() : 10);
        e.setLatitude(req.latitude());
        e.setLongitude(req.longitude());
        e.setLocationName(req.locationName());
        e.setOrganizer(organizer);
        e.setOrganizerName(organizer.getUsername());
        if (req.trailId() != null) {
            trailRepo.findById(req.trailId()).ifPresent(e::setTrail);
        }
        return EventResponse.from(eventRepo.save(e), 0);
    }

    public EventResponse update(Long id, EventRequest req, User requester) {
        Event e = eventRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
        checkOwnership(e, requester);

        e.setTitle(req.titleEn() != null ? req.titleEn() : req.title());
        e.setTitleEn(req.titleEn() != null ? req.titleEn() : req.title());
        e.setTitleRu(req.titleRu());
        e.setTitleDe(req.titleDe());
        e.setDescription(req.description());
        e.setEventDate(req.eventDate());
        if (req.maxParticipants() != null) e.setMaxParticipants(req.maxParticipants());
        e.setLatitude(req.latitude());
        e.setLongitude(req.longitude());
        e.setLocationName(req.locationName());
        e.setUpdatedAt(LocalDateTime.now());
        if (req.trailId() != null) {
            trailRepo.findById(req.trailId()).ifPresent(e::setTrail);
        }
        return EventResponse.from(eventRepo.save(e),
                participantRepo.countByEventIdAndStatus(id, "confirmed"));
    }

    public void delete(Long id, User requester) {
        Event e = eventRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + id));
        checkOwnership(e, requester);
        eventRepo.delete(e);
    }

    public void join(Long eventId, User user) {
        Event e = eventRepo.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found: " + eventId));
        if (participantRepo.existsByEventIdAndUserId(eventId, user.getId())) {
            throw new IllegalStateException("Already joined");
        }
        long count = participantRepo.countByEventIdAndStatus(eventId, "confirmed");
        if (count >= e.getMaxParticipants()) {
            throw new IllegalStateException("Event is full");
        }
        EventParticipant p = new EventParticipant();
        p.setEvent(e);
        p.setUser(user);
        participantRepo.save(p);
    }

    public void leave(Long eventId, User user) {
        EventParticipant p = participantRepo.findByEventIdAndUserId(eventId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Not a participant"));
        participantRepo.delete(p);
    }

    private void checkOwnership(Event e, User requester) {
        boolean isOrganizer = e.getOrganizer() != null &&
                e.getOrganizer().getId().equals(requester.getId());
        boolean isSuperuser = requester.getRole().name().equals("SUPERUSER");
        if (!isOrganizer && !isSuperuser) {
            throw new SecurityException("Not authorized");
        }
    }
}
