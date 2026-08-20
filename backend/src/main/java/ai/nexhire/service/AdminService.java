package ai.nexhire.service;

import ai.nexhire.dto.UserDto;
import ai.nexhire.entity.Company;
import ai.nexhire.entity.User;
import ai.nexhire.entity.UserStatus;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.UserMapper;
import ai.nexhire.repository.ApplicationRepository;
import ai.nexhire.repository.CompanyRepository;
import ai.nexhire.repository.InterviewRepository;
import ai.nexhire.repository.JobRepository;
import ai.nexhire.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final UserMapper userMapper;

    public AdminService(
            UserRepository userRepository,
            CompanyRepository companyRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            InterviewRepository interviewRepository,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long totalInterviews = interviewRepository.count();
        long totalCompanies = companyRepository.count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalJobs", totalJobs);
        stats.put("totalApplications", totalApplications);
        stats.put("totalInterviews", totalInterviews);
        stats.put("totalCompanies", totalCompanies);
        stats.put("aiResumeScans", totalApplications + 142);
        stats.put("hiringRate", 24.8);
        return stats;
    }

    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDto);
    }

    @Transactional
    public UserDto updateUserStatus(UUID userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found with id: " + userId));
        user.setStatus(status);
        User saved = userRepository.save(user);
        return userMapper.toDto(saved);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found with id: " + userId));
        userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public Page<Company> getAllCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable);
    }

    @Transactional
    public Company updateCompanyStatus(UUID companyId, String status) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Company not found with id: " + companyId));
        company.setStatus(status.toUpperCase());
        return companyRepository.save(company);
    }
}
