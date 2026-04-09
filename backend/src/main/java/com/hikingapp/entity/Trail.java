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

    @Column(nullable = false)
    private String name;

    private String location;

    @Column(name = "distance_km")
    private BigDecimal distanceKm;

    private String difficulty;

    private Double latitude;
    private Double longitude;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId()                  { return id; }
    public String getName()              { return name; }
    public String getLocation()          { return location; }
    public BigDecimal getDistanceKm()    { return distanceKm; }
    public String getDifficulty()        { return difficulty; }
    public Double getLatitude()          { return latitude; }
    public Double getLongitude()         { return longitude; }
    public LocalDateTime getCreatedAt()  { return createdAt; }

    public void setId(Long id)                      { this.id = id; }
    public void setName(String name)                { this.name = name; }
    public void setLocation(String location)        { this.location = location; }
    public void setDistanceKm(BigDecimal d)         { this.distanceKm = d; }
    public void setDifficulty(String difficulty)    { this.difficulty = difficulty; }
    public void setLatitude(Double latitude)        { this.latitude = latitude; }
    public void setLongitude(Double longitude)      { this.longitude = longitude; }
    public void setCreatedAt(LocalDateTime t)       { this.createdAt = t; }
}
