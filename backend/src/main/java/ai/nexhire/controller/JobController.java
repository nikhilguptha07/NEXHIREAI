package ai.nexhire.controller;

import ai.nexhire.dto.ApplicationDto;
import ai.nexhire.dto.CreateJobRequestDto;
import ai.nexhire.dto.JobDto;
import ai.nexhire.dto.PageResponseDto;
import ai.nexhire.dto.ResumeDto;
import ai.nexhire.dto.SubmitApplicationRequestDto;
import ai.nexhire.entity.JobStatus;
import ai.nexhire.service.ApplicationService;
import ai.nexhire.service.JobService;
import ai.nexhire.service.ResumeProcessingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/jobs")
public class JobController {

    private final JobService jobService;
    private final ApplicationService applicationService;
    private final ResumeProcessingService resumeProcessingService;

    public JobController(
            JobService jobService,
            ApplicationService applicationService,
            ResumeProcessingService resumeProcessingService) {
        this.jobService = jobService;
        this.applicationService = applicationService;
        this.resumeProcessingService = resumeProcessingService;
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<JobDto>> getPublishedJobs(@PageableDefault(size = 20) Pageable pageable) {
        PageResponseDto<JobDto> jobs = jobService.getPublishedJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/candidate/jobs")
    public ResponseEntity<PageResponseDto<JobDto>> getCandidateJobs(@PageableDefault(size = 20) Pageable pageable) {
        PageResponseDto<JobDto> jobs = jobService.getPublishedJobs(pageable);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobById(@PathVariable UUID id) {
        JobDto job = jobService.getJobById(id);
        return ResponseEntity.ok(job);
    }

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobDto> createJob(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateJobRequestDto dto) {
        JobDto job = jobService.createJob(userDetails.getUsername(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(job);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobDto> updateJob(
            @PathVariable UUID id,
            @Valid @RequestBody CreateJobRequestDto dto) {
        JobDto job = jobService.updateJob(id, dto);
        return ResponseEntity.ok(job);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobDto> updateJobStatus(@PathVariable UUID id, @RequestParam JobStatus status) {
        JobDto job = jobService.updateJobStatus(id, status);
        return ResponseEntity.ok(job);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteJob(@PathVariable UUID id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationDto> applyForJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) SubmitApplicationRequestDto dto) {
        SubmitApplicationRequestDto reqDto = dto != null ? dto : new SubmitApplicationRequestDto();
        reqDto.setJobId(id);
        ApplicationDto application = applicationService.submitApplication(userDetails.getUsername(), reqDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(application);
    }

    @PostMapping(value = "/{id}/apply/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApplicationDto> applyForJobMultipart(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "resume", required = false) MultipartFile resumeFile,
            @RequestParam(value = "file", required = false) MultipartFile altFile,
            @RequestParam(value = "coverLetter", required = false) String coverLetter) {
        MultipartFile file = resumeFile != null ? resumeFile : altFile;
        SubmitApplicationRequestDto reqDto = new SubmitApplicationRequestDto();
        reqDto.setJobId(id);
        reqDto.setCoverLetter(coverLetter);

        if (file != null && !file.isEmpty()) {
            ResumeDto uploaded = resumeProcessingService.uploadResume(userDetails.getUsername(), file);
            reqDto.setResumeUrl(uploaded.getFileUrl());
        }

        ApplicationDto application = applicationService.submitApplication(userDetails.getUsername(), reqDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(application);
    }

    @GetMapping("/{id}/applications")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'RECRUITER', 'HIRING_MANAGER')")
    public ResponseEntity<List<ApplicationDto>> getJobApplications(@PathVariable UUID id) {
        List<ApplicationDto> applications = applicationService.getJobApplications(id);
        return ResponseEntity.ok(applications);
    }
}
