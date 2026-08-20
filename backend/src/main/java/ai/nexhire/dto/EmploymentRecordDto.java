package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmploymentRecordDto {
    private UUID id;
    private UUID candidateId;
    private String candidateName;
    private String candidateEmail;
    private UUID recruiterId;
    private String recruiterName;
    private UUID companyId;
    private String companyName;
    private UUID jobId;
    private String jobTitle;
    private String department;
    private BigDecimal salaryOffered;
    private Instant offerAcceptedDate;
    private Instant joiningDate;
    private String employmentStatus;
    private Instant createdAt;
}
