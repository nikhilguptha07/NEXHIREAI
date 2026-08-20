package ai.nexhire.security;

import ai.nexhire.config.NexhireProperties;
import ai.nexhire.dto.AuthTokensDto;
import ai.nexhire.entity.UserRole;
import ai.nexhire.service.RedisService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    private final NexhireProperties properties;
    private final RedisService redisService;
    private final SecretKey secretKey;

    public JwtTokenProvider(NexhireProperties properties, RedisService redisService) {
        this.properties = properties;
        this.redisService = redisService;

        String secret = (properties.security() != null && properties.security().jwt() != null
                && properties.security().jwt().secret() != null)
                ? properties.security().jwt().secret()
                : "nexhire_default_super_secret_key_that_is_at_least_64_bytes_long_for_hmac_sha512_security";

        if (secret.getBytes(StandardCharsets.UTF_8).length < 64) {
            secret = String.format("%-64s", secret).replace(' ', '0');
        }

        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public AuthTokensDto generateTokens(UUID userId, String email, Set<UserRole> roles) {
        Instant now = Instant.now();

        Duration accessTtl = properties.security() != null && properties.security().jwt() != null
                ? properties.security().jwt().accessTtl()
                : Duration.ofMinutes(15);

        Duration refreshTtl = properties.security() != null && properties.security().jwt() != null
                ? properties.security().jwt().refreshTtl()
                : Duration.ofDays(30);

        Instant accessExpiry = now.plus(accessTtl);
        Instant refreshExpiry = now.plus(refreshTtl);

        List<String> roleNames = roles.stream().map(Enum::name).collect(Collectors.toList());

        String issuer = (properties.security() != null && properties.security().jwt() != null)
                ? properties.security().jwt().issuer() : "nexhire-ai";

        String accessToken = Jwts.builder()
                .subject(email)
                .claim("userId", userId.toString())
                .claim("roles", roleNames)
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(accessExpiry))
                .signWith(secretKey)
                .compact();

        String refreshToken = Jwts.builder()
                .subject(email)
                .claim("userId", userId.toString())
                .claim("type", "refresh")
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(refreshExpiry))
                .signWith(secretKey)
                .compact();

        try {
            redisService.storeRefreshToken(userId.toString(), refreshToken, refreshTtl);
        } catch (Exception e) {
            log.warn("Could not store refresh token in Redis: {}", e.getMessage());
        }

        return AuthTokensDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(accessTtl.toSeconds())
                .tokenType("Bearer")
                .build();
    }

    public boolean validateToken(String token) {
        if (redisService.isTokenBlacklisted(token)) {
            log.warn("Token is blacklisted");
            return false;
        }
        try {
            Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    public UUID getUserIdFromToken(String token) {
        String userIdStr = getClaims(token).get("userId", String.class);
        return UUID.fromString(userIdStr);
    }

    @SuppressWarnings("unchecked")
    public List<String> getRolesFromToken(String token) {
        return getClaims(token).get("roles", List.class);
    }

    public void invalidateToken(String token) {
        try {
            Claims claims = getClaims(token);
            Date expiration = claims.getExpiration();
            Duration remaining = Duration.between(Instant.now(), expiration.toInstant());
            if (!remaining.isNegative()) {
                redisService.blacklistToken(token, remaining);
            }
        } catch (Exception e) {
            log.warn("Could not extract expiration to blacklist token: {}", e.getMessage());
        }
    }
}
