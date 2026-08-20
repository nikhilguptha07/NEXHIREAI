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

import java.time.LocalDate;

@Entity
@Table(name = "WORK_EXPERIENCES")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkExperience extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CANDIDATE_PROFILE_ID", nullable = false)
    private CandidateProfile candidateProfile;

    @Column(name = "COMPANY_NAME", nullable = false, length = 150)
    private String companyName;

    @Column(name = "TITLE", nullable = false, length = 150)
    private String title;

    @Column(name = "LOCATION", length = 150)
    private String location;

    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Column(name = "IS_CURRENT", nullable = false)
    @Builder.Default
    private boolean isCurrent = false;

    @Column(name = "DESCRIPTION", length = 2000)
    private String description;
}
