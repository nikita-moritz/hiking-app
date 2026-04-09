package com.hikingapp.controller;

import com.hikingapp.dto.TrailResponse;
import com.hikingapp.repository.TrailRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trails")
public class TrailController {

    private final TrailRepository trailRepo;

    public TrailController(TrailRepository trailRepo) {
        this.trailRepo = trailRepo;
    }

    @GetMapping
    public List<TrailResponse> getAll() {
        return trailRepo.findAll().stream().map(TrailResponse::from).toList();
    }

    @GetMapping("/{id}")
    public TrailResponse getById(@PathVariable Long id) {
        return trailRepo.findById(id)
                .map(TrailResponse::from)
                .orElseThrow(() -> new IllegalArgumentException("Trail not found: " + id));
    }
}
