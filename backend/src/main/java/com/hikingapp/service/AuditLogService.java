package com.hikingapp.service;

import com.hikingapp.entity.AuditLog;
import com.hikingapp.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository repo;

    public AuditLogService(AuditLogRepository repo) {
        this.repo = repo;
    }

    public void log(Long userId, String username, String action,
                    String resource, String resourceId, String details, String ip) {
        repo.save(new AuditLog(userId, username, action, resource, resourceId, details, ip));
    }

    public Page<AuditLog> getAll(Pageable pageable) {
        return repo.findAll(pageable);
    }

    public Page<AuditLog> getByUser(Long userId, Pageable pageable) {
        return repo.findByUserId(userId, pageable);
    }
}
