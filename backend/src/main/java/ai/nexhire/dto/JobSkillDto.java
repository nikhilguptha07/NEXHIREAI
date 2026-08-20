package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobSkillDto {
    private UUID id;
    private String skillName;
    private String importance;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public String getImportance() { return importance; }
    public void setImportance(String importance) { this.importance = importance; }
}

