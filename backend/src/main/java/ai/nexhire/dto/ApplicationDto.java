package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDto {
    private UUID id;
    private UUID jobId;
    private String jobTitle;
    private String department;
    private UUID candidateId;
    private String candidateName;
    private String candidateEmail;
    private UUID recruiterId;
    private String recruiterName;
    private Integer atsScore;
    private String aiRecommendation;
    private String matchedSkills;
    private String missingSkills;
    private Integer experienceScore;
    private Integer educationScore;
    private String status;
    private String resumeUrl;
    private String coverLetter;
    private String notes;
    private Instant hiredAt;
    private String hiredBy;
    private Instant offerAcceptedAt;
    private Instant joiningDate;
    private java.math.BigDecimal salaryOffered;
    private Instant offerExpiry;
    private Instant createdAt;
    private Instant updatedAt;
}



