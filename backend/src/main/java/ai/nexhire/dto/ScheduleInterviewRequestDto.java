package ai.nexhire.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotNull;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class ScheduleInterviewRequestDto {
    @NotNull(message = "Application ID is required")
    private UUID applicationId;

    private UUID interviewerId;

    @NotNull(message = "Scheduled time is required")
    private Instant scheduledAt;

    private Integer durationMinutes;
    private String location;
    private String meetingProvider; // Google Meet, Zoom, Microsoft Teams
    private String meetingUrl;
    
    @JsonAlias("type")
    private String interviewType;
    
    private String notes;

    public UUID getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(UUID applicationId) {
        this.applicationId = applicationId;
    }

    public UUID getInterviewerId() {
        return interviewerId;
    }

    public void setInterviewerId(UUID interviewerId) {
        this.interviewerId = interviewerId;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getMeetingProvider() {
        return meetingProvider;
    }

    public void setMeetingProvider(String meetingProvider) {
        this.meetingProvider = meetingProvider;
    }

    public String getMeetingUrl() {
        return meetingUrl;
    }

    public void setMeetingUrl(String meetingUrl) {
        this.meetingUrl = meetingUrl;
    }

    public String getInterviewType() {
        return interviewType;
    }

    public void setInterviewType(String interviewType) {
        this.interviewType = interviewType;
    }
}

