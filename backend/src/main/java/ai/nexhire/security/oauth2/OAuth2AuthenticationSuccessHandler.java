package ai.nexhire.security.oauth2;

import ai.nexhire.dto.AuthTokensDto;
import ai.nexhire.entity.User;
import ai.nexhire.security.JwtTokenProvider;
import ai.nexhire.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(AuthService authService, JwtTokenProvider jwtTokenProvider) {
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        if (!(authentication.getPrincipal() instanceof OAuth2User oAuth2User)) {
            super.onAuthenticationSuccess(request, response, authentication);
            return;
        }

        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("picture");

        if (firstName == null && name != null) {
            String[] parts = name.split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        if (firstName == null) firstName = "Google";
        if (lastName == null) lastName = "User";

        log.info("Processing OAuth2 login for user email: {}", email);

        User user = authService.processOAuthPostLogin(email, firstName, lastName, avatarUrl, "google");
        AuthTokensDto tokens = jwtTokenProvider.generateTokens(user.getId(), user.getEmail(), user.getRoles());

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/auth/callback/google")
                .queryParam("token", tokens.getAccessToken())
                .queryParam("refreshToken", tokens.getRefreshToken())
                .build().toUriString();

        log.info("OAuth2 login successful. Redirecting user to frontend: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
