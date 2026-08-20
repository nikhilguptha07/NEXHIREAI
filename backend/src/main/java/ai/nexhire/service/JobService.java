package ai.nexhire.service;

import ai.nexhire.dto.CreateJobRequestDto;
import ai.nexhire.dto.JobDto;
import ai.nexhire.dto.PageResponseDto;
import ai.nexhire.entity.Company;
import ai.nexhire.entity.Job;
import ai.nexhire.entity.JobSkill;
import ai.nexhire.entity.JobStatus;
import ai.nexhire.entity.User;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.JobMapper;
import ai.nexhire.repository.CompanyRepository;
import ai.nexhire.repository.JobRepository;
import ai.nexhire.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobMapper jobMapper;

    public JobService(
            JobRepository jobRepository,
            CompanyRepository companyRepository,
            UserRepository userRepository,
            JobMapper jobMapper) {
        this.jobRepository = jobRepository;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.jobMapper = jobMapper;
    }

    @Transactional(readOnly = true)
    public PageResponseDto<JobDto> getPublishedJobs(Pageable pageable) {
        Page<Job> page = jobRepository.findByStatus(JobStatus.PUBLISHED, pageable);
        List<JobDto> mapped = page.getContent().stream().map(jobMapper::toDto).collect(Collectors.toList());
        return PageResponseDto.from(page, mapped);
    }

    @Transactional(readOnly = true)
    public JobDto getJobById(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Job not found with id: " + id));
        return jobMapper.toDto(job);
    }

    @Transactional
    public JobDto createJob(String userEmail, CreateJobRequestDto dto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        Company company = null;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Company not found."));
        } else if (user.getCompanyName() != null && !user.getCompanyName().isBlank()) {
            company = companyRepository.findByName(user.getCompanyName()).orElseGet(() ->
                    companyRepository.save(Company.builder().name(user.getCompanyName()).build())
            );
        }

        Job job = Job.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .department(dto.getDepartment())
                .location(dto.getLocation())
                .jobType(dto.getJobType())
                .experienceLevel(dto.getExperienceLevel())
                .minSalary(dto.getMinSalary())
                .maxSalary(dto.getMaxSalary())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "USD")
                .minimumScore(dto.getMinimumScore() != null ? dto.getMinimumScore() : 80)
                .status(JobStatus.PUBLISHED)
                .company(company)
                .postedBy(user)
                .requiredSkills(new ArrayList<>())
                .build();

        if (dto.getRequiredSkills() != null) {
            for (var skillDto : dto.getRequiredSkills()) {
                JobSkill skill = JobSkill.builder()
                        .job(job)
                        .skillName(skillDto.getSkillName())
                        .importance(skillDto.getImportance())
                        .build();
                job.getRequiredSkills().add(skill);
            }
        } else if (dto.getSkills() != null) {
            for (String skillName : dto.getSkills()) {
                if (skillName != null && !skillName.isBlank()) {
                    JobSkill skill = JobSkill.builder()
                            .job(job)
                            .skillName(skillName.trim())
                            .importance("REQUIRED")
                            .build();
                    job.getRequiredSkills().add(skill);
                }
            }
        }

        Job saved = jobRepository.save(job);
        return jobMapper.toDto(saved);
    }

    @Transactional
    public JobDto updateJob(UUID id, CreateJobRequestDto dto) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Job not found with id: " + id));

        if (dto.getTitle() != null) job.setTitle(dto.getTitle());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getDepartment() != null) job.setDepartment(dto.getDepartment());
        if (dto.getLocation() != null) job.setLocation(dto.getLocation());
        if (dto.getJobType() != null) job.setJobType(dto.getJobType());
        if (dto.getExperienceLevel() != null) job.setExperienceLevel(dto.getExperienceLevel());
        if (dto.getMinSalary() != null) job.setMinSalary(dto.getMinSalary());
        if (dto.getMaxSalary() != null) job.setMaxSalary(dto.getMaxSalary());
        if (dto.getCurrency() != null) job.setCurrency(dto.getCurrency());
        if (dto.getMinimumScore() != null) job.setMinimumScore(dto.getMinimumScore());

        if (dto.getRequiredSkills() != null) {
            job.getRequiredSkills().clear();
            for (var skillDto : dto.getRequiredSkills()) {
                JobSkill skill = JobSkill.builder()
                        .job(job)
                        .skillName(skillDto.getSkillName())
                        .importance(skillDto.getImportance())
                        .build();
                job.getRequiredSkills().add(skill);
            }
        } else if (dto.getSkills() != null) {
            job.getRequiredSkills().clear();
            for (String skillName : dto.getSkills()) {
                if (skillName != null && !skillName.isBlank()) {
                    JobSkill skill = JobSkill.builder()
                            .job(job)
                            .skillName(skillName.trim())
                            .importance("REQUIRED")
                            .build();
                    job.getRequiredSkills().add(skill);
                }
            }
        }

        Job saved = jobRepository.save(job);
        return jobMapper.toDto(saved);
    }

    @Transactional
    public JobDto updateJobStatus(UUID id, JobStatus status) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Job not found."));
        job.setStatus(status);
        Job saved = jobRepository.save(job);
        return jobMapper.toDto(saved);
    }

    @Transactional
    public void deleteJob(UUID id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Job not found with id: " + id));
        jobRepository.delete(job);
    }
}
