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
public class InterviewDto {
    private UUID id;
    private UUID applicationId;
    private String jobTitle;
    private UUID interviewerId;
    private String interviewerName;
    private UUID candidateId;
    private String candidateName;
    private String candidateEmail;
    private Instant scheduledAt;
    private Integer durationMinutes;
    private String location;
    private String meetingProvider;
    private String meetingId;
    private String meetingUrl;
    private String interviewType;
    private String status;
    private String feedback;
    private Integer rating;
    private Instant createdAt;
    private Instant updatedAt;
}
