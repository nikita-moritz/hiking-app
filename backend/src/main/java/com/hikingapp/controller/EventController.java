package com.hikingapp.controller;

import com.hikingapp.dto.EventRequest;
import com.hikingapp.dto.EventResponse;
import com.hikingapp.entity.User;
import com.hikingapp.service.EventService;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public List<EventResponse> getUpcoming() {
        return eventService.getUpcoming();
    }

    @GetMapping("/{id}")
    public EventResponse getById(@PathVariable Long id) {
        return eventService.getById(id);
    }

    @PostMapping
    public EventResponse create(@RequestBody EventRequest req,
                                @AuthenticationPrincipal User user) {
        return eventService.create(req, user);
    }

    @PutMapping("/{id}")
    public EventResponse update(@PathVariable Long id,
                                @RequestBody EventRequest req,
                                @AuthenticationPrincipal User user) {
        return eventService.update(id, req, user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal User user) {
        eventService.delete(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> join(@PathVariable Long id,
                                     @AuthenticationPrincipal User user) {
        eventService.join(id, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/join")
    public ResponseEntity<Void> leave(@PathVariable Long id,
                                      @AuthenticationPrincipal User user) {
        eventService.leave(id, user);
        return ResponseEntity.noContent().build();
    }
}
