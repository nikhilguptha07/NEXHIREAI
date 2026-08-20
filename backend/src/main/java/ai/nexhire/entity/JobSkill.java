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
@Table(name = "JOB_SKILLS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "JOB_ID", nullable = false)
    private Job job;

    @Column(name = "SKILL_NAME", nullable = false, length = 100)
    private String skillName;

    @Column(name = "IMPORTANCE", length = 30)
    private String importance; // REQUIRED, PREFERRED, NICE_TO_HAVE

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    public String getImportance() { return importance; }
    public void setImportance(String importance) { this.importance = importance; }
}


