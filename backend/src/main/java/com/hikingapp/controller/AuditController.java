package com.hikingapp.controller;

import com.hikingapp.entity.AuditLog;
import com.hikingapp.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasRole('SUPERUSER')")
public class AuditController {

    private final AuditLogService auditLogService;

    public AuditController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public Page<AuditLog> getAll(Pageable pageable) {
        return auditLogService.getAll(pageable);
    }

    @GetMapping("/user/{userId}")
    public Page<AuditLog> getByUser(@PathVariable Long userId, Pageable pageable) {
        return auditLogService.getByUser(userId, pageable);
    }
}
