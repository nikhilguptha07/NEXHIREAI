package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDto {
    private UUID id;
    private String title;
    private String description;
    private String department;
    private String location;
    private String jobType;
    private String experienceLevel;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;
    private Integer minimumScore;
    private String status;
    private UUID companyId;
    private String companyName;
    private UUID postedById;
    private String postedByName;
    private List<JobSkillDto> requiredSkills;
    private Instant createdAt;
    private Instant updatedAt;
}
