package com.hikingapp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trails")
public class Trail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String location;

    @Column(name = "distance_km")
    private BigDecimal distanceKm;

    private String difficulty;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getLocation() { return location; }
    public BigDecimal getDistanceKm() { return distanceKm; }
    public String getDifficulty() { return difficulty; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setLocation(String location) { this.location = location; }
    public void setDistanceKm(BigDecimal distanceKm) { this.distanceKm = distanceKm; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
