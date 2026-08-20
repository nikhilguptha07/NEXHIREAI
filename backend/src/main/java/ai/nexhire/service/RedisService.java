package ai.nexhire.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RedisService {

    private static final Logger log = LoggerFactory.getLogger(RedisService.class);
    private final StringRedisTemplate redisTemplate;

    public RedisService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void set(String key, String value, Duration timeout) {
        try {
            redisTemplate.opsForValue().set(key, value, timeout);
        } catch (Exception e) {
            log.warn("Redis set operation failed for key '{}': {}", key, e.getMessage());
        }
    }

    public String get(String key) {
        try {
            return redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            log.warn("Redis get operation failed for key '{}': {}", key, e.getMessage());
            return null;
        }
    }

    public Boolean delete(String key) {
        try {
            return redisTemplate.delete(key);
        } catch (Exception e) {
            log.warn("Redis delete operation failed for key '{}': {}", key, e.getMessage());
            return false;
        }
    }

    public Boolean hasKey(String key) {
        try {
            return redisTemplate.hasKey(key);
        } catch (Exception e) {
            log.warn("Redis hasKey check failed for key '{}': {}", key, e.getMessage());
            return false;
        }
    }

    // ── JWT Blacklisting ──────────────────────────────────────────────────
    public void blacklistToken(String token, Duration expiration) {
        set("jwt:blacklist:" + token, "true", expiration);
    }

    public boolean isTokenBlacklisted(String token) {
        return Boolean.TRUE.equals(hasKey("jwt:blacklist:" + token));
    }

    // ── Refresh Token Store ───────────────────────────────────────────────
    public void storeRefreshToken(String userId, String refreshToken, Duration ttl) {
        set("refreshtoken:" + userId, refreshToken, ttl);
    }

    public String getRefreshToken(String userId) {
        return get("refreshtoken:" + userId);
    }

    public void revokeRefreshToken(String userId) {
        delete("refreshtoken:" + userId);
    }
}
