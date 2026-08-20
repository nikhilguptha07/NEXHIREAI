package ai.nexhire.controller;

import ai.nexhire.dto.AuthTokensDto;
import ai.nexhire.dto.ForgotPasswordRequestDto;
import ai.nexhire.dto.LoginRequestDto;
import ai.nexhire.dto.LoginResponseDto;
import ai.nexhire.dto.MessageResponseDto;
import ai.nexhire.dto.MfaSetupResponseDto;
import ai.nexhire.dto.MfaVerifyRequestDto;
import ai.nexhire.dto.RefreshTokenRequestDto;
import ai.nexhire.dto.RegisterRequestDto;
import ai.nexhire.dto.ResetPasswordRequestDto;
import ai.nexhire.dto.UserDto;
import ai.nexhire.entity.User;
import ai.nexhire.security.JwtTokenProvider;
import ai.nexhire.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public AuthController(AuthService authService, JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        LoginResponseDto response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        LoginResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponseDto> logout(@RequestHeader(value = "Authorization", required = false) String bearerToken) {
        authService.logout(bearerToken);
        return ResponseEntity.ok(MessageResponseDto.of("Logged out successfully."));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthTokensDto> refreshToken(@Valid @RequestBody RefreshTokenRequestDto request) {
        AuthTokensDto tokens = authService.refreshToken(request);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDto> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        MessageResponseDto response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponseDto> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        MessageResponseDto response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserDto currentUser = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(currentUser);
    }

    @PostMapping("/mfa/setup")
    public ResponseEntity<MfaSetupResponseDto> setupMfa(@AuthenticationPrincipal UserDetails userDetails) {
        MfaSetupResponseDto response = authService.setupMfa(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mfa/enable")
    public ResponseEntity<MessageResponseDto> enableMfa(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MfaVerifyRequestDto request) {
        MessageResponseDto response = authService.enableMfa(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mfa/disable")
    public ResponseEntity<MessageResponseDto> disableMfa(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MfaVerifyRequestDto request) {
        MessageResponseDto response = authService.disableMfa(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<LoginResponseDto> verifyMfaLogin(@Valid @RequestBody MfaVerifyRequestDto request) {
        LoginResponseDto response = authService.verifyMfaLogin(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/oauth/google/dev")
    public void devGoogleLogin(
            @RequestParam(value = "email", defaultValue = "nikhilguptha07@gmail.com") String email,
            @RequestParam(value = "name", defaultValue = "Nikhil Guptha") String name,
            HttpServletResponse response) throws IOException {
        String[] parts = name.split("\\s+", 2);
        String firstName = parts[0];
        String lastName = parts.length > 1 ? parts[1] : "User";
        User user = authService.processOAuthPostLogin(email, firstName, lastName, null, "google");
        AuthTokensDto tokens = jwtTokenProvider.generateTokens(user.getId(), user.getEmail(), user.getRoles());
        String targetUrl = frontendUrl + "/auth/callback/google?token=" + tokens.getAccessToken() + "&refreshToken=" + tokens.getRefreshToken();
        response.sendRedirect(targetUrl);
    }
}