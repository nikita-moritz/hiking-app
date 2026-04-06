package com.hikingapp.controller;

import com.hikingapp.entity.Trail;
import com.hikingapp.repository.TrailRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trails")
@CrossOrigin(origins = "http://localhost:3000")
public class TrailController {

    private final TrailRepository trailRepository;

    public TrailController(TrailRepository trailRepository) {
        this.trailRepository = trailRepository;
    }

    @GetMapping
    public List<Trail> getAll() {
        return trailRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Trail> create(@RequestBody Trail trail) {
        Trail saved = trailRepository.save(trail);
        return ResponseEntity.ok(saved);
    }
}
