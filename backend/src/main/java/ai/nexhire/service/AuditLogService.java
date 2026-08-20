package ai.nexhire.service;

import ai.nexhire.entity.AuditLog;
import ai.nexhire.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logAction(String userId, String userEmail, String action, String resource, String ipAddress, String details) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .action(action)
                .resource(resource)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .details(details)
                .build();
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc();
    }
}
