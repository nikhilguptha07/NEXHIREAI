package ai.nexhire.service;

import ai.nexhire.dto.ApplicationDto;
import ai.nexhire.dto.SubmitApplicationRequestDto;
import ai.nexhire.entity.Application;
import ai.nexhire.entity.ApplicationStatus;
import ai.nexhire.entity.Job;
import ai.nexhire.entity.User;
import ai.nexhire.entity.UserRole;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.ApplicationMapper;
import ai.nexhire.repository.ApplicationRepository;
import ai.nexhire.repository.JobRepository;
import ai.nexhire.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ApplicationMapper applicationMapper;
    private final NotificationService notificationService;
    private final ATSService atsService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            JobRepository jobRepository,
            UserRepository userRepository,
            ApplicationMapper applicationMapper,
            NotificationService notificationService,
            ATSService atsService) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationMapper = applicationMapper;
        this.notificationService = notificationService;
        this.atsService = atsService;
    }

    private void validateRecruiterJobAuthorization(User recruiter, Job job) {
        boolean isJobOwner = job.getPostedBy() != null && job.getPostedBy().getId().equals(recruiter.getId());
        boolean sameCompany = recruiter.getCompanyName() != null && job.getCompany() != null
                && recruiter.getCompanyName().equalsIgnoreCase(job.getCompany().getName());
        boolean isAdmin = recruiter.getRoles().contains(UserRole.SUPER_ADMIN) || recruiter.getRoles().contains(UserRole.TENANT_ADMIN);

        if (!isJobOwner && !sameCompany && !isAdmin) {
            throw ApiException.forbidden(ErrorCode.AUTHZ_DENIED, "Access denied. Recruiter from another company cannot modify applications for this job.");
        }
    }

    @Transactional
    public ApplicationDto submitApplication(String candidateEmail, SubmitApplicationRequestDto dto) {
        log.info("Candidate {} attempting to apply for Job ID: {}", candidateEmail, dto.getJobId());

        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        if (candidate.getRoles().contains(UserRole.RECRUITER) && !candidate.getRoles().contains(UserRole.CANDIDATE)) {
            throw ApiException.forbidden(ErrorCode.AUTHZ_DENIED, "Recruiters cannot submit job applications.");
        }

        Job job = jobRepository.findById(dto.getJobId())
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Job not found."));

        if (applicationRepository.findByCandidateIdAndJobId(candidate.getId(), job.getId()).isPresent()) {
            throw ApiException.conflict(ErrorCode.RES_CONFLICT, "You have already applied for this job requisition.");
        }

        ATSService.AtsResult ats = atsService.analyzeApplication(job, candidate, dto.getCoverLetter());

        int minScoreThreshold = job.getMinimumScore() != null ? job.getMinimumScore() : 80;
        ApplicationStatus initialStatus = ats.overallScore() >= minScoreThreshold
                ? ApplicationStatus.SHORTLISTED
                : ApplicationStatus.SUBMITTED;

        Application application = Application.builder()
                .job(job)
                .candidate(candidate)
                .status(initialStatus)
                .atsScore(ats.overallScore())
                .aiRecommendation(ats.aiRecommendation())
                .resumeUrl(dto.getResumeUrl())
                .coverLetter(dto.getCoverLetter())
                .build();

        Application saved = applicationRepository.save(application);

        notificationService.createNotification(
                candidate,
                "Application Submitted",
                "Your application for " + job.getTitle() + " was successfully submitted. Initial ATS Score: " + ats.overallScore() + "%.",
                "APPLICATION",
                "/dashboard/applications"
        );

        if (job.getPostedBy() != null) {
            notificationService.createNotification(
                    job.getPostedBy(),
                    "New Application Received",
                    candidate.getFullName() + " applied for " + job.getTitle() + " (ATS Score: " + ats.overallScore() + "%).",
                    "RECRUITMENT",
                    "/dashboard/jobs"
            );
        }

        return applicationMapper.toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getMyApplications(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        return applicationRepository.findByCandidateId(candidate.getId()).stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getJobApplications(UUID jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationDto> getRecruiterApplications(String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        return applicationRepository.findByJobPostedById(recruiter.getId()).stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ApplicationDto getApplicationById(UUID id, String userEmail) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Application not found."));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        boolean isCandidate = application.getCandidate().getId().equals(currentUser.getId());
        boolean isRecruiter = application.getJob().getPostedBy() != null && application.getJob().getPostedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRoles().contains(UserRole.SUPER_ADMIN) || currentUser.getRoles().contains(UserRole.TENANT_ADMIN);

        if (!isCandidate && !isRecruiter && !isAdmin) {
            throw ApiException.forbidden(ErrorCode.AUTHZ_DENIED, "You do not have permission to view this application.");
        }

        return applicationMapper.toDto(application);
    }

    @Transactional
    public ApplicationDto withdrawApplication(UUID id, String candidateEmail) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Application not found."));

        User candidate = userRepository.findByEmail(candidateEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        if (!application.getCandidate().getId().equals(candidate.getId())) {
            throw ApiException.forbidden(ErrorCode.AUTHZ_DENIED, "You can only withdraw your own applications.");
        }

        application.setStatus(ApplicationStatus.WITHDRAWN);
        Application saved = applicationRepository.save(application);

        if (application.getJob().getPostedBy() != null) {
            notificationService.createNotification(
                    application.getJob().getPostedBy(),
                    "Candidate Withdrawn",
                    candidate.getFullName() + " has withdrawn their application for " + application.getJob().getTitle() + ".",
                    "RECRUITMENT",
                    "/dashboard/jobs"
            );
        }

        return applicationMapper.toDto(saved);
    }

    @Transactional
    public ApplicationDto updateStatus(UUID id, ApplicationStatus status, String recruiterEmail) {
        User recruiter = userRepository.findByEmail(recruiterEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Recruiter not found."));

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Application not found."));

        validateRecruiterJobAuthorization(recruiter, application.getJob());

        application.setStatus(status);
        Application saved = applicationRepository.save(application);

        String notificationTitle = "Application Status Update";
        String notificationMsg = "Your application status for " + application.getJob().getTitle() + " has been updated to: " + status.name();

        if (status == ApplicationStatus.SHORTLISTED) {
            notificationTitle = "Application Shortlisted";
            notificationMsg = "Congratulations! Your application for " + application.getJob().getTitle() + " has been shortlisted.";
        } else if (status == ApplicationStatus.SELECTED) {
            notificationTitle = "Selected for Position";
            notificationMsg = "Congratulations! You have been SELECTED for " + application.getJob().getTitle() + ".";
        } else if (status == ApplicationStatus.REJECTED) {
            notificationTitle = "Application Status Update";
            notificationMsg = "Thank you for applying. Unfortunately, your application for " + application.getJob().getTitle() + " was not selected.";
        }

        notificationService.createNotification(
                application.getCandidate(),
                notificationTitle,
                notificationMsg,
                "APPLICATION",
                "/dashboard/applications"
        );

        return applicationMapper.toDto(saved);
    }
}
