package ai.nexhire.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "JOBS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Job extends BaseEntity {

    @Column(name = "TITLE", nullable = false, length = 150)
    private String title;

    @Column(name = "DESCRIPTION", nullable = false, length = 4000)
    private String description;

    @Column(name = "DEPARTMENT", length = 100)
    private String department;

    @Column(name = "LOCATION", length = 150)
    private String location;

    @Column(name = "JOB_TYPE", length = 50)
    private String jobType; // FULL_TIME, PART_TIME, CONTRACT, REMOTE

    @Column(name = "EXPERIENCE_LEVEL", length = 50)
    private String experienceLevel; // ENTRY, MID, SENIOR, LEAD, EXECUTIVE

    @Column(name = "MIN_SALARY", precision = 12, scale = 2)
    private BigDecimal minSalary;

    @Column(name = "MAX_SALARY", precision = 12, scale = 2)
    private BigDecimal maxSalary;

    @Column(name = "CURRENCY", length = 10)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "MINIMUM_SCORE")
    @Builder.Default
    private Integer minimumScore = 80;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private JobStatus status = JobStatus.PUBLISHED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COMPANY_ID")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "POSTED_BY_ID", nullable = false)
    private User postedBy;

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobSkill> requiredSkills = new ArrayList<>();
}
