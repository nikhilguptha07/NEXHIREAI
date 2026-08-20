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
import ai.nexhire.mapper.UserMapper;
import ai.nexhire.repository.PasswordResetTokenRepository;
import ai.nexhire.repository.UserRepository;
import ai.nexhire.security.Argon2PasswordEncoderWrapper;
import ai.nexhire.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private Argon2PasswordEncoderWrapper passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private RedisService redisService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "frontendUrl", "http://localhost:3000");

        testUser = User.builder()
                .email("alex.candidate@nexhire.ai")
                .firstName("Alex")
                .lastName("Candidate")
                .passwordHash("hashed_password_argon2")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(UserRole.CANDIDATE))
                .build();
        ReflectionTestUtils.setField(testUser, "id", UUID.randomUUID());
    }

    @Test
    @DisplayName("register: successful candidate registration returns user and tokens directly")
    void register_SuccessfulCandidate_ReturnsUserAndTokens() {
        RegisterRequestDto request = RegisterRequestDto.builder()
                .email("alex.candidate@nexhire.ai")
                .password("Password123!")
                .firstName("Alex")
                .lastName("Candidate")
                .acceptTerms(true)
                .build();

        when(userRepository.existsByEmail("alex.candidate@nexhire.ai")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashed_password_argon2");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        AuthTokensDto tokens = AuthTokensDto.builder()
                .accessToken("access.token.jwt")
                .refreshToken("refresh.token.jwt")
                .expiresIn(900)
                .tokenType("Bearer")
                .build();
        when(jwtTokenProvider.generateTokens(eq(testUser.getId()), eq("alex.candidate@nexhire.ai"), any())).thenReturn(tokens);

        UserDto userDto = UserDto.builder()
                .id(testUser.getId())
                .email("alex.candidate@nexhire.ai")
                .firstName("Alex")
                .lastName("Candidate")
                .status(UserStatus.ACTIVE)
                .build();
        when(userMapper.toDto(testUser)).thenReturn(userDto);

        LoginResponseDto response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo("alex.candidate@nexhire.ai");
        assertThat(response.getTokens().getAccessToken()).isEqualTo("access.token.jwt");
    }

    @Test
    @DisplayName("login: active user with correct password returns tokens")
    void login_ActiveUser_ReturnsTokens() {
        LoginRequestDto request = new LoginRequestDto("alex.candidate@nexhire.ai", "Password123!", null, false);

        when(userRepository.findByEmail("alex.candidate@nexhire.ai")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("Password123!", "hashed_password_argon2")).thenReturn(true);
        when(userRepository.save(testUser)).thenReturn(testUser);

        AuthTokensDto tokens = AuthTokensDto.builder()
                .accessToken("access.token.jwt")
                .refreshToken("refresh.token.jwt")
                .expiresIn(900)
                .build();
        when(jwtTokenProvider.generateTokens(eq(testUser.getId()), eq("alex.candidate@nexhire.ai"), any())).thenReturn(tokens);

        UserDto userDto = UserDto.builder()
                .id(testUser.getId())
                .email("alex.candidate@nexhire.ai")
                .status(UserStatus.ACTIVE)
                .build();
        when(userMapper.toDto(testUser)).thenReturn(userDto);

        LoginResponseDto response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getTokens().getAccessToken()).isEqualTo("access.token.jwt");
    }

    @Test
    @DisplayName("forgotPassword: email exists generates 30-min token")
    void forgotPassword_ExistingEmail_GeneratesToken() {
        when(userRepository.findByEmail("alex.candidate@nexhire.ai")).thenReturn(Optional.of(testUser));

        ForgotPasswordRequestDto request = new ForgotPasswordRequestDto("alex.candidate@nexhire.ai");
        MessageResponseDto response = authService.forgotPassword(request);

        assertThat(response.getMessage()).isEqualTo("If the email exists, a password reset link has been sent.");

        verify(passwordResetTokenRepository, times(1)).deleteByUser(testUser);
        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository, times(1)).save(tokenCaptor.capture());

        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertThat(savedToken.getUser()).isEqualTo(testUser);
        assertThat(savedToken.isUsed()).isFalse();
        assertThat(savedToken.getExpiresAt()).isAfter(Instant.now().plus(29, ChronoUnit.MINUTES));
    }

    @Test
    @DisplayName("forgotPassword: email does not exist returns non-revealing message")
    void forgotPassword_NonExistingEmail_ReturnsGenericMessageWithoutRevealing() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        ForgotPasswordRequestDto request = new ForgotPasswordRequestDto("nonexistent@example.com");
        MessageResponseDto response = authService.forgotPassword(request);

        assertThat(response.getMessage()).isEqualTo("If the email exists, a password reset link has been sent.");
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("resetPassword: valid token updates password and invalidates token")
    void resetPassword_ValidToken_UpdatesPasswordAndDeletesTokens() {
        PasswordResetToken token = PasswordResetToken.builder()
                .token("valid-uuid-token")
                .user(testUser)
                .expiresAt(Instant.now().plus(20, ChronoUnit.MINUTES))
                .used(false)
                .build();

        when(passwordResetTokenRepository.findByTokenAndUsedFalse("valid-uuid-token")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewStrongP@ss123")).thenReturn("new_hashed_password");

        ResetPasswordRequestDto request = ResetPasswordRequestDto.builder()
                .token("valid-uuid-token")
                .newPassword("NewStrongP@ss123")
                .build();

        MessageResponseDto response = authService.resetPassword(request);

        assertThat(response.getMessage()).contains("Password reset successful");
        assertThat(testUser.getPasswordHash()).isEqualTo("new_hashed_password");
        verify(userRepository, times(1)).save(testUser);
        verify(passwordResetTokenRepository, times(1)).deleteByUser(testUser);
    }

    @Test
    @DisplayName("resetPassword: expired token throws exception")
    void resetPassword_ExpiredToken_ThrowsException() {
        PasswordResetToken expiredToken = PasswordResetToken.builder()
                .token("expired-token")
                .user(testUser)
                .expiresAt(Instant.now().minus(5, ChronoUnit.MINUTES))
                .used(false)
                .build();

        when(passwordResetTokenRepository.findByTokenAndUsedFalse("expired-token")).thenReturn(Optional.of(expiredToken));

        ResetPasswordRequestDto request = ResetPasswordRequestDto.builder()
                .token("expired-token")
                .newPassword("NewStrongP@ss123")
                .build();

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("expired");
    }
}
