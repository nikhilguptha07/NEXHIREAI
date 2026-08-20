package ai.nexhire.service;

import ai.nexhire.dto.CandidateProfileDto;
import ai.nexhire.dto.CreateCandidateRequest;
import ai.nexhire.entity.CandidateProfile;
import ai.nexhire.entity.CandidateSkill;
import ai.nexhire.entity.User;
import ai.nexhire.entity.UserRole;
import ai.nexhire.entity.UserStatus;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.CandidateProfileMapper;
import ai.nexhire.repository.CandidateProfileRepository;
import ai.nexhire.repository.UserRepository;
import ai.nexhire.security.Argon2PasswordEncoderWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class CandidateService {

    private static final Logger log = LoggerFactory.getLogger(CandidateService.class);

    private final CandidateProfileRepository candidateProfileRepository;
    private final UserRepository userRepository;
    private final CandidateProfileMapper candidateProfileMapper;
    private final Argon2PasswordEncoderWrapper passwordEncoder;

    public CandidateService(
            CandidateProfileRepository candidateProfileRepository,
            UserRepository userRepository,
            CandidateProfileMapper candidateProfileMapper,
            Argon2PasswordEncoderWrapper passwordEncoder) {
        this.candidateProfileRepository = candidateProfileRepository;
        this.userRepository = userRepository;
        this.candidateProfileMapper = candidateProfileMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public CandidateProfileDto getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyProfile(user));

        return candidateProfileMapper.toDto(profile);
    }

    @Transactional(readOnly = true)
    public CandidateProfileDto getProfileById(UUID id) {
        CandidateProfile profile = candidateProfileRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Candidate profile not found."));
        return candidateProfileMapper.toDto(profile);
    }

    @Transactional(readOnly = true)
    public List<CandidateProfileDto> getAllCandidates() {
        return candidateProfileRepository.findAll().stream()
                .map(candidateProfileMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CandidateProfileDto> getCandidateRankings() {
        return candidateProfileRepository.findAll().stream()
                .map(candidateProfileMapper::toDto)
                .sorted(Comparator.comparingInt((CandidateProfileDto c) ->
                        c.getYearsOfExperience() != null ? c.getYearsOfExperience() : 0).reversed())
                .toList();
    }

    @Transactional
    public CandidateProfileDto createCandidateProfile(String userEmail, CreateCandidateRequest request) {
        User user = null;
        if (request != null && request.getEmail() != null && !request.getEmail().isBlank()) {
            user = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (user == null) {
                String reqName = request.getName() != null ? request.getName() : "Candidate";
                String[] nameParts = reqName.split("\\s+", 2);
                String fName = nameParts.length > 0 && !nameParts[0].isBlank() ? nameParts[0] : "Applicant";
                String lName = nameParts.length > 1 && !nameParts[1].isBlank() ? nameParts[1] : "Candidate";

                user = User.builder()
                        .email(request.getEmail())
                        .firstName(fName)
                        .lastName(lName)
                        .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .status(UserStatus.ACTIVE)
                        .roles(Set.of(UserRole.CANDIDATE))
                        .build();
                user = userRepository.save(user);
            }
        }
        if (user == null && userEmail != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "No user available to associate candidate profile."));
        }
        final User targetUser = user;
        log.info("STEP 5 - Target candidate user resolved: {}", targetUser.getEmail());

        CandidateProfile profile = candidateProfileRepository.findByUserId(targetUser.getId())
                .orElseGet(() -> CandidateProfile.builder().user(targetUser).build());

        log.info("STEP 6 - CandidateProfile entity resolved");
        if (request != null) {
            if (request.getRole() != null) profile.setHeadline(request.getRole());
            if (request.getPhone() != null) profile.setPhone(request.getPhone());
            if (request.getLocation() != null) profile.setLocation(request.getLocation());
            if (profile.getYearsOfExperience() == null) profile.setYearsOfExperience(3);

            if (request.getSkills() != null && !request.getSkills().isEmpty()) {
                profile.getSkills().clear();
                for (String skillName : request.getSkills()) {
                    CandidateSkill skill = CandidateSkill.builder()
                            .candidateProfile(profile)
                            .name(skillName)
                            .proficiencyLevel("INTERMEDIATE")
                            .yearsOfExperience(3)
                            .build();
                    profile.getSkills().add(skill);
                }
            }
        }

        log.info("STEP 7 - CandidateProfile saved");
        CandidateProfile saved = candidateProfileRepository.save(profile);
        log.info("STEP 8 - Transaction committed");
        return candidateProfileMapper.toDto(saved);
    }

    @Transactional
    public CandidateProfileDto updateProfile(String email, CandidateProfileDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyProfile(user));

        if (dto.getHeadline() != null) profile.setHeadline(dto.getHeadline());
        else if (dto.getRole() != null) profile.setHeadline(dto.getRole());

        if (dto.getSummary() != null) profile.setSummary(dto.getSummary());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getLocation() != null) profile.setLocation(dto.getLocation());
        if (dto.getYearsOfExperience() != null) profile.setYearsOfExperience(dto.getYearsOfExperience());
        if (dto.getExpectedSalary() != null) profile.setExpectedSalary(dto.getExpectedSalary());
        if (dto.getNoticePeriodDays() != null) profile.setNoticePeriodDays(dto.getNoticePeriodDays());
        if (dto.getLinkedInUrl() != null) profile.setLinkedInUrl(dto.getLinkedInUrl());
        if (dto.getGitHubUrl() != null) profile.setGitHubUrl(dto.getGitHubUrl());
        if (dto.getPortfolioUrl() != null) profile.setPortfolioUrl(dto.getPortfolioUrl());
        if (dto.getResumeUrl() != null) profile.setResumeUrl(dto.getResumeUrl());

        CandidateProfile saved = candidateProfileRepository.save(profile);
        return candidateProfileMapper.toDto(saved);
    }

    private CandidateProfile createEmptyProfile(User user) {
        CandidateProfile profile = CandidateProfile.builder()
                .user(user)
                .build();
        return candidateProfileRepository.save(profile);
    }
}
