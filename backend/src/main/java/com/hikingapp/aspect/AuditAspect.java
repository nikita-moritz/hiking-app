package com.hikingapp.aspect;

import com.hikingapp.entity.User;
import com.hikingapp.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class AuditAspect {

    private final AuditLogService auditLogService;

    public AuditAspect(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @Around("execution(* com.hikingapp.controller..*(..))")
    public Object logControllerAction(ProceedingJoinPoint pjp) throws Throwable {
        String action = pjp.getSignature().getDeclaringType().getSimpleName()
                + "." + pjp.getSignature().getName();

        Long userId = null;
        String username = "anonymous";
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof User u) {
            userId = u.getId();
            username = u.getUsername();
        }

        String ip = null;
        var reqAttrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (reqAttrs != null) {
            HttpServletRequest req = reqAttrs.getRequest();
            ip = req.getRemoteAddr();
        }

        Object result = pjp.proceed();

        auditLogService.log(userId, username, action, null, null, null, ip);
        return result;
    }
}
