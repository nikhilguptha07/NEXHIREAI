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

import java.time.Instant;

@Entity
@Table(name = "INTERVIEWS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interview extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "APPLICATION_ID", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "INTERVIEWER_ID", nullable = false)
    private User interviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CANDIDATE_ID")
    private User candidate;

    @Column(name = "SCHEDULED_AT", nullable = false)
    private Instant scheduledAt;

    @Column(name = "DURATION_MINUTES")
    @Builder.Default
    private Integer durationMinutes = 60;

    @Column(name = "LOCATION", length = 200)
    private String location;

    @Column(name = "MEETING_PROVIDER", length = 50)
    private String meetingProvider;

    @Column(name = "MEETING_ID", length = 100)
    private String meetingId;

    @Column(name = "MEETING_URL", length = 500)
    private String meetingUrl;

    @Column(name = "INTERVIEW_TYPE", length = 50)
    private String interviewType;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false, length = 20)
    @Builder.Default
    private InterviewStatus status = InterviewStatus.INVITED;

    @Column(name = "FEEDBACK", length = 2000)
    private String feedback;

    @Column(name = "RATING")
    private Integer rating;

    public Application getApplication() {
        return application;
    }

    public void setApplication(Application application) {
        this.application = application;
    }

    public User getInterviewer() {
        return interviewer;
    }

    public void setInterviewer(User interviewer) {
        this.interviewer = interviewer;
    }

    public User getCandidate() {
        return candidate;
    }

    public void setCandidate(User candidate) {
        this.candidate = candidate;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public InterviewStatus getStatus() {
        return status;
    }

    public void setStatus(InterviewStatus status) {
        this.status = status;
    }

    public String getMeetingUrl() {
        return meetingUrl;
    }

    public void setMeetingUrl(String meetingUrl) {
        this.meetingUrl = meetingUrl;
    }
}

