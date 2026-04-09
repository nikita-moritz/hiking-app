package com.hikingapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_participants",
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
public class EventParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String status = "confirmed";

    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now();

    public Long getId()                 { return id; }
    public Event getEvent()             { return event; }
    public User getUser()               { return user; }
    public String getStatus()           { return status; }
    public LocalDateTime getJoinedAt()  { return joinedAt; }

    public void setId(Long id)              { this.id = id; }
    public void setEvent(Event event)       { this.event = event; }
    public void setUser(User user)          { this.user = user; }
    public void setStatus(String status)    { this.status = status; }
    public void setJoinedAt(LocalDateTime t){ this.joinedAt = t; }
}
