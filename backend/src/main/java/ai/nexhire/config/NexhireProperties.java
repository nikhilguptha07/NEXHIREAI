package ai.nexhire.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import ai.nexhire.config.NexhireProperties.CorsProps;
import ai.nexhire.config.NexhireProperties.OracleProps;
import ai.nexhire.config.NexhireProperties.RateLimitProps;
import ai.nexhire.config.NexhireProperties.SecurityProps;
import ai.nexhire.config.NexhireProperties.StorageProps;

import java.time.Duration;

/**
 * Root typed configuration for NEXHIRE AI.
 *
 * <p>Binds the {@code nexhire.*} tree from {@code application.yml}.
 * All secrets are read from environment variables at runtime — never hardcoded.
 */
@ConfigurationProperties(prefix = "nexhire")
public record NexhireProperties(
        CorsProps cors,
        SecurityProps security,
        RateLimitProps rateLimit,
        OracleProps oracle,
        StorageProps storage) {

    /** CORS configuration. */
    public record CorsProps(String allowedOrigins) {
        public String[] origins() {
            return allowedOrigins == null || allowedOrigins.isBlank()
                    ? new String[0]
                    : allowedOrigins.split("\\s*,\\s*");
        }
    }

    /** AuthN / AuthZ configuration. */
    public record SecurityProps(JwtProps jwt, Argon2Props argon2) {
        public record JwtProps(
                String secret,
                Integer accessTokenTtlMinutes,
                Integer refreshTokenTtlDays,
                String issuer,
                String audience) {
            public Duration accessTtl() {
                return Duration.ofMinutes(accessTokenTtlMinutes == null ? 15 : accessTokenTtlMinutes);
            }

            public Duration refreshTtl() {
                return Duration.ofDays(refreshTokenTtlDays == null ? 30 : refreshTokenTtlDays);
            }
        }

        public record Argon2Props(
                Integer memoryKib,
                Integer iterations,
                Integer parallelism,
                Integer saltLengthBytes,
                Integer hashLengthBytes) {}
    }

    /** Rate limiting (Bucket4j). */
    public record RateLimitProps(Boolean enabled, Integer capacity, Integer refillPerMinute) {
        public boolean isEnabled() {
            return Boolean.TRUE.equals(enabled);
        }
    }

    /** Oracle 26ai-specific configuration (vectors, schemas, embeddings). */
    public record OracleProps(Schemas schemas, VectorProps vector) {
        public record Schemas(String core, String ai, String audit) {}
        public record VectorProps(
                Integer dimensions,
                String distance,
                String embeddingProvider,
                String embeddingModel) {}
    }

    /** Object storage (MinIO / S3-compatible). */
    public record StorageProps(
            String endpoint,
            String publicEndpoint,
            String accessKey,
            String secretKey,
            String region,
            Buckets buckets) {
        public record Buckets(String resumes, String avatars, String exports) {}
    }
}
