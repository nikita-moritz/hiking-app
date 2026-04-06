package com.hikingapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    private String username;
    private String action;
    private String resource;

    @Column(name = "resource_id")
    private String resourceId;

    private String details;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public AuditLog() {}

    public AuditLog(Long userId, String username, String action,
                    String resource, String resourceId, String details, String ipAddress) {
        this.userId = userId;
        this.username = username;
        this.action = action;
        this.resource = resource;
        this.resourceId = resourceId;
        this.details = details;
        this.ipAddress = ipAddress;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId()              { return id; }
    public Long getUserId()          { return userId; }
    public String getUsername()      { return username; }
    public String getAction()        { return action; }
    public String getResource()      { return resource; }
    public String getResourceId()    { return resourceId; }
    public String getDetails()       { return details; }
    public String getIpAddress()     { return ipAddress; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
