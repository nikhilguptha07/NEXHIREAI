package ai.nexhire.controller;

import ai.nexhire.dto.UserDto;
import ai.nexhire.entity.AuditLog;
import ai.nexhire.entity.Company;
import ai.nexhire.entity.UserStatus;
import ai.nexhire.service.AdminService;
import ai.nexhire.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;

    public AdminController(AdminService adminService, AuditLogService auditLogService) {
        this.adminService = adminService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        Map<String, Object> stats = adminService.getSystemStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserDto>> getAllUsers(@PageableDefault(size = 20) Pageable pageable) {
        Page<UserDto> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserDto> updateUserStatus(@PathVariable UUID id, @RequestParam UserStatus status) {
        UserDto updated = adminService.updateUserStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/companies")
    public ResponseEntity<Page<Company>> getAllCompanies(@PageableDefault(size = 20) Pageable pageable) {
        Page<Company> companies = adminService.getAllCompanies(pageable);
        return ResponseEntity.ok(companies);
    }

    @PatchMapping("/companies/{id}/status")
    public ResponseEntity<Company> updateCompanyStatus(@PathVariable UUID id, @RequestParam String status) {
        Company company = adminService.updateCompanyStatus(id, status);
        return ResponseEntity.ok(company);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(@PageableDefault(size = 30) Pageable pageable) {
        Page<AuditLog> logs = auditLogService.getAuditLogs(pageable);
        return ResponseEntity.ok(logs);
    }
}
