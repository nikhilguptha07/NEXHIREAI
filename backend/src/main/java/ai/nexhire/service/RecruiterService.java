package ai.nexhire.service;

import ai.nexhire.dto.RecruiterProfileDto;
import ai.nexhire.entity.RecruiterProfile;
import ai.nexhire.entity.User;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.RecruiterProfileMapper;
import ai.nexhire.repository.RecruiterProfileRepository;
import ai.nexhire.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class RecruiterService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final RecruiterProfileMapper recruiterProfileMapper;

    public RecruiterService(
            RecruiterProfileRepository recruiterProfileRepository,
            UserRepository userRepository,
            RecruiterProfileMapper recruiterProfileMapper) {
        this.recruiterProfileRepository = recruiterProfileRepository;
        this.userRepository = userRepository;
        this.recruiterProfileMapper = recruiterProfileMapper;
    }

    @Transactional(readOnly = true)
    public RecruiterProfileDto getProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyProfile(user));

        return recruiterProfileMapper.toDto(profile);
    }

    @Transactional(readOnly = true)
    public RecruiterProfileDto getProfileById(UUID id) {
        RecruiterProfile profile = recruiterProfileRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "Recruiter profile not found."));
        return recruiterProfileMapper.toDto(profile);
    }

    @Transactional
    public RecruiterProfileDto updateProfile(String email, RecruiterProfileDto dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        RecruiterProfile profile = recruiterProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> createEmptyProfile(user));

        if (dto.getTitle() != null) profile.setTitle(dto.getTitle());
        if (dto.getDepartment() != null) profile.setDepartment(dto.getDepartment());
        if (dto.getPhone() != null) profile.setPhone(dto.getPhone());
        if (dto.getLinkedInUrl() != null) profile.setLinkedInUrl(dto.getLinkedInUrl());

        RecruiterProfile saved = recruiterProfileRepository.save(profile);
        return recruiterProfileMapper.toDto(saved);
    }

    private RecruiterProfile createEmptyProfile(User user) {
        RecruiterProfile profile = RecruiterProfile.builder()
                .user(user)
                .build();
        return recruiterProfileRepository.save(profile);
    }
}
