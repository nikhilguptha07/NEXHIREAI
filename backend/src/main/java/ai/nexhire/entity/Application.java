package ai.nexhire.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "APPLICATIONS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Application extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "JOB_ID", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CANDIDATE_ID", nullable = false)
    private User candidate;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "ATS_SCORE")
    private Integer atsScore;

    @Column(name = "AI_RECOMMENDATION", length = 100)
    private String aiRecommendation;

    @Column(name = "RESUME_URL", length = 500)
    private String resumeUrl;

    @Column(name = "COVER_LETTER", length = 2000)
    private String coverLetter;

    @Column(name = "NOTES", length = 1000)
    private String notes;
}
