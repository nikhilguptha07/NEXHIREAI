package ai.nexhire.controller;

import ai.nexhire.dto.ApplicationDto;
import ai.nexhire.dto.InterviewDto;
import ai.nexhire.dto.ScheduleInterviewRequestDto;
import ai.nexhire.dto.SubmitApplicationRequestDto;
import ai.nexhire.dto.UpdateApplicationStatusDto;
import ai.nexhire.entity.ApplicationStatus;
import ai.nexhire.service.ApplicationService;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final InterviewService interviewService;

    public ApplicationController(ApplicationService applicationService, InterviewService interviewService) {
        this.applicationService = applicationService;
        this.interviewService = interviewService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationDto> submitApplication(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SubmitApplicationRequestDto dto) {
        ApplicationDto application = applicationService.submitApplication(userDetails.getUsername(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(application);
    }

    @GetMapping({"/me", "/my"})
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<List<ApplicationDto>> getMyApplications(@AuthenticationPrincipal UserDetails userDetails) {
        List<ApplicationDto> applications = applicationService.getMyApplications(userDetails.getUsername());
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApplicationDto> getApplicationById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ApplicationDto application = applicationService.getApplicationById(id, userDetails.getUsername());
        return ResponseEntity.ok(application);
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER', 'HIRING_MANAGER')")
    public ResponseEntity<List<ApplicationDto>> getJobApplications(@PathVariable UUID jobId) {
        List<ApplicationDto> applications = applicationService.getJobApplications(jobId);
        return ResponseEntity.ok(applications);
    }

    @GetMapping({"/recruiter", "/recruiter/applications"})
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER', 'HIRING_MANAGER')")
    public ResponseEntity<List<ApplicationDto>> getRecruiterApplications(@AuthenticationPrincipal UserDetails userDetails) {
        List<ApplicationDto> applications = applicationService.getRecruiterApplications(userDetails.getUsername());
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationDto> withdrawApplication(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ApplicationDto withdrawn = applicationService.withdrawApplication(id, userDetails.getUsername());
        return ResponseEntity.ok(withdrawn);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER', 'HIRING_MANAGER')")
    public ResponseEntity<ApplicationDto> updateStatusPut(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateApplicationStatusDto dto) {
        ApplicationStatus status = ApplicationStatus.valueOf(dto.getStatus().toUpperCase());
        ApplicationDto updated = applicationService.updateStatus(id, status, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER', 'HIRING_MANAGER')")
    public ResponseEntity<ApplicationDto> updateStatusPatch(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateApplicationStatusDto dto) {
        ApplicationStatus status = ApplicationStatus.valueOf(dto.getStatus().toUpperCase());
        ApplicationDto updated = applicationService.updateStatus(id, status, userDetails.getUsername());
        return ResponseEntity.ok(updated);
    }

    @PostMapping({"/{id}/invite", "/{id}/schedule-interview"})
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<InterviewDto> inviteToInterview(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) ScheduleInterviewRequestDto dto) {
        ScheduleInterviewRequestDto reqDto = dto != null ? dto : new ScheduleInterviewRequestDto();
        reqDto.setApplicationId(id);
        if (reqDto.getScheduledAt() == null) {
            reqDto.setScheduledAt(java.time.Instant.now().plus(1, java.time.temporal.ChronoUnit.DAYS));
        }
        InterviewDto interview = interviewService.scheduleInterview(userDetails.getUsername(), reqDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(interview);
    }
}
