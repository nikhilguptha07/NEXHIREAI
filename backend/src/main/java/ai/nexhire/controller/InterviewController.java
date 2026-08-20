package ai.nexhire.controller;

import ai.nexhire.dto.InterviewDto;
import ai.nexhire.dto.InterviewFeedbackDto;
import ai.nexhire.dto.RespondInterviewRequestDto;
import ai.nexhire.dto.ScheduleInterviewRequestDto;
import ai.nexhire.service.InterviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/interviews")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @PostMapping("/invite")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<InterviewDto> scheduleInterview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ScheduleInterviewRequestDto dto) {
        InterviewDto interview = interviewService.scheduleInterview(userDetails.getUsername(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(interview);
    }

    @PatchMapping("/{id}/respond")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<InterviewDto> respondToInterview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody RespondInterviewRequestDto dto) {
        InterviewDto interview = interviewService.respondToInterview(userDetails.getUsername(), id, dto);
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<InterviewDto> recordFeedback(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @Valid @RequestBody InterviewFeedbackDto dto) {
        InterviewDto interview = interviewService.recordFeedback(userDetails.getUsername(), id, dto);
        return ResponseEntity.ok(interview);
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<InterviewDto>> getInterviewsByApplication(@PathVariable UUID applicationId) {
        List<InterviewDto> interviews = interviewService.getInterviewsByApplication(applicationId);
        return ResponseEntity.ok(interviews);
    }

    @GetMapping("/me")
    public ResponseEntity<List<InterviewDto>> getMyInterviews(@AuthenticationPrincipal UserDetails userDetails) {
        List<InterviewDto> interviews = interviewService.getMyInterviews(userDetails.getUsername());
        return ResponseEntity.ok(interviews);
    }
}
