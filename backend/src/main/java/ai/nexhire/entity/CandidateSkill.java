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

@Entity
@Table(name = "CANDIDATE_SKILLS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "CANDIDATE_PROFILE_ID", nullable = false)
    private CandidateProfile candidateProfile;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "PROFICIENCY_LEVEL", length = 30)
    private String proficiencyLevel;

    @Column(name = "YEARS_OF_EXPERIENCE")
    private Integer yearsOfExperience;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CandidateProfile getCandidateProfile() { return candidateProfile; }
    public void setCandidateProfile(CandidateProfile candidateProfile) { this.candidateProfile = candidateProfile; }
    public String getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(String proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
}


