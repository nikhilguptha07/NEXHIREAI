package ai.nexhire.service;

import ai.nexhire.dto.DashboardStatsDto;
import ai.nexhire.entity.ApplicationStatus;
import ai.nexhire.entity.JobStatus;
import ai.nexhire.repository.ApplicationRepository;
import ai.nexhire.repository.InterviewRepository;
import ai.nexhire.repository.JobRepository;
import ai.nexhire.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;

    public DashboardService(
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            InterviewRepository interviewRepository,
            UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long totalInterviews = interviewRepository.count();
        long totalCandidates = userRepository.count();

        Map<String, Long> applicationsByStatus = new HashMap<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            applicationsByStatus.put(status.name(), 0L);
        }

        Map<String, Long> jobsByStatus = new HashMap<>();
        for (JobStatus status : JobStatus.values()) {
            jobsByStatus.put(status.name(), 0L);
        }

        return DashboardStatsDto.builder()
                .totalJobs(totalJobs)
                .totalApplications(totalApplications)
                .totalInterviews(totalInterviews)
                .totalCandidates(totalCandidates)
                .applicationsByStatus(applicationsByStatus)
                .jobsByStatus(jobsByStatus)
                .build();
    }
}
