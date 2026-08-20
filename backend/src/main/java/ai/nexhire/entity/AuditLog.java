package ai.nexhire.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "AUDIT_LOGS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog extends BaseEntity {

    @Column(name = "USER_ID")
    private String userId;

    @Column(name = "USER_EMAIL", length = 150)
    private String userEmail;

    @Column(name = "ACTION", nullable = false, length = 100)
    private String action;

    @Column(name = "RESOURCE_NAME", length = 150)
    private String resource;

    @Column(name = "IP_ADDRESS", length = 50)
    private String ipAddress;

    @Column(name = "DETAILS", length = 2000)
    private String details;
}
