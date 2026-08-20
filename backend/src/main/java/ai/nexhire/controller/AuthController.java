package ai.nexhire.controller;

import ai.nexhire.dto.AuthTokensDto;
import ai.nexhire.dto.ForgotPasswordRequestDto;
import ai.nexhire.dto.LoginRequestDto;
import ai.nexhire.dto.LoginResponseDto;
import ai.nexhire.dto.MessageResponseDto;
import ai.nexhire.dto.RefreshTokenRequestDto;
import ai.nexhire.dto.RegisterRequestDto;
import ai.nexhire.dto.ResetPasswordRequestDto;
import ai.nexhire.dto.UserDto;
import ai.nexhire.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}