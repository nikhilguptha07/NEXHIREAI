package ai.nexhire.service;

import ai.nexhire.dto.InterviewDto;
import ai.nexhire.dto.InterviewFeedbackDto;
import ai.nexhire.dto.RespondInterviewRequestDto;
import ai.nexhire.dto.ScheduleInterviewRequestDto;
import ai.nexhire.entity.Application;
import ai.nexhire.entity.ApplicationStatus;
import ai.nexhire.entity.Interview;
import ai.nexhire.entity.InterviewStatus;
import ai.nexhire.entity.User;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.InterviewMapper;
import ai.nexhire.repository.ApplicationRepository;
import ai.nexhire.repository.InterviewRepository;
import ai.nexhire.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final InterviewMapper interviewMapper;
    private final NotificationService notificationService;

    public InterviewService(
            InterviewRepository interviewRepository,
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            InterviewMapper interviewMapper,
            NotificationService notificationService) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.interviewMapper = interviewMapper;
        this.notificationService = notificationService;
    }

    @Transactional
    public InterviewDto scheduleInterview(String userEmail, ScheduleInterviewRequestDto dto) {
        Application application = applicationRepository.findById(dto.getApplicationId())
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Application not found."));

        User interviewer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        String provider = dto.getMeetingProvider() != null ? dto.getMeetingProvider() : "Google Meet";
        String meetingId = "nex-" + UUID.randomUUID().toString().substring(0, 8);
        String meetingUrl = dto.getMeetingUrl();
        if (meetingUrl == null || meetingUrl.isBlank()) {
            if ("Zoom".equalsIgnoreCase(provider)) {
                meetingUrl = "https://zoom.us/j/" + (1000000000L + (long) (Math.random() * 8999999999L));
            } else if ("Microsoft Teams".equalsIgnoreCase(provider)) {
                meetingUrl = "https://teams.microsoft.com/l/meetup-join/" + meetingId;
            } else {
                meetingUrl = "https://meet.google.com/" + meetingId;
            }
        }

        Interview interview = Interview.builder()
                .application(application)
                .interviewer(interviewer)
                .candidate(application.getCandidate())
                .scheduledAt(dto.getScheduledAt())
                .durationMinutes(dto.getDurationMinutes() != null ? dto.getDurationMinutes() : 60)
                .location(dto.getLocation())
                .meetingProvider(provider)
                .meetingId(meetingId)
                .meetingUrl(meetingUrl)
                .interviewType(dto.getInterviewType() != null ? dto.getInterviewType() : "VIDEO")
                .status(InterviewStatus.INVITED)
                .build();

        Interview saved = interviewRepository.save(interview);

        // Update Application status
        application.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);
        applicationRepository.save(application);

        // Notify candidate
        notificationService.createNotification(
                application.getCandidate(),
                "Interview Invitation: " + application.getJob().getTitle(),
                "You have been invited for an interview on " + dto.getScheduledAt() + " via " + provider + ". Join URL: " + meetingUrl,
                "INTERVIEW",
                "/dashboard/interviews"
        );

        return interviewMapper.toDto(saved);
    }

    @Transactional
    public InterviewDto respondToInterview(String candidateEmail, UUID interviewId, RespondInterviewRequestDto dto) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Interview not found."));

        String res = dto.getResponse() != null ? dto.getResponse().trim().toUpperCase() : "";
        boolean isAccept = res.contains("ACCEPT") || res.contains("CONFIRM") || res.contains("YES");
        interview.setStatus(isAccept ? InterviewStatus.ACCEPTED : InterviewStatus.DECLINED);
        if (dto.getNotes() != null) {
            interview.setFeedback((interview.getFeedback() != null ? interview.getFeedback() + "\n" : "") + "Candidate: " + dto.getNotes());
        }
        Interview saved = interviewRepository.save(interview);

        // Notify interviewer/recruiter
        if (interview.getInterviewer() != null) {
            notificationService.createNotification(
                    interview.getInterviewer(),
                    "Interview Response: " + (isAccept ? "Accepted" : "Declined"),
                    interview.getCandidate().getFullName() + " has " + (isAccept ? "accepted" : "declined") + " the interview invitation for " + interview.getApplication().getJob().getTitle() + ".",
                    "INTERVIEW",
                    "/dashboard/interviews"
            );
        }

        return interviewMapper.toDto(saved);
    }

    @Transactional
    public InterviewDto recordFeedback(String recruiterEmail, UUID interviewId, InterviewFeedbackDto dto) {
        Interview interview = interviewRepository.findById(interviewId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Interview not found."));

        interview.setStatus(InterviewStatus.COMPLETED);
        if (dto.getFeedback() != null) interview.setFeedback(dto.getFeedback());
        if (dto.getRating() != null) interview.setRating(dto.getRating());
        Interview saved = interviewRepository.save(interview);

        Application application = interview.getApplication();
        if ("SELECTED".equalsIgnoreCase(dto.getDecision()) || "SELECT".equalsIgnoreCase(dto.getDecision())) {
            application.setStatus(ApplicationStatus.SELECTED);
        } else if ("REJECTED".equalsIgnoreCase(dto.getDecision()) || "REJECT".equalsIgnoreCase(dto.getDecision())) {
            application.setStatus(ApplicationStatus.REJECTED);
        } else {
            application.setStatus(ApplicationStatus.INTERVIEW_COMPLETED);
        }
        applicationRepository.save(application);

        notificationService.createNotification(
                application.getCandidate(),
                "Interview Feedback Recorded",
                "Your interview process for " + application.getJob().getTitle() + " is complete. Application Status: " + application.getStatus().name(),
                "INTERVIEW",
                "/dashboard/applications"
        );

        return interviewMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getInterviewsByApplication(UUID applicationId) {
        return interviewRepository.findByApplicationId(applicationId).stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> getMyInterviews(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        return interviewRepository.findByInterviewerId(user.getId()).stream()
                .map(interviewMapper::toDto)
                .collect(Collectors.toList());
    }
}
