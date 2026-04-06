package com.hikingapp.controller;

import com.hikingapp.dto.EventRequest;
import com.hikingapp.dto.EventResponse;
import com.hikingapp.dto.ParticipantResponse;
import com.hikingapp.entity.User;
import com.hikingapp.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // ── Public (authenticated) ────────────────────────────────────────────────

    @GetMapping
    public List<EventResponse> getAll(@AuthenticationPrincipal User user) {
        return eventService.getUpcoming(user.getId());
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return eventService.getById(id, user.getId());
    }

    @GetMapping("/my")
    public List<EventResponse> getMyEvents(@AuthenticationPrincipal User user) {
        return eventService.getMyEvents(user.getId());
    }

    // ── Admin / Superuser ─────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERUSER')")
    public ResponseEntity<EventResponse> create(@RequestBody EventRequest req,
                                                @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(eventService.create(req, user.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERUSER')")
    public EventResponse update(@PathVariable Long id,
                                @RequestBody EventRequest req,
                                @AuthenticationPrincipal User user) {
        return eventService.update(id, req, user.getId());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERUSER')")
    public ResponseEntity<Void> cancel(@PathVariable Long id,
                                       @AuthenticationPrincipal User user) {
        eventService.cancel(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/participants")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERUSER')")
    public List<ParticipantResponse> getParticipants(@PathVariable Long id) {
        return eventService.getParticipants(id);
    }

    // ── User actions ──────────────────────────────────────────────────────────

    @PostMapping("/{id}/join")
    public EventResponse join(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return eventService.join(id, user.getId());
    }

    @DeleteMapping("/{id}/leave")
    public EventResponse leave(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return eventService.leave(id, user.getId());
    }
}
