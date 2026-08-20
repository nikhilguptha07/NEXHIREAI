package ai.nexhire.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CANDIDATE_PROFILES")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false, unique = true)
    private User user;

    @Column(name = "HEADLINE", length = 200)
    private String headline;

    @Column(name = "SUMMARY", length = 2000)
    private String summary;

    @Column(name = "PHONE", length = 30)
    private String phone;

    @Column(name = "LOCATION", length = 150)
    private String location;

    @Column(name = "YEARS_OF_EXPERIENCE")
    private Integer yearsOfExperience;

    @Column(name = "EXPECTED_SALARY", precision = 12, scale = 2)
    private BigDecimal expectedSalary;

    @Column(name = "NOTICE_PERIOD_DAYS")
    private Integer noticePeriodDays;

    @Column(name = "LINKEDIN_URL", length = 500)
    private String linkedInUrl;

    @Column(name = "GITHUB_URL", length = 500)
    private String gitHubUrl;

    @Column(name = "PORTFOLIO_URL", length = 500)
    private String portfolioUrl;

    @Column(name = "RESUME_URL", length = 500)
    private String resumeUrl;

    @Column(name = "CURRENT_COMPANY", length = 150)
    private String currentCompany;

    @Column(name = "CURRENT_JOB_TITLE", length = 150)
    private String currentJobTitle;

    @Column(name = "EMPLOYMENT_STATUS", length = 50)
    @Builder.Default
    private String employmentStatus = "UNEMPLOYED";

    @Column(name = "IS_AVAILABLE", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "JOB_SEEKING_STATUS", length = 50)
    @Builder.Default
    private String jobSeekingStatus = "ACTIVELY_LOOKING";

    @Column(name = "HIRED_DATE")
    private java.time.Instant hiredDate;

    @Column(name = "CURRENT_EMPLOYER_ID", length = 36)
    private String currentEmployerId;


    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CandidateSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<WorkExperience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "candidateProfile", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Education> educations = new ArrayList<>();

    public String getCurrentCompany() {
        return currentCompany;
    }

    public void setCurrentCompany(String currentCompany) {
        this.currentCompany = currentCompany;
    }

    public String getCurrentJobTitle() {
        return currentJobTitle;
    }

    public void setCurrentJobTitle(String currentJobTitle) {
        this.currentJobTitle = currentJobTitle;
    }

    public String getEmploymentStatus() {
        return employmentStatus;
    }

    public void setEmploymentStatus(String employmentStatus) {
        this.employmentStatus = employmentStatus;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }

    public String getJobSeekingStatus() {
        return jobSeekingStatus;
    }

    public void setJobSeekingStatus(String jobSeekingStatus) {
        this.jobSeekingStatus = jobSeekingStatus;
    }

    public java.time.Instant getHiredDate() {
        return hiredDate;
    }

    public void setHiredDate(java.time.Instant hiredDate) {
        this.hiredDate = hiredDate;
    }

    public String getCurrentEmployerId() {
        return currentEmployerId;
    }

    public void setCurrentEmployerId(String currentEmployerId) {
        this.currentEmployerId = currentEmployerId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public BigDecimal getExpectedSalary() { return expectedSalary; }
    public void setExpectedSalary(BigDecimal expectedSalary) { this.expectedSalary = expectedSalary; }
    public Integer getNoticePeriodDays() { return noticePeriodDays; }
    public void setNoticePeriodDays(Integer noticePeriodDays) { this.noticePeriodDays = noticePeriodDays; }
    public String getLinkedInUrl() { return linkedInUrl; }
    public void setLinkedInUrl(String linkedInUrl) { this.linkedInUrl = linkedInUrl; }
    public String getGitHubUrl() { return gitHubUrl; }
    public void setGitHubUrl(String gitHubUrl) { this.gitHubUrl = gitHubUrl; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public List<CandidateSkill> getSkills() { return skills; }
    public void setSkills(List<CandidateSkill> skills) { this.skills = skills; }
    public List<WorkExperience> getExperiences() { return experiences; }
    public void setExperiences(List<WorkExperience> experiences) { this.experiences = experiences; }
    public List<Education> getEducations() { return educations; }
    public void setEducations(List<Education> educations) { this.educations = educations; }
}


