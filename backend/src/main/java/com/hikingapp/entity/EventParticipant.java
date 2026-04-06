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

    @Enumerated(EnumType.STRING)
    private ParticipantStatus status = ParticipantStatus.CONFIRMED;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt = LocalDateTime.now();

    public EventParticipant() {}

    public EventParticipant(Event event, User user) {
        this.event = event;
        this.user = user;
    }

    public Long getId()                   { return id; }
    public Event getEvent()               { return event; }
    public User getUser()                 { return user; }
    public ParticipantStatus getStatus()  { return status; }
    public LocalDateTime getJoinedAt()    { return joinedAt; }

    public void setStatus(ParticipantStatus status) { this.status = status; }
}
