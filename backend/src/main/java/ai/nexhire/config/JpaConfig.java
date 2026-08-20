package ai.nexhire.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

/**
 * JPA auditing configuration.
 *
 * <p>Wires {@code @CreatedBy} / {@code @LastModifiedBy} to the current
 * authenticated principal from Spring Security, with a fallback to
 * {@code "system"} for anonymous (background) contexts.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableJpaRepositories(basePackages = "ai.nexhire.repository")
public class JpaConfig {

    private static final String SYSTEM_ACTOR = "system";

    @Bean("auditorProvider")
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.ofNullable(SecurityContextHolder.getContext())
                .map(SecurityContext::getAuthentication)
                .filter(Authentication::isAuthenticated)
                .map(Authentication::getName)
                .filter(name -> !"anonymousUser".equals(name))
                .or(() -> Optional.of(SYSTEM_ACTOR));
    }
}
