package ai.nexhire.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "NOTIFICATIONS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User recipient;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "MESSAGE", nullable = false, length = 1000)
    private String message;

    @Column(name = "TYPE", length = 50)
    private String type;

    @Column(name = "READ_AT")
    private Instant readAt;

    @Column(name = "LINK", length = 500)
    private String link;
}
