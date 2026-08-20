package ai.nexhire.service;

import ai.nexhire.dto.UserDto;
import ai.nexhire.entity.User;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.UserMapper;
import ai.nexhire.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found with id: " + id));
        return userMapper.toDto(user);
    }

    @Transactional(readOnly = true)
    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found with email: " + email));
        return userMapper.toDto(user);
    }

    @Transactional
    public UserDto updateUserProfile(String email, UserDto updateDto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        if (updateDto.getFirstName() != null) user.setFirstName(updateDto.getFirstName());
        if (updateDto.getLastName() != null) user.setLastName(updateDto.getLastName());
        if (updateDto.getAvatarUrl() != null) user.setAvatarUrl(updateDto.getAvatarUrl());
        if (updateDto.getLocale() != null) user.setLocale(updateDto.getLocale());
        if (updateDto.getTimezone() != null) user.setTimezone(updateDto.getTimezone());
        if (updateDto.getCompanyName() != null) user.setCompanyName(updateDto.getCompanyName());

        user.setUpdatedAt(java.time.Instant.now());

        User savedUser = userRepository.saveAndFlush(user);
        return userMapper.toDto(savedUser);
    }
}
