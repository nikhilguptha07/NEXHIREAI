package ai.nexhire.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration — CORS.
 *
 * <p>Allowed origins are sourced from {@code nexhire.cors.allowed-origins}
 * (comma-separated). Credentials are enabled so the JWT refresh cookie works.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

    private final NexhireProperties properties;

    public WebConfig(NexhireProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        String[] origins = properties.cors() != null ? properties.cors().origins() : new String[0];
        log.info("Configuring CORS with allowed origins: {}", String.join(", ", origins));

        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "X-Request-Id", "X-RateLimit-Remaining")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
