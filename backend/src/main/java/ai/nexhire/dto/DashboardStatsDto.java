package ai.nexhire.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalJobs;
    private long totalApplications;
    private long totalInterviews;
    private long totalCandidates;
    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> jobsByStatus;

    public long getTotalJobs() { return totalJobs; }
    public void setTotalJobs(long totalJobs) { this.totalJobs = totalJobs; }
    public long getTotalApplications() { return totalApplications; }
    public void setTotalApplications(long totalApplications) { this.totalApplications = totalApplications; }
    public long getTotalInterviews() { return totalInterviews; }
    public void setTotalInterviews(long totalInterviews) { this.totalInterviews = totalInterviews; }
    public long getTotalCandidates() { return totalCandidates; }
    public void setTotalCandidates(long totalCandidates) { this.totalCandidates = totalCandidates; }
    public Map<String, Long> getApplicationsByStatus() { return applicationsByStatus; }
    public void setApplicationsByStatus(Map<String, Long> applicationsByStatus) { this.applicationsByStatus = applicationsByStatus; }
    public Map<String, Long> getJobsByStatus() { return jobsByStatus; }
    public void setJobsByStatus(Map<String, Long> jobsByStatus) { this.jobsByStatus = jobsByStatus; }
}

