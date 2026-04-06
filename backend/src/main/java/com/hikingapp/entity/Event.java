package com.hikingapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trail_id")
    private Trail trail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "max_participants")
    private int maxParticipants = 10;

    @Enumerated(EnumType.STRING)
    private EventStatus status = EventStatus.UPCOMING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId()                     { return id; }
    public String getTitle()                { return title; }
    public String getDescription()          { return description; }
    public Trail getTrail()                 { return trail; }
    public User getOrganizer()              { return organizer; }
    public LocalDateTime getEventDate()     { return eventDate; }
    public int getMaxParticipants()         { return maxParticipants; }
    public EventStatus getStatus()          { return status; }
    public LocalDateTime getCreatedAt()     { return createdAt; }
    public LocalDateTime getUpdatedAt()     { return updatedAt; }

    public void setTitle(String title)                      { this.title = title; }
    public void setDescription(String description)          { this.description = description; }
    public void setTrail(Trail trail)                       { this.trail = trail; }
    public void setOrganizer(User organizer)                { this.organizer = organizer; }
    public void setEventDate(LocalDateTime eventDate)       { this.eventDate = eventDate; }
    public void setMaxParticipants(int maxParticipants)     { this.maxParticipants = maxParticipants; }
    public void setStatus(EventStatus status)               { this.status = status; }
    public void setUpdatedAt(LocalDateTime updatedAt)       { this.updatedAt = updatedAt; }
}
