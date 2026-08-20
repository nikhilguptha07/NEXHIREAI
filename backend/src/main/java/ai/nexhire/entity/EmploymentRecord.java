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

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "EMPLOYMENT_RECORDS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmploymentRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CANDIDATE_ID", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "RECRUITER_ID", nullable = false)
    private User recruiter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMPANY_ID")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "JOB_ID", nullable = false)
    private Job job;

    @Column(name = "JOB_TITLE", nullable = false, length = 150)
    private String jobTitle;

    @Column(name = "DEPARTMENT", length = 100)
    private String department;

    @Column(name = "SALARY_OFFERED", precision = 12, scale = 2)
    private BigDecimal salaryOffered;

    @Column(name = "OFFER_ACCEPTED_DATE", nullable = false)
    @Builder.Default
    private Instant offerAcceptedDate = Instant.now();

    @Column(name = "JOINING_DATE")
    private Instant joiningDate;

    @Column(name = "EMPLOYMENT_STATUS", nullable = false, length = 50)
    @Builder.Default
    private String employmentStatus = "HIRED";
}
