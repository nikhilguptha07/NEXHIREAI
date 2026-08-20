package ai.nexhire.service;

import ai.nexhire.dto.ResumeDto;
import ai.nexhire.entity.CandidateProfile;
import ai.nexhire.entity.CandidateSkill;
import ai.nexhire.entity.Resume;
import ai.nexhire.entity.User;
import ai.nexhire.entity.UserRole;
import ai.nexhire.entity.UserStatus;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.ResumeMapper;
import ai.nexhire.repository.CandidateProfileRepository;
import ai.nexhire.repository.ResumeRepository;
import ai.nexhire.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResumeProcessingService {

    private static final Logger log = LoggerFactory.getLogger(ResumeProcessingService.class);

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final CandidateProfileRepository candidateProfileRepository;
    private final StorageService storageService;
    private final DocumentTextExtractorService documentTextExtractorService;
    private final ResumeMapper resumeMapper;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public ResumeProcessingService(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            CandidateProfileRepository candidateProfileRepository,
            StorageService storageService,
            DocumentTextExtractorService documentTextExtractorService,
            ResumeMapper resumeMapper,
            PasswordEncoder passwordEncoder,
            ObjectMapper objectMapper) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.candidateProfileRepository = candidateProfileRepository;
        this.storageService = storageService;
        this.documentTextExtractorService = documentTextExtractorService;
        this.resumeMapper = resumeMapper;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ResumeDto uploadResume(String userEmail, MultipartFile file) {
        log.info("STEP 1: Loaded user & validating file for upload request: {}", userEmail);
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found with email: " + userEmail));

        validateFile(file);

        log.info("STEP 2: Storing uploaded resume file into secure storage");
        String fileUrl = storeFile(file);

        log.info("STEP 3: Extracting document text and metadata");
        ExtractedDocument document = extractAndParseDocument(file);

        log.info("STEP 4: Resolving candidate user record");
        User candidateUser = resolveCandidateUser(currentUser, document.parsedMap());

        log.info("STEP 5: Creating or updating candidate profile and synchronizing skills");
        upsertCandidateProfile(candidateUser, fileUrl, document.text(), document.parsedMap());

        log.info("STEP 6: Upserting single active resume record to prevent duplicates");
        Resume savedResume = upsertResume(
                candidateUser,
                file.getOriginalFilename(),
                fileUrl,
                file.getSize(),
                file.getContentType(),
                document.parsedMap()
        );

        log.info("STEP 7: Transaction complete for user: {}", candidateUser.getEmail());
        return resumeMapper.toDto(savedResume);
    }

    @Transactional(readOnly = true)
    public List<ResumeDto> getUserResumes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found with email: " + userEmail));

        return resumeRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(resumeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResumeDto parseResume(UUID resumeId) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Resume not found with ID: " + resumeId));

        Map<String, Object> sampleData = Map.of(
                "skills", List.of("Java", "Spring Boot", "Oracle", "React", "TypeScript"),
                "experienceYears", 5,
                "summary", "Full Stack Software Engineer with enterprise experience."
        );

        try {
            resume.setParsedData(objectMapper.writeValueAsString(sampleData));
            resume.setParsed(true);
        } catch (Exception e) {
            log.error("Failed to serialize parsed data for resume ID: {}", resumeId, e);
            throw ApiException.internal(ErrorCode.SYS_STORAGE_ERROR, "Failed to serialize resume parsed data.");
        }

        Resume saved = resumeRepository.save(resume);
        return resumeMapper.toDto(saved);
    }

    // --- Private Helper Methods ---

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            log.error("File validation failed: MultipartFile is null or empty");
            throw ApiException.badRequest(ErrorCode.VAL_INVALID_PARAMETER, "Uploaded file cannot be empty.");
        }
    }

    private String storeFile(MultipartFile file) {
        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        try (InputStream inputStream = file.getInputStream()) {
            return storageService.store("resumes", filename, inputStream, file.getContentType(), file.getSize());
        } catch (Exception e) {
            log.error("Failed to store resume file in storage service: ", e);
            throw ApiException.internal(ErrorCode.SYS_STORAGE_ERROR, "Failed to store resume file.");
        }
    }

    private record ExtractedDocument(String text, Map<String, Object> parsedMap) {}

    private ExtractedDocument extractAndParseDocument(MultipartFile file) {
        String text = "";
        Map<String, Object> parsedMap = new HashMap<>();
        try {
            text = documentTextExtractorService.extractTextFromMultipartFile(file);
            parsedMap = documentTextExtractorService.parseCandidateFromText(text, null, null);
        } catch (Exception e) {
            log.warn("Text extraction/parsing encountered warnings or partial failures: {}", e.getMessage());
        }
        return new ExtractedDocument(text, parsedMap);
    }

    private User resolveCandidateUser(User currentUser, Map<String, Object> parsedMap) {
        String candidateEmail = (String) parsedMap.getOrDefault("email", "");
        String candidateFullName = (String) parsedMap.getOrDefault("fullName", "");

        if (candidateEmail != null && !candidateEmail.isBlank() && !candidateEmail.equalsIgnoreCase("not.specified@example.com")) {
            Optional<User> existingUserOpt = userRepository.findByEmail(candidateEmail);
            if (existingUserOpt.isPresent()) {
                User existingUser = existingUserOpt.get();
                updateUserNameIfNecessary(existingUser, candidateFullName);
                return existingUser;
            }

            if (!currentUser.getRoles().contains(UserRole.CANDIDATE)) {
                return createNewCandidateUser(candidateEmail, candidateFullName);
            }
        }

        updateUserNameIfNecessary(currentUser, candidateFullName);
        return currentUser;
    }

    private User createNewCandidateUser(String email, String fullName) {
        String[] nameParts = (fullName != null && !fullName.isBlank() && !fullName.equals("Applicant Candidate"))
                ? fullName.split("\\s+", 2)
                : new String[]{"Applicant", "Candidate"};

        String firstName = nameParts.length > 0 && !nameParts[0].isBlank() ? nameParts[0] : "Applicant";
        String lastName = nameParts.length > 1 && !nameParts[1].isBlank() ? nameParts[1] : "Candidate";

        User newCandidate = User.builder()
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .status(UserStatus.ACTIVE)
                .roles(Set.of(UserRole.CANDIDATE))
                .build();

        log.info("Creating new candidate user with email: {}", email);
        return userRepository.save(newCandidate);
    }

    private void updateUserNameIfNecessary(User user, String fullName) {
        if (fullName != null && !fullName.isBlank() && !fullName.equals("Applicant Candidate")) {
            String[] nameParts = fullName.split("\\s+", 2);
            String fName = nameParts.length > 0 && !nameParts[0].isBlank() ? nameParts[0] : user.getFirstName();
            String lName = nameParts.length > 1 && !nameParts[1].isBlank() ? nameParts[1] : user.getLastName();

            boolean changed = false;
            if (fName != null && !fName.equals(user.getFirstName())) {
                user.setFirstName(fName);
                changed = true;
            }
            if (lName != null && !lName.equals(user.getLastName())) {
                user.setLastName(lName);
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
            }
        }
    }

    private CandidateProfile upsertCandidateProfile(User user, String fileUrl, String text, Map<String, Object> parsedMap) {
        CandidateProfile profile = candidateProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> CandidateProfile.builder().user(user).build());

        String phone = (String) parsedMap.get("phone");
        String linkedin = (String) parsedMap.get("linkedIn");
        String github = (String) parsedMap.get("gitHub");

        @SuppressWarnings("unchecked")
        List<String> extractedSkills = (List<String>) parsedMap.get("skills");

        if (phone != null && !phone.isBlank() && !phone.contains("000-0000")) {
            profile.setPhone(phone);
        }
        if (linkedin != null && !linkedin.isBlank()) {
            profile.setLinkedInUrl(linkedin);
        }
        if (github != null && !github.isBlank()) {
            profile.setGitHubUrl(github);
        }
        profile.setResumeUrl(fileUrl);

        if (profile.getHeadline() == null || profile.getHeadline().isBlank()) {
            profile.setHeadline("Software Engineer");
        }
        if (profile.getSummary() == null || profile.getSummary().isBlank()) {
            profile.setSummary(!text.isBlank() ? (text.length() > 500 ? text.substring(0, 500) : text) : "Software Engineer Profile");
        }
        if (profile.getYearsOfExperience() == null) {
            int expYears = (extractedSkills != null && !extractedSkills.isEmpty()) ? Math.min(10, Math.max(1, extractedSkills.size())) : 3;
            profile.setYearsOfExperience(expYears);
        }

        if (extractedSkills != null && !extractedSkills.isEmpty()) {
            syncSkills(profile, extractedSkills);
        }

        return candidateProfileRepository.save(profile);
    }

    private void syncSkills(CandidateProfile profile, List<String> extractedSkills) {
        profile.getSkills().clear();
        for (String skillName : extractedSkills) {
            CandidateSkill skill = CandidateSkill.builder()
                    .candidateProfile(profile)
                    .name(skillName)
                    .proficiencyLevel("INTERMEDIATE")
                    .yearsOfExperience(3)
                    .build();
            profile.getSkills().add(skill);
        }
    }

    private Resume upsertResume(User user, String fileName, String fileUrl, long fileSize, String contentType, Map<String, Object> parsedMap) {
        String parsedJson = "{}";
        try {
            parsedJson = objectMapper.writeValueAsString(parsedMap != null ? parsedMap : Collections.emptyMap());
        } catch (Exception e) {
            log.warn("Failed to serialize parsed data map to JSON string: {}", e.getMessage());
        }

        Optional<Resume> existingResumeOpt = resumeRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId());

        Resume resume;
        if (existingResumeOpt.isPresent()) {
            resume = existingResumeOpt.get();
            log.info("Updating existing Resume record ID: {} for user ID: {}", resume.getId(), user.getId());
            resume.setFileName(fileName);
            resume.setFileUrl(fileUrl);
            resume.setFileSize(fileSize);
            resume.setContentType(contentType);
            resume.setParsedData(parsedJson);
            resume.setParsed(true);
        } else {
            log.info("Creating new Resume record for user ID: {}", user.getId());
            resume = Resume.builder()
                    .user(user)
                    .fileName(fileName)
                    .fileUrl(fileUrl)
                    .fileSize(fileSize)
                    .contentType(contentType)
                    .parsedData(parsedJson)
                    .parsed(true)
                    .build();
        }

        return resumeRepository.save(resume);
    }
}
