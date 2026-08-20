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
@Table(name = "EDUCATIONS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Education extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CANDIDATE_PROFILE_ID", nullable = false)
    private CandidateProfile candidateProfile;

    @Column(name = "INSTITUTION", nullable = false, length = 200)
    private String institution;

    @Column(name = "DEGREE", nullable = false, length = 150)
    private String degree;

    @Column(name = "FIELD_OF_STUDY", length = 150)
    private String fieldOfStudy;

    @Column(name = "START_DATE")
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Column(name = "GRADE", length = 50)
    private String grade;
}
