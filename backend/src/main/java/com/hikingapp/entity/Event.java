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

    @Column(name = "title_en")
    private String titleEn;

    @Column(name = "title_ru")
    private String titleRu;

    @Column(name = "title_de")
    private String titleDe;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trail_id")
    private Trail trail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Column(name = "organizer_name")
    private String organizerName;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "max_participants")
    private Integer maxParticipants = 10;

    private String status = "upcoming";

    private Double latitude;
    private Double longitude;

    @Column(name = "location_name")
    private String locationName;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId()                     { return id; }
    public String getTitle()                { return title; }
    public String getTitleEn()              { return titleEn; }
    public String getTitleRu()              { return titleRu; }
    public String getTitleDe()              { return titleDe; }
    public String getDescription()          { return description; }
    public Trail getTrail()                 { return trail; }
    public User getOrganizer()              { return organizer; }
    public String getOrganizerName()        { return organizerName; }
    public LocalDateTime getEventDate()     { return eventDate; }
    public Integer getMaxParticipants()     { return maxParticipants; }
    public String getStatus()               { return status; }
    public Double getLatitude()             { return latitude; }
    public Double getLongitude()            { return longitude; }
    public String getLocationName()         { return locationName; }
    public LocalDateTime getCreatedAt()     { return createdAt; }
    public LocalDateTime getUpdatedAt()     { return updatedAt; }

    public void setId(Long id)                          { this.id = id; }
    public void setTitle(String title)                  { this.title = title; }
    public void setTitleEn(String titleEn)              { this.titleEn = titleEn; }
    public void setTitleRu(String titleRu)              { this.titleRu = titleRu; }
    public void setTitleDe(String titleDe)              { this.titleDe = titleDe; }
    public void setDescription(String description)      { this.description = description; }
    public void setTrail(Trail trail)                   { this.trail = trail; }
    public void setOrganizer(User organizer)            { this.organizer = organizer; }
    public void setOrganizerName(String name)           { this.organizerName = name; }
    public void setEventDate(LocalDateTime eventDate)   { this.eventDate = eventDate; }
    public void setMaxParticipants(Integer max)         { this.maxParticipants = max; }
    public void setStatus(String status)                { this.status = status; }
    public void setLatitude(Double latitude)            { this.latitude = latitude; }
    public void setLongitude(Double longitude)          { this.longitude = longitude; }
    public void setLocationName(String locationName)    { this.locationName = locationName; }
    public void setCreatedAt(LocalDateTime t)           { this.createdAt = t; }
    public void setUpdatedAt(LocalDateTime t)           { this.updatedAt = t; }
}
