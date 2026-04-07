package com.hikingapp.controller;

import com.hikingapp.entity.Trail;
import com.hikingapp.repository.TrailRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/trails")
public class TrailController {

    private final TrailRepository trailRepository;

    public TrailController(TrailRepository trailRepository) {
        this.trailRepository = trailRepository;
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

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERUSER')")
    public ResponseEntity<Trail> create(@RequestBody Trail trail) {
        return ResponseEntity.ok(trailRepository.save(trail));
    }
}
