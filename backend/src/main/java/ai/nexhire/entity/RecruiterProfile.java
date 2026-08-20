package ai.nexhire.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "RECRUITER_PROFILES")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMPANY_ID")
    private Company company;

    @Column(name = "TITLE", length = 150)
    private String title;

    @Column(name = "DEPARTMENT", length = 100)
    private String department;

    @Column(name = "PHONE", length = 30)
    private String phone;

    @Column(name = "LINKEDIN_URL", length = 500)
    private String linkedInUrl;
}
