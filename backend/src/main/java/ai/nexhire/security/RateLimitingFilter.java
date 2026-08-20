package ai.nexhire.security;

import ai.nexhire.config.NexhireProperties;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final NexhireProperties properties;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitingFilter(NexhireProperties properties) {
        this.properties = properties;
    }

    private Bucket createNewBucket(String key) {
        int capacity = 60;
        int refillPerMinute = 60;

        if (properties.rateLimit() != null) {
            if (properties.rateLimit().capacity() != null) {
                capacity = properties.rateLimit().capacity();
            }
            if (properties.rateLimit().refillPerMinute() != null) {
                refillPerMinute = properties.rateLimit().refillPerMinute();
            }
        }

        // Stricter limit for auth endpoints to protect against brute-force attacks
        if (key.startsWith("auth:")) {
            capacity = 15;
            refillPerMinute = 15;
        }

        Refill refill = Refill.intervally(refillPerMinute, Duration.ofMinutes(1));
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (properties.rateLimit() != null && !properties.rateLimit().isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        String path = request.getRequestURI();
        String bucketKey = path.contains("/auth/") ? "auth:" + clientIp : "gen:" + clientIp;

        Bucket bucket = buckets.computeIfAbsent(bucketKey, this::createNewBucket);

        if (bucket.tryConsume(1)) {
            response.addHeader("X-RateLimit-Remaining", String.valueOf(bucket.getAvailableTokens()));
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for client IP: {} path: {}", clientIp, path);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("""
                    {
                        "status": 429,
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": "Too many requests. Rate limit exceeded. Please wait a minute.",
                        "timestamp": "%s"
                    }
                    """.formatted(java.time.Instant.now().toString()));
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
