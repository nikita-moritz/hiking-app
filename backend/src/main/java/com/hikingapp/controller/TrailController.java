package com.hikingapp.controller;

import com.hikingapp.dto.EventResponse;
import com.hikingapp.dto.TrailResponse;
import com.hikingapp.entity.Trail;
import com.hikingapp.entity.User;
import com.hikingapp.repository.EventParticipantRepository;
import com.hikingapp.repository.EventRepository;
import com.hikingapp.repository.TrailRepository;
import com.hikingapp.entity.ParticipantStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/trails")
public class TrailController {

    private final TrailRepository trailRepository;
    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;

    public TrailController(TrailRepository trailRepository,
                           EventRepository eventRepository,
                           EventParticipantRepository participantRepository) {
        this.trailRepository = trailRepository;
        this.eventRepository = eventRepository;
        this.participantRepository = participantRepository;
    }

    @GetMapping
    public List<Trail> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) BigDecimal maxKm) {
        return trailRepository.search(
                (query != null && query.isBlank()) ? null : query,
                (difficulty != null && difficulty.isBlank()) ? null : difficulty,
                maxKm);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrailResponse> getById(@PathVariable Long id,
                                                  @AuthenticationPrincipal User user) {
        return trailRepository.findById(id).map(trail -> {
            List<EventResponse> events = eventRepository.findUpcomingByTrailId(id).stream()
                    .map(e -> {
                        long confirmed = participantRepository
                                .countByEventIdAndStatus(e.getId(), ParticipantStatus.CONFIRMED);
                        boolean joined = participantRepository
                                .findByEventIdAndUserId(e.getId(), user.getId())
                                .map(p -> p.getStatus() == ParticipantStatus.CONFIRMED)
                                .orElse(false);
                        return EventResponse.from(e, confirmed, joined);
                    })
                    .toList();
            return ResponseEntity.ok(TrailResponse.from(trail, events));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERUSER')")
    public ResponseEntity<Trail> create(@RequestBody Trail trail) {
        return ResponseEntity.ok(trailRepository.save(trail));
    }
}
