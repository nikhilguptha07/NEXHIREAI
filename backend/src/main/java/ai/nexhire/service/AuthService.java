package ai.nexhire.service;

import ai.nexhire.dto.AuthTokensDto;
import ai.nexhire.dto.ForgotPasswordRequestDto;
import ai.nexhire.dto.LoginRequestDto;
import ai.nexhire.dto.LoginResponseDto;
import ai.nexhire.dto.MessageResponseDto;
import ai.nexhire.dto.RefreshTokenRequestDto;
import ai.nexhire.dto.RegisterRequestDto;
import ai.nexhire.dto.ResetPasswordRequestDto;
import ai.nexhire.dto.UserDto;
import ai.nexhire.entity.PasswordResetToken;
import ai.nexhire.entity.User;
import ai.nexhire.entity.UserRole;
import ai.nexhire.entity.UserStatus;
import ai.nexhire.exception.ApiException;
import ai.nexhire.exception.ErrorCode;
import ai.nexhire.mapper.UserMapper;
import ai.nexhire.repository.PasswordResetTokenRepository;
import ai.nexhire.repository.UserRepository;
import ai.nexhire.security.Argon2PasswordEncoderWrapper;
import ai.nexhire.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final Argon2PasswordEncoderWrapper passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RedisService redisService;
    private final UserMapper userMapper;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public AuthService(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            Argon2PasswordEncoderWrapper passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            RedisService redisService,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.redisService = redisService;
        this.userMapper = userMapper;
    }

    @Transactional
    public LoginResponseDto register(RegisterRequestDto request) {
        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict(ErrorCode.RES_CONFLICT, "User with email already exists");
        }

        Set<UserRole> roles = new HashSet<>();
        if (StringUtils.hasText(request.getCompanyName())) {
            roles.add(UserRole.RECRUITER);
        } else {
            roles.add(UserRole.CANDIDATE);
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .companyName(request.getCompanyName() != null ? request.getCompanyName().trim() : null)
                .status(UserStatus.ACTIVE)
                .roles(roles)
                .locale("en-US")
                .timezone("UTC")
                .build();

        User savedUser = userRepository.save(user);
        log.info("Registered new user with ID: {} role: {}", savedUser.getId(), roles);

        AuthTokensDto tokens = jwtTokenProvider.generateTokens(savedUser.getId(), savedUser.getEmail(), savedUser.getRoles());
        return LoginResponseDto.builder()
                .user(userMapper.toDto(savedUser))
                .tokens(tokens)
                .build();
    }

    @Transactional
    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> ApiException.unauthorized(ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw ApiException.unauthorized(ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid email or password.");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw ApiException.forbidden(ErrorCode.AUTH_ACCOUNT_DISABLED, "Your account is not active.");
        }

        if (user.isMfaEnabled()) {
            if (!StringUtils.hasText(request.getMfaCode())) {
                throw ApiException.unauthorized(ErrorCode.AUTH_MFA_REQUIRED, "Multi-factor authentication code required.");
            }
        }

        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        AuthTokensDto tokens = jwtTokenProvider.generateTokens(user.getId(), user.getEmail(), user.getRoles());
        return LoginResponseDto.builder()
                .user(userMapper.toDto(user))
                .tokens(tokens)
                .build();
    }

    public void logout(String bearerToken) {
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            try {
                var userId = jwtTokenProvider.getUserIdFromToken(token);
                redisService.revokeRefreshToken(userId.toString());
                jwtTokenProvider.invalidateToken(token);
            } catch (Exception e) {
                log.warn("Error during logout token invalidation: {}", e.getMessage());
            }
        }
    }

    @Transactional(readOnly = true)
    public AuthTokensDto refreshToken(RefreshTokenRequestDto request) {
        String token = request.getRefreshToken();
        if (!jwtTokenProvider.validateToken(token)) {
            throw ApiException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID, "Invalid or expired refresh token.");
        }

        var userId = jwtTokenProvider.getUserIdFromToken(token);
        String storedRefreshToken = redisService.getRefreshToken(userId.toString());

        if (storedRefreshToken != null && !storedRefreshToken.equals(token)) {
            throw ApiException.unauthorized(ErrorCode.AUTH_REFRESH_INVALID, "Refresh token has been revoked.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));

        return jwtTokenProvider.generateTokens(user.getId(), user.getEmail(), user.getRoles());
    }

    @Transactional
    public MessageResponseDto forgotPassword(ForgotPasswordRequestDto request) {
        String cleanEmail = request.getEmail().toLowerCase().trim();
        log.info("Forgot password request received for email: {}", cleanEmail);

        var userOpt = userRepository.findByEmail(cleanEmail);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            log.info("User found for password reset with ID: {}", user.getId());

            passwordResetTokenRepository.deleteByUser(user);

            String resetTokenStr = UUID.randomUUID().toString();

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(resetTokenStr)
                    .user(user)
                    .expiresAt(Instant.now().plus(30, ChronoUnit.MINUTES))
                    .used(false)
                    .build();

            passwordResetTokenRepository.save(resetToken);

            String resetUrl = frontendUrl + "/auth/reset-password?token=" + resetTokenStr;
            log.info("Password reset token generated for user ID: {}. Reset URL: {}", user.getId(), resetUrl);
        } else {
            log.info("Forgot password request for non-existent email: {} (suppressed to prevent enumeration)", cleanEmail);
        }

        return MessageResponseDto.of("If the email exists, a password reset link has been sent.");
    }

    @Transactional
    public MessageResponseDto resetPassword(ResetPasswordRequestDto request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedFalse(request.getToken())
                .orElseThrow(() -> ApiException.badRequest(ErrorCode.VAL_INVALID_PARAMETER, "Invalid or expired password reset token."));

        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest(ErrorCode.VAL_INVALID_PARAMETER, "Password reset token has expired.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        passwordResetTokenRepository.deleteByUser(user);

        log.info("Password successfully reset for user ID: {}", user.getId());
        return MessageResponseDto.of("Password reset successful. You may now sign in with your new password.");
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound(ErrorCode.RES_NOT_FOUND, "User not found."));
        return userMapper.toDto(user);
    }

    @Transactional
    public User processOAuthPostLogin(String email, String firstName, String lastName, String avatarUrl, String provider) {
        String cleanEmail = email.toLowerCase().trim();
        return userRepository.findByEmail(cleanEmail)
                .map(existingUser -> {
                    if (existingUser.getStatus() != UserStatus.ACTIVE) {
                        existingUser.setStatus(UserStatus.ACTIVE);
                    }
                    if (StringUtils.hasText(avatarUrl) && !StringUtils.hasText(existingUser.getAvatarUrl())) {
                        existingUser.setAvatarUrl(avatarUrl);
                    }
                    existingUser.setLastLoginAt(Instant.now());
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    Set<UserRole> roles = new HashSet<>();
                    roles.add(UserRole.CANDIDATE);

                    User newUser = User.builder()
                            .email(cleanEmail)
                            .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .firstName(StringUtils.hasText(firstName) ? firstName.trim() : "Google")
                            .lastName(StringUtils.hasText(lastName) ? lastName.trim() : "User")
                            .avatarUrl(avatarUrl)
                            .status(UserStatus.ACTIVE)
                            .roles(roles)
                            .locale("en-US")
                            .timezone("UTC")
                            .lastLoginAt(Instant.now())
                            .build();

                    log.info("Created new user from OAuth provider {}: {}", provider, cleanEmail);
                    return userRepository.save(newUser);
                });
    }
}

